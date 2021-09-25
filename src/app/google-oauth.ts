/**
 * NAME: google-oauth.js
 * DESC: Singleton instance for oatuh vars/methods
 * @see https://developers.google.com/drive/api/v3/appdata
 * @see https://developers.google.com/drive/api/v3/search-parameters#file_fields
 * FUTURE: [Auth redirect](https://reacttraining.com/react-router/web/example/auth-workflow)
 */
import { AuthState, ConfMetaCats, IAuthState, IDriveConfFile, IDriveDataFile, IJournalEntry, SignInventoryType } from './app.types'

const GITBRENT_CLIENT_ID = '300205784774-vt1v8lerdaqlnmo54repjmtgo5ckv3c3.apps.googleusercontent.com'
const GDRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'
const FIREBASE_URL = 'https://brain-cloud-dream-journal.firebaseapp.com'
const LOCALHOST_URL = 'http://localhost:8080'
const CONF_FILE_HEADER = {
	name: 'dream-journal-conf.json',
	description: 'Brain Cloud Dream Journal configuration file',
	mimeType: 'application/json',
}
const DATA_FILE_HEADER = {
	name: 'dream-journal.json',
	description: 'Brain Cloud Dream Journal data file',
	mimeType: 'application/json',
}

let gAuthState: IAuthState = { status: AuthState.Unauthenticated, userName: '', userPhoto: '' }
let gConfFile: IDriveConfFile = null
let gDataFile: IDriveDataFile = null
let gAuthCallback: Function = null
let gConfCallback: Function = null
let gDataCallback: Function = null
let gBusyLoadCallback: Function = null

// PUBLIC METHODS ------------------------------------------------------------

export function authStateCallback(callback: Function) {
	gAuthCallback = callback
}
export function confFileCallback(callback: Function) {
	gConfCallback = callback
}
export function dataFileCallback(callback: Function) {
	gDataCallback = callback
}
export function busyLoadCallback(callback: Function) {
	gBusyLoadCallback = callback
}
// TODO: export function busySaveCallback(callback: Function) {

export function doAuthUpdate() {
	// A: Get *current* value for `access_token` from location.href
	parseStoreAccessKey()

	// B: Grab newest token
	let params = localStorage.getItem('oauth2-params') ? JSON.parse(localStorage.getItem('oauth2-params')) : null

	// C: Check state
	if (params) {
		/**
		 * NOTE: Docs show this: 'https://www.googleapis.com/drive/v3/about?fields=user&access_token=' + params['access_token']);
		 * But it does not work! "Unauthorized" every time!
		 * SOLN: Use `headers` for "Bearer" value
		 */
		fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				Authorization: 'Bearer ' + params['access_token'],
			},
		}).then((response) => {
			response
				.json()
				.then((json) => {
					if (json && json.error && json.error.code) {
						// NOTE: Google returns an error object `{error:{errors:[], code:401, message:"..."}}`
						throw new Error(json.error)
					} else if (json && json.user) {
						// A: Set user states
						gAuthState = {
							status: AuthState.Authenticated,
							userName: json.user.displayName || null,
							userPhoto: json.user.photoLink || null,
						}

						// B: Notify listeners
						if (gAuthCallback) gAuthCallback(gAuthState)

						// C: Go ahead and load data file since we need it
						doGetAppFiles()
					}
				})
				.catch((error) => {
					if (error.code === '401') {
						gAuthState.status = AuthState.Expired
					} else {
						gAuthState.status = AuthState.Unauthenticated
						console.error ? console.error(error) : console.log(error)
					}
					if (gAuthCallback) gAuthCallback(gAuthState)
				})
		})
	}
}
/**
 * @see https://developers.google.com/identity/protocols/OAuth2UserAgent
 * @see https://developers.google.com/identity/protocols/OAuth2UserAgent#example
 */
export function doAuthSignIn() {
	// Google's OAuth 2.0 endpoint for requesting an access token
	let oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth'

	// Create <form> element to submit parameters to OAuth 2.0 endpoint.
	let form = document.createElement('form')
	form.setAttribute('method', 'GET') // Send as a GET request.
	form.setAttribute('action', oauth2Endpoint)

	// Parameters to pass to OAuth 2.0 endpoint.
	let params = {
		client_id: GITBRENT_CLIENT_ID,
		scope: GDRIVE_SCOPE,
		redirect_uri: location.href.indexOf('8080') > -1 ? LOCALHOST_URL : FIREBASE_URL,
		response_type: 'token',
		include_granted_scopes: 'true',
		state: 'pass-through value',
	}

	// Add form parameters as hidden input values.
	for (let p in params) {
		let input = document.createElement('input')
		input.setAttribute('type', 'hidden')
		input.setAttribute('name', p)
		input.setAttribute('value', params[p])
		form.appendChild(input)
	}

	// Add form to page and submit it to open the OAuth 2.0 endpoint.
	document.body.appendChild(form)
	form.submit()
}
/**
 * @see: https://developers.google.com/identity/protocols/OAuth2UserAgent#tokenrevoke
 */
export function doAuthSignOut() {
	let params = JSON.parse(localStorage.getItem('oauth2-params'))

	// FUTURE: Prompt for Save!!!

	fetch(`https://accounts.google.com/o/oauth2/revoke?token=${params['access_token']}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	})
		.then((_response) => {
			gAuthState = {
				status: AuthState.Unauthenticated,
				userName: '',
				userPhoto: '',
			}
			if (gAuthCallback) gAuthCallback({ ...gAuthState })
			gConfFile = null
			gDataFile = null
			if (gDataCallback) gDataCallback(null)

			localStorage.setItem('journal-selected-fileid', null)
		})
		.catch((error) => {
			console.error ? console.error(error) : console.log(error)
		})
}

// PUBLIC METHODS: CONF FILE -------------------------------------------------

/**
 * @param dreamIdeas new ideas
 */
export function doEditConf_DreamIdeas(dreamIdeas: ConfMetaCats[]) {
	if (!gConfFile || !gConfFile.id) throw new Error('No ConfFile!')
	gConfFile.dreamIdeas = dreamIdeas
}
/**
 * @param lucidGoals new goals
 */
export function doEditConf_LucidGoals(lucidGoals: ConfMetaCats) {
	if (!gConfFile || !gConfFile.id) throw new Error('No ConfFile!')
	gConfFile.lucidGoals = lucidGoals
}
/**
 * @param mildAffirs new mild affirmations
 */
export function doEditConf_MildAffirs(mildAffirs: ConfMetaCats[]) {
	if (!gConfFile || !gConfFile.id) throw new Error('No ConfFile!')
	gConfFile.mildAffirs = mildAffirs
}
/**
 * @param type dreamsign inventory type
 * @param tags updated tags
 */
export function doEditTagTypes(type: SignInventoryType, tags: string[]) {
	if (!gConfFile || !gConfFile.id) throw new Error('No ConfFile!')
	gConfFile[`tagType${type}`] = tags
}

export function doSaveConfFile(): Promise<any> {
	return new Promise((resolve, reject) => {
		let params = JSON.parse(localStorage.getItem('oauth2-params'))

		let reqBody: string =
			'--foo_bar_baz\nContent-Type: application/json; charset=UTF-8\n\n' +
			JSON.stringify(CONF_FILE_HEADER) +
			'\n' +
			'--foo_bar_baz\nContent-Type: application/json\n\n' +
			JSON.stringify(gConfFile, null, 2) +
			'\n' +
			'--foo_bar_baz--'
		let reqEnd = encodeURIComponent(reqBody).match(/%[89ABab]/g) || ''

		let requestHeaders: any = {
			Authorization: `Bearer ${params['access_token']}`,
			'Content-Type': 'multipart/related; boundary=foo_bar_baz',
			'Content-Length': reqBody.length + reqEnd.length,
		}

		fetch(`https://www.googleapis.com/upload/drive/v3/files/${gConfFile.id}?uploadType=multipart`, {
			method: 'PATCH',
			headers: requestHeaders,
			body: reqBody,
		})
			.then((response) => {
				response
					.json()
					.then((json) => {
						let data = json

						// A: Check for errors
						if (data && data.error && data.error.code) throw new Error(data.error.message) // Google error: `{error:{errors:[], code:401, message:"..."}}`

						// B: refresh file list (to update "size", "modified")
						doGetAppFiles()

						// Done
						resolve(true)
					})
					.catch((error) => {
						console.error ? console.error(error) : console.log(error)
						reject(error || 'UNABLE TO SAVE CONF')
					})
			})
			.catch((error) => {
				if (error.code === '401') {
					doAuthSignIn()
				} else {
					console.error ? console.error(error) : console.log(error)
					reject(error || 'UNABLE TO SAVE CONF')
				}
			})
	})
}

// PUBLIC METHODS: DATA FILE -------------------------------------------------

/**
 * Add new `IJournalEntry` into selected `IDriveFile`
 * @param entry new juornal entry
 */
export function doEntryAdd(entry: IJournalEntry) {
	if (!gDataFile || !gDataFile.entries) throw new Error('No datafile!')
	gDataFile.entries.push(entry)
	gDataFile.entries.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
}
/**
 * Edit existing `IJournalEntry` from selected `IDriveFile`
 */
export function doEntryEdit(entry: IJournalEntry, origEntryDate?: IJournalEntry['entryDate']) {
	if (!gDataFile || !gDataFile.entries) throw new Error('No datafile!')

	let editEntry = gDataFile.entries.filter((item) => item.entryDate === (origEntryDate && origEntryDate !== entry.entryDate ? origEntryDate : entry.entryDate))[0]
	if (!editEntry) throw new Error('Unable to find entry!')

	Object.keys(entry).forEach((key) => {
		editEntry[key] = entry[key]
	})
}
/**
 * Edit existing `IJournalEntry` from selected `IDriveFile`
 */
export function doEntryDelete(entryDate: IJournalEntry['entryDate']) {
	if (!gDataFile || !gDataFile.entries) throw new Error('No datafile!')

	let delIdx = gDataFile.entries.findIndex((item) => item.entryDate === entryDate)
	if (delIdx === -1) throw new Error('Unable to find entry!')

	gDataFile.entries.splice(delIdx, 1)
}

/**
 * @see: https://developers.google.com/drive/api/v3/reference/files/update
 */
export function doSaveDataFile(): Promise<any> {
	return new Promise((resolve, reject) => {
		let params = JSON.parse(localStorage.getItem('oauth2-params'))

		// DATA FIXES: (20191101):
		/*
			newState.entries.forEach(entry => {
				entry.dreams.forEach(dream => {
					// WORKED! if (typeof dream.dreamSigns === 'string') dream.dreamSigns = (dream.dreamSigns as string).split(',')
					// WORKED! dream.dreamSigns = dream.dreamSigns.map(sign=>{ return sign.trim() })
					// WORKED (20210127) dream.dreamSigns = dream.dreamSigns.map((sign) => sign.toLowerCase().trim())
				})
			})
		*/

		// A: Fix [null] dates that can be created by import data/formatting, etc.
		let entriesFix = gDataFile.entries
		entriesFix.forEach((entry, idx) => (entry.entryDate = entry.entryDate ? entry.entryDate : `1999-01-0${idx + 1}`))

		// B: Sort by `entryDate`
		let jsonBody: object = {
			entries: entriesFix.sort((a, b) => (a.entryDate > b.entryDate ? 1 : -1)),
		}

		// C: Write file
		let reqBody: string =
			'--foo_bar_baz\nContent-Type: application/json; charset=UTF-8\n\n' +
			JSON.stringify(DATA_FILE_HEADER) +
			'\n' +
			'--foo_bar_baz\nContent-Type: application/json\n\n' +
			JSON.stringify(jsonBody, null, 2) +
			'\n' +
			'--foo_bar_baz--'
		let reqEnd = encodeURIComponent(reqBody).match(/%[89ABab]/g) || ''

		let requestHeaders: any = {
			Authorization: 'Bearer ' + params['access_token'],
			'Content-Type': 'multipart/related; boundary=foo_bar_baz',
			'Content-Length': reqBody.length + reqEnd.length,
		}

		fetch(`https://www.googleapis.com/upload/drive/v3/files/${gDataFile.id}?uploadType=multipart`, {
			method: 'PATCH',
			headers: requestHeaders,
			body: reqBody,
		})
			.then((response) => {
				response
					.json()
					.then((json) => {
						let data = json

						// A: Check for errors
						if (data && data.error && data.error.code) throw new Error(data.error.message) // Google error: `{error:{errors:[], code:401, message:"..."}}`

						// B: refresh file list (to update "size", "modified")
						doGetAppFiles()

						// Done
						resolve(true)
					})
					.catch((error) => {
						console.error ? console.error(error) : console.log(error)
						reject(error || 'UNABLE TO SAVE')
					})
			})
			.catch((error) => {
				if (error.code === '401') {
					doAuthSignIn()
				} else {
					console.error ? console.error(error) : console.log(error)
					reject(error || 'UNABLE TO SAVE')
				}
			})
	})
}

/**
 * Does this entry date already exist in the datafile
 */
export function doesEntryDateExist(checkDate: string): boolean {
	return gDataFile.entries.filter((item) => item.entryDate === checkDate).length > 0 ? true : false
}

/**
 * Does this entry date already exist in the datafile
 */
export function getUniqueDreamTags(): string[] {
	let arrTags: string[] = []

	if (!gDataFile || !gDataFile.entries) return []

	gDataFile.entries
		.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
		.forEach((entry) =>
			entry.dreams.forEach((dream) =>
				dream.dreamSigns.forEach((tag) => {
					if (arrTags.indexOf(tag) === -1) arrTags.push(tag)
				})
			)
		)

	return arrTags.sort()
}

// INTERNAL METHODS ----------------------------------------------------------

function doGetAppFiles() {
	let params = JSON.parse(localStorage.getItem('oauth2-params'))
	if (!params || !params['access_token']) {
		doAuthSignIn()
		return
	}

	if (gBusyLoadCallback) gBusyLoadCallback(true)

	/**
	 * GET https://www.googleapis.com/drive/v3/files/
	 * Authorization: Bearer [YOUR_ACCESS_TOKEN]
	 * Accept: application/json
	 */
	fetch('https://www.googleapis.com/drive/v3/files?fields=files/id,files/name,files/size,files/modifiedTime', {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			Authorization: `Bearer ${params['access_token']}`,
		},
	})
		.then((response) => {
			response
				.json()
				.then((json) => {
					let data = json

					// A: Check for errors
					// NOTE: Google returns an error object `{error:{errors:[], code:401, message:"..."}}`
					if (data && data.error && data.error.code) throw new Error(data.error)

					// DATA FILE
					// Grab datafile (id, name, size, etc) (not the contents!)
					gDataFile = data.files.filter((file: any) => file.name === DATA_FILE_HEADER.name)[0] || null
					// Create datafile if needed, otherwise, load file contents
					if (gDataFile) doSelectDataFile()
					else doCreateDataFile()

					// CONF FILE
					gConfFile = data.files.filter((file: any) => file.name === CONF_FILE_HEADER.name)[0] || null
					if (gConfFile) doSelectConfFile()
					else doCreateConfFile()
				})
				.catch((error) => {
					throw new Error(error)
				})
		})
		.catch((error) => {
			if (gBusyLoadCallback) gBusyLoadCallback(false)
			if (error.code === '401') {
				doAuthSignIn()
			} else {
				console.error ? console.error(error) : console.log(error)
			}
		})
}

/**
 * @see: https://developers.google.com/drive/api/v3/multipart-upload
 */
function doCreateConfFile() {
	let params = JSON.parse(localStorage.getItem('oauth2-params'))
	let reqBody = `--foo_bar_baz\nContent-Type: application/json; charset=UTF-8\n\n${JSON.stringify(
		CONF_FILE_HEADER
	)}\n--foo_bar_baz\nContent-Type: application/json\n\n\n--foo_bar_baz--`
	let reqEnd = encodeURIComponent(reqBody).match(/%[89ABab]/g) || ''

	let requestHeaders: any = {
		Authorization: `Bearer ${params['access_token']}`,
		'Content-Type': 'multipart/related; boundary=foo_bar_baz',
		'Content-Length': reqBody.length + reqEnd.length,
	}

	if (!confirm('Create conf file?')) return

	fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
		method: 'POST',
		headers: requestHeaders,
		body: reqBody,
	})
		.then((response) => {
			response
				.json()
				.then((_json) => {
					doGetAppFiles()
				})
				.catch((error) => {
					throw new Error(error)
				})
		})
		.catch((error) => {
			if (error.code === '401') {
				doAuthSignIn()
			} else {
				console.error ? console.error(error) : console.log(error)
			}
		})
}

/**
 * @see: https://developers.google.com/drive/api/v3/multipart-upload
 */
function doCreateDataFile() {
	let params = JSON.parse(localStorage.getItem('oauth2-params'))
	let reqBody =
		'--foo_bar_baz\nContent-Type: application/json; charset=UTF-8\n\n' +
		JSON.stringify(DATA_FILE_HEADER) +
		'\n' +
		'--foo_bar_baz\nContent-Type: application/json\n\n' +
		'' +
		'\n' +
		'--foo_bar_baz--'
	let reqEnd = encodeURIComponent(reqBody).match(/%[89ABab]/g) || ''

	let requestHeaders: any = {
		Authorization: `Bearer ${params['access_token']}`,
		'Content-Type': 'multipart/related; boundary=foo_bar_baz',
		'Content-Length': reqBody.length + reqEnd.length,
	}

	if (!confirm('Create data file?')) return

	fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
		method: 'POST',
		headers: requestHeaders,
		body: reqBody,
	})
		.then((response) => {
			response
				.json()
				.then((_json) => {
					doGetAppFiles()
				})
				.catch((error) => {
					throw new Error(error)
				})
		})
		.catch((error) => {
			if (error.code === '401') {
				doAuthSignIn()
			} else {
				console.error ? console.error(error) : console.log(error)
			}
		})
}

/**
 * @see: https://developers.google.com/drive/api/v3/manage-downloads
 */
function doSelectConfFile() {
	// A
	let params = JSON.parse(localStorage.getItem('oauth2-params'))

	// B
	fetch(`https://www.googleapis.com/drive/v3/files/${gConfFile.id}?alt=media`, {
		method: 'GET',
		headers: { Authorization: `Bearer ${params['access_token']}` },
	})
		.then((response) => {
			response
				.arrayBuffer()
				.then((buffer) => {
					let decoded: string = new TextDecoder('utf-8').decode(buffer)
					let json: Object = {}

					// A:
					if (decoded && decoded.length > 0) {
						try {
							// NOTE: Initial dream-journal file is empty!
							json = JSON.parse(decoded)
						} catch (ex) {
							alert(ex)
							console.error ? console.error(ex) : console.log(ex)
						}
					}

					// B:
					gConfFile.dreamIdeas = json['dreamIdeas'] || []
					gConfFile.lucidGoals = json['lucidGoals'] || []
					gConfFile.mildAffirs = json['mildAffirs'] || []
					gConfFile.tagTypeAW = json['tagTypeAW'] || []
					gConfFile.tagTypeCO = json['tagTypeCO'] || []
					gConfFile.tagTypeFO = json['tagTypeFO'] || []
					gConfFile.tagTypeAC = json['tagTypeAC'] || []

					// C:
					if (gConfCallback) gConfCallback(JSON.parse(JSON.stringify(gConfFile)) as IDriveConfFile)
					if (gBusyLoadCallback) gBusyLoadCallback(false)
				})
				.catch((error) => {
					throw new Error(error)
				})
		})
		.catch((error) => {
			if (error.code === '401') {
				doAuthSignIn()
			} else if (error.code === '503') {
				//let newState = this.state.dataFile
				// TODO: new field like `hasError` to hold "Service Unavailable" etc
			} else {
				console.error ? console.error(error) : console.log(error)
			}
		})
}

/**
 * @see: https://developers.google.com/drive/api/v3/manage-downloads
 */
function doSelectDataFile() {
	// A
	let params = JSON.parse(localStorage.getItem('oauth2-params'))

	// B
	fetch(`https://www.googleapis.com/drive/v3/files/${gDataFile.id}?alt=media`, {
		method: 'GET',
		headers: { Authorization: `Bearer ${params['access_token']}` },
	})
		.then((response) => {
			response
				.arrayBuffer()
				.then((buffer) => {
					let decoded: string = new TextDecoder('utf-8').decode(buffer)
					let json: Object = {}
					let entries: IJournalEntry[]

					// A:
					if (decoded && decoded.length > 0) {
						try {
							// NOTE: Initial dream-journal file is empty!
							json = JSON.parse(decoded)
							entries = json['entries']
						} catch (ex) {
							alert(ex)
							console.error ? console.error(ex) : console.log(ex)
						}
					}

					// B:
					gDataFile.entries = entries || []

					// C:
					if (gDataCallback) gDataCallback(JSON.parse(JSON.stringify(gDataFile)) as IDriveDataFile)
					if (gBusyLoadCallback) gBusyLoadCallback(false)
				})
				.catch((error) => {
					throw new Error(error)
				})
		})
		.catch((error) => {
			if (error.code === '401') {
				doAuthSignIn()
			} else if (error.code === '503') {
				//let newState = this.state.dataFile
				// TODO: new field like `hasError` to hold "Service Unavailable" etc
			} else {
				console.error ? console.error(error) : console.log(error)
			}
		})
}

// UTILITY FUNCS -------------------------------------------------------------

function parseStoreAccessKey() {
	let fragmentString = location.hash.substring(1)

	// Parse query string to see if page request is coming from OAuth 2.0 server.
	let params = {}
	let regex = /([^&=]+)=([^&]*)/g
	let m: RegExpExecArray

	while ((m = regex.exec(fragmentString))) {
		params[decodeURIComponent(m[1])] = decodeURIComponent(m[2])
	}
	if (Object.keys(params).length > 0) {
		localStorage.setItem('oauth2-params', JSON.stringify(params))
	}
}
