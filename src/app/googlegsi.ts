/**
 * NOTE: `this.GAPI_API_KEY` will always be empty unless we use the "private initGapiClient = (): void => {}" style!
 */

/// <reference types="google-one-tap" />

import { IDriveDataFile, IGapiFile, IJournalEntry, IS_LOCALHOST } from './app.types'

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
		this.loadGapiScript()
	}

	/** Step 1: load <script> */
	private loadGapiScript = (): void => {
		const script = document.createElement('script')
		script.src = 'https://accounts.google.com/gsi/client'
		script.async = true
		script.defer = true
		script.onload = this.initGapiClient
		document.body.appendChild(script)
	}

	/** Step 2: init <script> */
	private initGapiClient = (): void => {
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
	private async updateSigninStatus() {
		console.log('updateSigninStatus!!')
		// TODO: now what???

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
