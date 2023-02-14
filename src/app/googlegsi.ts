/**
 * NOTE: `this.GAPI_API_KEY` will always be empty unless we use the "private initGapiClient = (): void => {}" style!
 */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="google-one-tap" />
import { CredentialResponse } from 'google-one-tap'
import { IDriveDataFile, IGapiFile, IJournalEntry, IS_LOCALHOST } from './app.types'
import { decodeJwt } from 'jose'

declare global {
	interface Window {
		google: {
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
	//
	private signedInUser = '(none)'
	private googleAuth
	private gapiDataFile: IGapiFile
	private driveDataFile: IDriveDataFile
	//
	private clientCallback: () => void

	constructor(callbackFunc: (() => void)) {
		this.clientCallback = callbackFunc
		this.loadGsiScript()
	}

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
			callback: this.updateSigninStatus,
			auto_select: true,
			cancel_on_tap_outside: true,
			context: 'signin',
		})
		window.google.accounts.id.prompt()
	}

	/** Step 3: check current user's auth state */
	private updateSigninStatus = async (response: CredentialResponse) => {
		console.log('updateSigninStatus!!')
		// TODO: now what???
		console.log(response)
		console.log(response.credential)

		// `credential`: This field is the ID token as a base64-encoded JSON Web Token (JWT) string."
		// https://developers.google.com/identity/gsi/web/reference/js-reference#credential

		const responsePayload = decodeJwt(response.credential)
		console.log('ID: ' + responsePayload.sub)
		console.log('Full Name: ' + responsePayload.name)
		console.log('Given Name: ' + responsePayload.given_name)
		console.log('Family Name: ' + responsePayload.family_name)
		console.log('Image URL: ' + responsePayload.picture)
		console.log('Email: ' + responsePayload.email)

		return

		/*
		{
			"iss": "https://accounts.google.com",
			"nbf": 1676348859,
			"aud": "300205784774-vt1v8lerdaqlnmo54repjmtgo5ckv3c3.apps.googleusercontent.com",
			"sub": "101280436360833726869",
			"email": "gitbrent@gmail.com",
			"email_verified": true,
			"azp": "300205784774-vt1v8lerdaqlnmo54repjmtgo5ckv3c3.apps.googleusercontent.com",
			"name": "Git Brent",
			"picture": "https://lh3.googleusercontent.com/a/AEdFTp4Tw1g8xUq1u8crhAHVBR87CSJNzBTFVN593txN=s96-c",
			"given_name": "Git",
			"family_name": "Brent",
			"iat": 1676349159,
			"exp": 1676352759,
			"jti": "b9d7558a6fda4870c20d68ac47e5f5e3eebf51f9"
		}
	*/

		// OLD BELOW!!!!

		const currentUser = this.googleAuth.currentUser.get()
		const isAuthorized = currentUser?.hasGrantedScopes(this.GAPI_SCOPES) || false
		const userName = currentUser?.getBasicProfile().getName() || ''
		this.signedInUser = isAuthorized ? userName : '(logged out)'

		console.log('userName', userName)
		console.log('isAuthorized', isAuthorized)


		// proceed to load data file if user state is logged in, then they're ready to rock without a click!
		if (isAuthorized) this.listFiles()
		else this.clientCallback()
	}

	/** Step 4: query all app files */
	private async listFiles() {
		gapi.client.drive.files
			.list({ q: 'trashed=false and mimeType = \'application/json\'' })
			.then((response: { body: string }) => {
				const respBody = JSON.parse(response.body)
				const respFiles: IGapiFile[] = respBody.files
				if (IS_LOCALHOST) console.log('respFiles', respFiles)
				const dataFile = respFiles.filter(item => item.name === 'dream-journal.json')[0]
				if (IS_LOCALHOST) console.log('dataFile', dataFile)
				this.gapiDataFile = dataFile
				if (this.gapiDataFile) this.downloadDataFile()
				else this.clientCallback()
			})
	}

	/**
	 * `window.gapi.client.drive.files.get` can only get metadata, contents requires below
	 * @see https://developers.google.com/drive/api/v2/reference/files/get#javascript
	 * @returns
	 */
	private async downloadDataFile() {
		const accessToken = gapi.auth.getToken().access_token

		fetch(`https://www.googleapis.com/drive/v3/files/${this.gapiDataFile.id}?alt=media`, {
			method: 'GET',
			headers: { Authorization: `Bearer ${accessToken}` },
		})
			.then((response) => {
				response
					.arrayBuffer()
					.then((buffer) => {
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
							_isLoading: false,
							_isSaving: false,
							id: this.gapiDataFile.id,
							entries: entries || [],
							modifiedTime: this.gapiDataFile.modifiedTime,
							name: this.gapiDataFile.name,
							size: this.gapiDataFile.size || '',
						}

						// C:
						this.clientCallback()
					})
					.catch((error) => {
						throw new Error(error)
					})
			})
			.catch((error) => {
				if (error.code === '401') {
					//doAuthSignIn()
				} else if (error.code === '503') {
					//let newState = this.state.dataFile
					// TODO: new field like `hasError` to hold "Service Unavailable" etc
				} else {
					console.error ? console.error(error) : console.log(error)
				}
			})
	}

	// TODO: upload https://developers.google.com/drive/api/guides/manage-uploads#node.js
	private async uploadDataFile() {
		// TODO:
	}

	//#region public methods
	/*
	public signIn(): void {
		this.googleAuth.signIn().then(() => {
			this.updateSigninStatus()
		})
	}

	public signOut() {
		this.googleAuth.signOut().then(() => {
			this.updateSigninStatus()
		})
	}
	*/

	//#endregion

	//#region getters

	get dataFile(): IDriveDataFile {
		return this.driveDataFile
	}

	get currentUsername(): string {
		return this.signedInUser
	}

	//#endregion
}
