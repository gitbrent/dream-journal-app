/**
 * Google Drive access involves two libraries: GSI and GAPI
 * ========================================================
 * - gsi = provides google-one-tap login/auth
 * - gapi = provides ability to perfrom CRUD operations against Drive
 *
 * Source: [Google documentation](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#redirecting),
 * "While gapi.client is still the recommended choice to access Google APIs, the newer Google Identity Services library should be used for authentication and authorization instead."
 *
 * ========================================================
 * NOTE: `this.GAPI_API_KEY` will always be empty unless we use the "private initGapiClient = (): void => {}" style!
 */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="google-one-tap" />
/// <reference types="gapi" />
import { IDriveDataFile, IJournalEntry, IS_LOCALHOST } from './app.types'
import { CredentialResponse } from 'google-one-tap'
import { TokenResponse, IGapiFile, TokenClientConfig } from './googlegsi.types'
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
	//
	private signedInUser = '(none)'
	private gapiDataFile: IGapiFile
	private driveDataFile: IDriveDataFile
	private isGapiLoaded = false
	private tokenResponse: TokenResponse
	//
	private clientCallback: () => void

	constructor(callbackFunc: (() => void)) {
		this.clientCallback = callbackFunc
		this.loadGapiScript()
		this.loadGsiScript()
	}

	// TODO: WIP: https://stackoverflow.com/a/71394671/12519131
	// https://developers.google.com/identity/oauth2/web/guides/migration-to-gis#gis-and-gapi
	// WIP: FINALLY!!! HERE IS GOOGLE USING BOTH GIS AND GAPI:
	// https://developers.google.com/identity/oauth2/web/guides/migration-to-gis#the_new_way
	// BUT: this is easier duh
	// @see https://developers.google.com/identity/oauth2/web/guides/migration-to-gis#the_new_way_2
	//
	// "Complete example" from google:
	// @see https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#example

	//#region GAPI

	private loadGapiScript = (): void => {
		const script = document.createElement('script')
		script.src = 'https://apis.google.com/js/api.js'
		script.onload = () => gapi.load('client', () => gapi.client.load('drive', 'v2', () => { this.isGapiLoaded = true }))
		document.body.appendChild(script)
	}

	private initGapiClient = () => {
		gapi.client.init({
			apiKey: this.GAPI_API_KEY,
			clientId: this.GAPI_CLIENT_ID,
			scope: this.GAPI_SCOPES,
			discoveryDocs: this.GAPI_DISC_DOCS
		}).then(() => {
			const auth2 = gapi.auth2.getAuthInstance()
			auth2.isSignedIn.listen(this.updateSigninStatus)
		})
	}

	private updateSigninStatus = async () => {
		// [docs say use hasGrAllSc](https://developers.google.com/identity/oauth2/web/guides/migration-to-gis#token_and_consent_response)
		const isAuthorized = window.google.accounts.oauth2.hasGrantedAllScopes(this.tokenResponse, this.GAPI_SCOPES) || false
		console.log('isAuthorized', isAuthorized)
		// Assuming this is the second part of our user flow (that being GIS is loaded and init), we're clear to read/write from Drive
		if (isAuthorized && this.tokenResponse?.access_token) this.listFiles()
		else console.log('FUCK!!')
	}

	//#endregion

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
		const client = window.google.accounts.oauth2.initTokenClient({
			client_id: this.GAPI_CLIENT_ID,
			scope: this.GAPI_SCOPES,
			callback: (tokenResponse: TokenResponse) => {
				this.tokenResponse = tokenResponse
				console.log('this.tokenResponse', this.tokenResponse)
				this.updateSigninStatus()
				/*
					// DEMO: works! but has insuffiecne tscopes
					const xhr = new XMLHttpRequest()
					xhr.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/primary/events')
					xhr.setRequestHeader('Authorization', 'Bearer ' + access_token)
					xhr.onreadystatechange = () => {
						if (xhr.readyState == 4 && xhr.status == 200) {
							console.log(xhr.responseText)
						}
					}
					xhr.send()
				*/
			},
		})
		client.requestAccessToken()

		// AFTER ABOVE succeed - we can do this in another method and thats it?!
		/*
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/primary/events');
		xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
		xhr.send();
		*/

		// GIS BELOW - but without `scope` so ???
		// WIP: got it - google dev docs say its moved to token req instead, this is fine
		/*
		window.google.accounts.id.initialize({
			client_id: this.GAPI_CLIENT_ID,
			callback: this.initGsiCallback,
			auto_select: true,
			cancel_on_tap_outside: true,
			context: 'signin',
		})
		window.google.accounts.id.prompt()
		*/
	}

	/**
	 * STEP 3: check current user's auth state
	 */
	private initGsiCallback = async (response: CredentialResponse) => {
		/**
		 * @note `credential`: This field is the ID token as a base64-encoded JSON Web Token (JWT) string.
		 * @see https://developers.google.com/identity/gsi/web/reference/js-reference#credential
		 */
		const responsePayload = decodeJwt(response.credential)
		console.log('ID: ' + responsePayload.sub)
		console.log('Full Name: ' + responsePayload.name)
		console.log('Given Name: ' + responsePayload.given_name)
		console.log('Family Name: ' + responsePayload.family_name)
		console.log('Image URL: ' + responsePayload.picture)
		console.log('Email: ' + responsePayload.email)

		// TODO: create interface
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

		this.signedInUser = responsePayload?.name?.toString() || ''
		if (this.signedInUser && this.isGapiLoaded) this.initGapiClient() /// this.tokenFlow()
		else console.warn('FUCK!!!', this.isGapiLoaded)
	}

	/** STEP 4:
	 * @see https://developers.google.com/identity/oauth2/web/guides/use-token-model#working_with_tokens
	 * @see https://developers.google.com/identity/oauth2/web/guides/migration-to-gis#token_request
	 */
	private tokenFlow = async () => {
		const client = window.google.accounts.oauth2.initTokenClient({
			client_id: this.GAPI_CLIENT_ID,
			scope: this.GAPI_SCOPES,
			callback: (response) => {
				console.log(response)
				//this.initGapiClient()
			},
		})
		client.requestAccessToken()
	}

	/** Step 4: query all app files */
	private listFiles = async () => {
		gapi.client.drive.files
			.list({ q: 'trashed=false and mimeType = \'application/json\'' })
			.then((response: { body: string }) => {
				const respBody = JSON.parse(response.body)
				const respFiles: IGapiFile[] = respBody.items
				if (IS_LOCALHOST) console.log('respFiles', respFiles)
				const dataFile = respFiles.filter(item => item.title === 'dream-journal.json')[0]
				if (IS_LOCALHOST) console.log('dataFile', dataFile)
				this.gapiDataFile = dataFile
				if (this.gapiDataFile) this.downloadDataFile()
				else this.clientCallback()
			})
	}

	/**
	 * `gapi.client.drive.files.get` can only get metadata, contents requires below
	 * @see https://developers.google.com/drive/api/v2/reference/files/get#javascript
	 * @returns
	 */
	private downloadDataFile = async () => {
		fetch(`https://www.googleapis.com/drive/v3/files/${this.gapiDataFile.id}?alt=media`, {
			method: 'GET',
			headers: { Authorization: `Bearer ${this.tokenResponse.access_token}` },
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
							modifiedTime: this.gapiDataFile.modifiedDate,
							name: this.gapiDataFile.title,
							size: this.gapiDataFile.fileSize || '',
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

	//#region getters

	get dataFile(): IDriveDataFile {
		return this.driveDataFile
	}

	get currentUsername(): string {
		return this.signedInUser
	}

	//#endregion
}
