/**
 * Google Drive access involves two libraries: GSI and GAPI
 * ========================================================
 * - gsi = provides google-one-tap login/auth
 * - gapi = provides ability to perfrom CRUD operations against Drive
 *
 * @see https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#redirecting
 * "While gapi.client is still the recommended choice to access Google APIs, the newer Google Identity Services library should be used for authentication and authorization instead."
 *
 * Design: "Using the token model"
 * @see https://developers.google.com/identity/oauth2/web/guides/use-token-model
 * ========================================================
 *
 * NOTE: `this.GAPI_API_KEY` will always be empty unless we use the "private initGapiClient = (): void => {}" style!
 */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="google-one-tap" />
/// <reference types="gapi" />
import { AuthState, IAuthState, IDriveConfFile, IDriveDataFile, IJournalEntry, IS_LOCALHOST } from './app.types'
import { TokenResponse, IGapiFile, TokenClientConfig } from './googlegsi.types'
import { CredentialResponse } from 'google-one-tap'
import { decodeJwt } from 'jose'

declare global {
	interface Window {
		google: {
			accounts: {
				oauth2: {
					initTokenClient: (config: TokenClientConfig) => { requestAccessToken: () => void }, // google-one-tap types are missing this
					hasGrantedAllScopes: (token: TokenResponse, scope: string) => boolean,
				}
			},
			gsi: () => void,
			load: () => void,
		};
	}
}

export class googlegsi {
	private readonly GAPI_CLIENT_ID = process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_ID || ''
	private readonly GAPI_API_KEY = process.env.REACT_APP_GOOGLE_DRIVE_API_KEY || ''
	private readonly GAPI_DISC_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
	private readonly GAPI_SCOPES = 'https://www.googleapis.com/auth/drive.file'
	private clientCallback: () => void
	private signedInUser = ''
	private isAuthorized = false
	private tokenResponse: TokenResponse
	private gapiConfFile: IGapiFile
	private gapiDataFile: IGapiFile
	private driveConfFile: IDriveConfFile
	private driveDataFile: IDriveDataFile

	constructor(callbackFunc: (() => void)) {
		this.clientCallback = callbackFunc
		this.driveConfFile = {
			id: '',
			dreamIdeas: [],
			lucidGoals: [],
			mildAffirs: [],
			tagTypeAW: [],
			tagTypeCO: [],
			tagTypeFO: [],
			tagTypeAC: [],
		}
		this.mainProcess()
	}

	private mainProcess() {
		// GAPI (1/2)
		if (typeof gapi === 'undefined' || !gapi.client) this.loadGapiScript()

		// GSI (2/2)
		if (typeof window.google === 'undefined' || !window.google) {
			this.loadGsiScript()
		}
		else if (window.google.accounts) {
			// This else if the case where script is loaded (eg: app login button)
			if (!this.signedInUser) this.initGsiClient()
			else this.mainProvessTwo()
		}
	}

	private mainProvessTwo = async () => {
		// STEP 1: now that gsi is init and user is signed-in, get access token
		if (IS_LOCALHOST) console.log('\nGSI-STEP-2: tokenFlow() --------------')
		await this.tokenFlow()
		if (IS_LOCALHOST) console.log(`- tokenResponse.token_type = ${this.tokenResponse?.token_type} `)

		// STEP 2: now that token exists, setup gapi so we can use Drive API's with the token from prev step
		if (IS_LOCALHOST) console.log('\nGSI-STEP-3: initGapiClient() ---------')
		await this.initGapiClient()

		// STEP 3: checks user scopes, sets `isAuthorized`
		if (IS_LOCALHOST) console.log('\nGSI-STEP-4: updateSigninStatus() -----')
		await this.updateUserAuthStatus()

		// STEP 4: download app files if authorized
		if (IS_LOCALHOST) console.log('\nGSI-STEP-5: listFiles() --------------')
		if (this.isAuthorized) await this.listFiles()

		// FINALLY: callback to notify class/data is loaded
		this.clientCallback()
	}

	//#region GAPI
	private loadGapiScript = (): void => {
		const script = document.createElement('script')
		script.src = 'https://apis.google.com/js/api.js'
		// Load gapi script and load gapi drive client (`drive` must be loaded!)
		script.onload = () => gapi.load('client', () => gapi.client.load('drive', 'v2'))
		document.body.appendChild(script)
	}

	/** called after gsi, not called from script load above */
	private initGapiClient = async () => {
		return await gapi.client.init({
			apiKey: this.GAPI_API_KEY,
			clientId: this.GAPI_CLIENT_ID,
			scope: this.GAPI_SCOPES,
			discoveryDocs: this.GAPI_DISC_DOCS
		})

	}
	//#endregion

	//#region GSI
	/** STEP 1: load <script> */
	private loadGsiScript = (): void => {
		const script = document.createElement('script')
		script.src = 'https://accounts.google.com/gsi/client'
		script.async = true
		script.defer = true
		script.onload = this.initGsiClient
		document.body.appendChild(script)
	}

	/**
	 * STEP 2: init <script>
	 * @see https://developers.google.com/identity/gsi/web/guides/use-one-tap-js-api
	 */
	private initGsiClient = (): void => {
		window.google.accounts.id.initialize({
			client_id: this.GAPI_CLIENT_ID,
			callback: this.initGsiCallback,
			auto_select: true,
			cancel_on_tap_outside: true,
			context: 'signin',
		})
		window.google.accounts.id.prompt()
	}

	/**
	 * STEP 3: process cred resp
	 */
	private initGsiCallback = async (response: CredentialResponse) => {
		/**
		 * @note `credential`: This field is the ID token as a base64-encoded JSON Web Token (JWT) string.
		 * @see https://developers.google.com/identity/gsi/web/reference/js-reference#credential
		 */
		const responsePayload = decodeJwt(response.credential)

		// set signed in user
		if (IS_LOCALHOST) console.log('\nGSI-STEP-1: responsePayload ----------')
		this.signedInUser = responsePayload?.name?.toString() || ''
		if (IS_LOCALHOST) console.log('this.signedInUser', this.signedInUser)

		// Done:
		this.mainProvessTwo()
	}

	/**
	 * STEP 4: request access token
	 * @see https://developers.google.com/identity/oauth2/web/guides/use-token-model#working_with_tokens
	 * @see https://developers.google.com/identity/oauth2/web/guides/migration-to-gis#token_request
	 */
	private tokenFlow = async () => {
		return new Promise((resolveOuter) => {
			const client = window.google.accounts.oauth2.initTokenClient({
				client_id: this.GAPI_CLIENT_ID,
				scope: this.GAPI_SCOPES,
				callback: (tokenResponse: TokenResponse) => {
					// A: capture token
					this.tokenResponse = tokenResponse
					if (IS_LOCALHOST) console.log('- tokenResponse', this.tokenResponse.token_type)
					resolveOuter(true)
				},
			})
			client.requestAccessToken()
		})
	}

	/**
	 * Sets if user is authorized. Called after both scripts are init.
	 * @see https://developers.google.com/identity/oauth2/web/guides/migration-to-gis#token_and_consent_response
	 */
	private updateUserAuthStatus = async () => {
		this.isAuthorized = window.google.accounts.oauth2.hasGrantedAllScopes(this.tokenResponse, this.GAPI_SCOPES) || false

		if (IS_LOCALHOST) {
			if (!this.isAuthorized) console.warn('Unauthorized?!')
			else console.log('- this.isAuthorized = ', this.isAuthorized)
		}

		return
	}
	//#endregion

	//#region file operations
	private listFiles = async () => {
		const response: { body: string } = await gapi.client.drive.files.list({ q: 'trashed=false and mimeType = \'application/json\'' })
		const respBody = JSON.parse(response.body)
		const respFiles: IGapiFile[] = respBody.items
		if (IS_LOCALHOST) console.log(`- respFiles.length = ${respFiles.length}`)

		const confFile = respFiles.filter(item => item.title === 'dream-journal-conf.json')[0]
		this.gapiConfFile = confFile
		if (IS_LOCALHOST) console.log(`- this.gapiConfFile id = ${this.gapiConfFile.id}`)

		const dataFile = respFiles.filter(item => item.title === 'dream-journal.json')[0]
		this.gapiDataFile = dataFile
		if (IS_LOCALHOST) console.log(`- this.gapiDataFile id = ${this.gapiDataFile.id}`)

		if (this.gapiConfFile) await this.downloadConfFile()
		if (this.gapiDataFile) await this.downloadDataFile()

		if (IS_LOCALHOST) {
			console.log('- Checkpoint: both data files loaded')
			console.log(`- data.entries.length = ${this.driveDataFile.entries.length}`)
		}

		return
	}

	private downloadConfFile = async () => {
		const response = await fetch(`https://www.googleapis.com/drive/v3/files/${this.gapiConfFile.id}?alt=media`, {
			method: 'GET',
			headers: { Authorization: `Bearer ${this.tokenResponse.access_token}` },
		})
		const buffer = await response.arrayBuffer()
		const decoded: string = new TextDecoder('utf-8').decode(buffer)
		let json: object = {}

		// A:
		if (decoded?.length > 0) {
			try {
				// NOTE: Initial dream-journal file is empty!
				json = JSON.parse(decoded)
			} catch (ex) {
				alert(ex)
				console.error ? console.error(ex) : console.log(ex)
			}
		}

		// B:
		this.driveConfFile = {
			id: this.gapiConfFile.id,
			dreamIdeas: json['dreamIdeas'] || [],
			lucidGoals: json['lucidGoals'] || [],
			mildAffirs: json['mildAffirs'] || [],
			tagTypeAW: json['tagTypeAW'] || [],
			tagTypeCO: json['tagTypeCO'] || [],
			tagTypeFO: json['tagTypeFO'] || [],
			tagTypeAC: json['tagTypeAC'] || [],
		}

		// C: fulfill promise
		return
	}

	/**
	 * `gapi.client.drive.files.get` can only get metadata, retrieving contents requires this
	 * @see https://developers.google.com/drive/api/v2/reference/files/get#javascript
	 * @returns
	 */
	private downloadDataFile = async () => {
		const response = await fetch(`https://www.googleapis.com/drive/v3/files/${this.gapiDataFile.id}?alt=media`, {
			method: 'GET',
			headers: { Authorization: `Bearer ${this.tokenResponse.access_token}` },
		})
		const buffer = await response.arrayBuffer()
		const decoded: string = new TextDecoder('utf-8').decode(buffer)
		let json: object = {}
		let entries: IJournalEntry[] = []

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
		this.driveDataFile = {
			id: this.gapiDataFile.id,
			entries: entries || [],
			modifiedTime: this.gapiDataFile.modifiedDate,
			name: this.gapiDataFile.title,
			size: this.gapiDataFile.fileSize || '',
		}

		// C:
		return
	}

	// TODO: upload https://developers.google.com/drive/api/guides/manage-uploads#node.js
	private async uploadDataFile() {
		// TODO:
	}
	//#endregion

	//#region getters
	get confFile(): IDriveConfFile {
		return this.driveConfFile
	}

	get dataFile(): IDriveDataFile {
		return this.driveDataFile
	}

	get authState(): IAuthState {
		return {
			status: this.isAuthorized ? AuthState.Authenticated : AuthState.Unauthenticated,
			userName: this.signedInUser,
			userPhoto: ''
		}
	}
	//#endregion

	//#region public methods
	public doAuthSignIn = () => {
		console.log('TODO: doAuthSignIn')
	}

	public doAuthSignOut = () => {
		console.log('TODO: doAuthSignIn')
	}

	public doSaveDataFile = async () => {
		return 'TODO:'
	}
	//#endregion
}
