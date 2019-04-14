/*\
|*|  :: Brain Cloud Dream Journal ::
|*|
|*|  Dream Journal App - Record and Search Daily Dream Entries
|*|  https://github.com/gitbrent/dream-journal-app
|*|
|*|  This library is released under the MIT Public License (MIT)
|*|
|*|  Dream Journal App (C) 2019-present Brent Ely (https://github.com/gitbrent)
|*|
|*|  Permission is hereby granted, free of charge, to any person obtaining a copy
|*|  of this software and associated documentation files (the "Software"), to deal
|*|  in the Software without restriction, including without limitation the rights
|*|  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
|*|  copies of the Software, and to permit persons to whom the Software is
|*|  furnished to do so, subject to the following conditions:
|*|
|*|  The above copyright notice and this permission notice shall be included in all
|*|  copies or substantial portions of the Software.
|*|
|*|  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
|*|  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
|*|  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
|*|  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
|*|  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
|*|  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
|*|  SOFTWARE.
\*/

// FUTURE: https://github.com/FortAwesome/react-fontawesome
enum AppTab {
	home = 'home',
	view = 'view',
	search = 'search',
	import = 'import',
}
export enum AuthState {
	Authenticated = 'Authenticated',
	Unauthenticated = 'Unauthenticated',
	Expired = 'Expired',
}
export enum ImportTypes {
	'docx' = 'Document',
	'xlsx' = 'Spreadsheet',
}
export enum InductionTypes {
	'none' = '(n/a)',
	'dild' = 'DILD',
	'mild' = 'MILD',
	'wbtb' = 'WBTB',
	'wild' = 'WILD',
	'other' = 'Other',
}

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import '../css/bootstrap.yeticyborg.css'
import '../css/svg-images.css'
import LogoBase64 from '../img/logo_base64'
import TabHome from '../app/app-home'
import TabImport from '../app/app-import'
import TabModify from '../app/app-modify'
import TabSearch from '../app/app-search'
import EntryModal from '../app/app-modal-entry'

export interface IAuthState {
	status: AuthState
	userName: ''
	userPhoto: ''
}
export interface IDriveFile {
	_isLoading: boolean
	_isSaving: boolean
	id: string
	entries: Array<IJournalEntry>
	modifiedTime: string
	name: string
	size: string
}
export interface IDriveFiles {
	available: Array<IDriveFile>
	selected: IDriveFile
}
/**
 * A single dream entry - there are 1+ of these in every IJournalEntry
 */
export interface IJournalDream {
	title: string
	notes?: string
	dreamSigns?: Array<string>
	dreamImages?: Array<string>
	isLucidDream: boolean
	lucidMethod: InductionTypes
}
/**
 * A daily journal entry containing 1+ dreams
 */
export interface IJournalEntry {
	entryDate: string
	starred?: boolean
	bedTime?: string
	notesPrep?: string
	notesWake?: string
	dreams?: Array<IJournalDream>
}

// TODO: FIXME: https://stackoverflow.com/questions/48699820/how-do-i-hide-api-key-in-create-react-app
console.log(process.env.REACT_APP_GDRIVE_CLIENT_ID)
console.log(`${process.env.REACT_APP_GDRIVE_CLIENT_ID}`)
/*
const API_KEY = `${process.env.REACT_APP_GDRIVE_API_KEY}`;
console.log(API_KEY)
*/
const GITBRENT_CLIENT_ID = '300205784774-vt1v8lerdaqlnmo54repjmtgo5ckv3c3.apps.googleusercontent.com'
const GDRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'
const FIREBASE_URL = 'https://brain-cloud-dream-journal.firebaseapp.com'
const LOCALHOST_URL = 'http://localhost:8080'
const JOURNAL_HEADER = {
	description: 'Brain Cloud Dream Journal data file',
	mimeType: 'application/json',
}

/**
 * @see: https://developers.google.com/identity/protocols/OAuth2UserAgent#example
 */
function oauth2SignIn() {
	// @see: https://developers.google.com/identity/protocols/OAuth2UserAgent

	// Google's OAuth 2.0 endpoint for requesting an access token
	var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth'

	// Create <form> element to submit parameters to OAuth 2.0 endpoint.
	var form = document.createElement('form')
	form.setAttribute('method', 'GET') // Send as a GET request.
	form.setAttribute('action', oauth2Endpoint)

	// Parameters to pass to OAuth 2.0 endpoint.
	var params = {
		client_id: GITBRENT_CLIENT_ID,
		scope: GDRIVE_SCOPE,
		redirect_uri: location.href.indexOf('8080') > -1 ? LOCALHOST_URL : FIREBASE_URL,
		response_type: 'token',
		include_granted_scopes: 'true',
		state: 'pass-through value',
	}

	// Add form parameters as hidden input values.
	for (var p in params) {
		var input = document.createElement('input')
		input.setAttribute('type', 'hidden')
		input.setAttribute('name', p)
		input.setAttribute('value', params[p])
		form.appendChild(input)
	}

	// Add form to page and submit it to open the OAuth 2.0 endpoint.
	document.body.appendChild(form)
	form.submit()
}

function parseStoreAccessKey() {
	var fragmentString = location.hash.substring(1)

	// Parse query string to see if page request is coming from OAuth 2.0 server.
	var params = {}
	var regex = /([^&=]+)=([^&]*)/g,
		m
	while ((m = regex.exec(fragmentString))) {
		params[decodeURIComponent(m[1])] = decodeURIComponent(m[2])
	}
	if (Object.keys(params).length > 0) {
		localStorage.setItem('oauth2-params', JSON.stringify(params))
	}
}

class AppNavBar extends React.Component<
	{ onSaveFile: Function; onShowTab: Function; selDataFile: IDriveFile },
	{ activeTab: AppTab }
> {
	constructor(
		props: Readonly<{
			onSaveFile: Function
			onShowTab: Function
			selDataFile: IDriveFile
		}>
	) {
		super(props)

		this.state = {
			activeTab: AppTab.home,
		}
	}

	onSaveFile = e => {
		this.props.onSaveFile()
	}
	onShowTabHandler = e => {
		let clickedTabName = e.target.getAttribute('data-name')

		this.setState({
			activeTab: clickedTabName,
		})

		this.props.onShowTab(clickedTabName)
	}

	render() {
		return (
			<nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
				<a className='navbar-brand' href='/'>
					<img src={LogoBase64} width='30' height='30' className='d-inline-block align-top mr-3' alt='' />
					Brain Cloud
				</a>
				<button
					className='navbar-toggler'
					type='button'
					data-toggle='collapse'
					data-target='#navbarNav'
					aria-controls='navbarNav'
					aria-expanded='false'
					aria-label='Toggle navigation'>
					<span className='navbar-toggler-icon' />
				</button>
				<div className='collapse navbar-collapse' id='navbarNav'>
					<ul className='navbar-nav'>
						<li className={this.state.activeTab == AppTab.home ? 'nav-item active' : 'nav-item'}>
							<a
								className='nav-link'
								href='javascript:void(0)'
								data-name='home'
								onClick={this.onShowTabHandler}>
								Home <span className='sr-only'>(current)</span>
							</a>
						</li>
						<li className={this.state.activeTab == AppTab.view ? 'nav-item active' : 'nav-item'}>
							<a
								className='nav-link'
								href='javascript:void(0)'
								data-name='view'
								onClick={this.onShowTabHandler}>
								Modify Journal
							</a>
						</li>
						<li className={this.state.activeTab == AppTab.search ? 'nav-item active' : 'nav-item'}>
							<a
								className='nav-link'
								href='javascript:void(0)'
								data-name='search'
								onClick={this.onShowTabHandler}>
								Search Journal
							</a>
						</li>
						<li className={this.state.activeTab == AppTab.import ? 'nav-item active' : 'nav-item'}>
							<a
								className={!this.props.selDataFile ? 'nav-link disabled' : 'nav-link d-none d-lg-block'}
								href='javascript:void(0)'
								data-name='import'
								onClick={this.onShowTabHandler}>
								Import Entries
							</a>
						</li>
					</ul>
				</div>
				<form className='form-inline h6 text-secondary mb-0'>
					{this.props.selDataFile && this.props.selDataFile._isSaving ? (
						<div>
							<div className='spinner-border spinner-border-sm mr-2' role='status'>
								<span className='sr-only' />
							</div>
							Saving...
						</div>
					) : this.props.selDataFile ? (
						this.props.selDataFile.modifiedTime ? (
							'Last Saved @ ' + new Date(this.props.selDataFile.modifiedTime).toLocaleString()
						) : (
							'(unsaved)'
						)
					) : (
						'(no file selected)'
					)}
				</form>
			</nav>
		)
	}
}

class AppTabs extends React.Component<{
	activeTab: AppTab
	authState: IAuthState
	availDataFiles: IDriveFiles['available']
	doCreateEntry: Function
	doAuthSignIn: Function
	doAuthSignOut: Function
	doCreateJournal: Function
	doFileListRefresh: Function
	doImportEntries: Function
	doRenameFile: Function
	doSaveImportState: Function
	doSelectFileById: Function
	importState: object
	onShowModal: Function
	selDataFile: IDriveFile
}> {
	constructor(
		props: Readonly<{
			activeTab: AppTab
			authState: IAuthState
			availDataFiles: IDriveFiles['available']
			doCreateEntry: Function
			doAuthSignIn: Function
			doAuthSignOut: Function
			doCreateJournal: Function
			doDeleteEntry: Function
			doFileListRefresh: Function
			doImportEntries: Function
			doRenameFile: Function
			doSaveImportState: Function
			doSelectFileById: Function
			importState: object
			onShowModal: Function
			selDataFile: IDriveFile
		}>
	) {
		super(props)
	}

	render() {
		switch (this.props.activeTab) {
			case AppTab.view:
				return <TabModify onShowModal={this.props.onShowModal} selDataFile={this.props.selDataFile} />
			case AppTab.search:
				return <TabSearch onShowModal={this.props.onShowModal} selDataFile={this.props.selDataFile} />
			case AppTab.import:
				return (
					<TabImport
						doImportEntries={this.props.doImportEntries}
						doSaveImportState={this.props.doSaveImportState}
						importState={this.props.importState}
						selDataFile={this.props.selDataFile}
					/>
				)
			case AppTab.home:
			default:
				return (
					<TabHome
						authState={this.props.authState}
						availDataFiles={this.props.availDataFiles}
						doAuthSignIn={this.props.doAuthSignIn}
						doAuthSignOut={this.props.doAuthSignOut}
						doCreateJournal={this.props.doCreateJournal}
						doFileListRefresh={this.props.doFileListRefresh}
						doRenameFile={this.props.doRenameFile}
						doSelectFileById={this.props.doSelectFileById}
						selDataFile={this.props.selDataFile}
					/>
				)
		}
	}
}

// App Logic
class App extends React.Component<
	{},
	{
		auth: IAuthState
		childImportState: object
		dataFiles: IDriveFiles
		editEntry: IJournalEntry
		showModal: boolean
		showTab: AppTab
	}
> {
	constructor(props: Readonly<{ showModal: boolean }>) {
		super(props)

		this.state = {
			auth: {
				status: AuthState.Unauthenticated,
				userName: '',
				userPhoto: '',
			},
			childImportState: null,
			dataFiles: {
				available: [],
				selected: null,
			},
			editEntry: null,
			showModal: typeof props.showModal === 'boolean' ? props.showModal : false,
			showTab: AppTab.home,
		}

		this.updateAuthState()
	}

	/**
	 * the `app-import` constructor is called every damn time its shown, so we have t save state here
	 * FUTURE: use hooks instead?
	 */
	doSaveImportState = (newState: object) => {
		this.setState({
			childImportState: newState,
		})
	}

	updateAuthState = () => {
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
			}).then(response => {
				response
					.json()
					.then(json => {
						if (json && json.error && json.error.code) {
							// NOTE: Google returns an error object `{error:{errors:[], code:401, message:"..."}}`
							throw json.error
						} else if (json && json.user) {
							// A: Set user states
							let newState: IAuthState = {
								status: AuthState.Authenticated,
								userName: json.user.displayName || null,
								userPhoto: json.user.photoLink || null,
							}
							this.setState({ auth: newState })
						}
					})
					.catch(error => {
						if (error.code == '401') {
							let newState: IAuthState = this.state.auth
							newState.status = AuthState.Expired
							this.setState({ auth: newState })
						} else {
							console.error ? console.error(error) : console.log(error)
						}
					})
			})
		}
	}

	chgShowModal = (options: { editEntry: IJournalEntry; show: boolean }) => {
		this.setState({
			editEntry: options.editEntry,
			showModal: options.show,
		})
	}
	chgShowTab = (value: AppTab) => {
		this.setState({
			showTab: value,
		})
	}

	doAuthSignIn = () => {
		oauth2SignIn()
	}
	/**
	 * @see: https://developers.google.com/identity/protocols/OAuth2UserAgent#tokenrevoke
	 */
	doAuthSignOut = () => {
		let params = JSON.parse(localStorage.getItem('oauth2-params'))

		// TODO: Prompt for Save!!!

		fetch('https://accounts.google.com/o/oauth2/revoke?token=' + params['access_token'], {
			method: 'GET',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		})
			.then(response => {
				this.setState({
					auth: {
						status: AuthState.Unauthenticated,
						userName: '',
						userPhoto: '',
					},
					dataFiles: {
						available: [],
						selected: null,
					},
				})
				localStorage.setItem('journal-selected-fileid', null)
			})
			.catch(error => {
				console.error ? console.error(error) : console.log(error)
			})
	}

	/**
	 * @see: https://developers.google.com/drive/api/v3/multipart-upload
	 */
	driveCreateNewJournal = () => {
		// TODO: prompt for name on create click
		//JOURNAL_HEADER.name = 'MY JOURNAL'

		let params = JSON.parse(localStorage.getItem('oauth2-params'))
		let reqBody =
			'--foo_bar_baz\nContent-Type: application/json; charset=UTF-8\n\n' +
			JSON.stringify(JOURNAL_HEADER) +
			'\n' +
			'--foo_bar_baz\nContent-Type: application/json\n\n' +
			'' +
			'\n' +
			'--foo_bar_baz--'
		let reqEnd = encodeURIComponent(reqBody).match(/%[89ABab]/g) || ''

		let requestHeaders: any = {
			Authorization: 'Bearer ' + params['access_token'],
			'Content-Type': 'multipart/related; boundary=foo_bar_baz',
			'Content-Length': reqBody.length + reqEnd.length,
		}

		fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
			method: 'POST',
			headers: requestHeaders,
			body: reqBody,
		})
			.then(response => {
				response
					.json()
					.then(json => {
						this.driveGetFileList()
					})
					.catch(error => {
						if (error.code == '401') {
							oauth2SignIn()
						} else {
							// TODO: Show message onscreen
							console.error ? console.error(error) : console.log(error)
						}
					})
			})
			.catch(error => {
				if (error.code == '401') {
					oauth2SignIn()
				} else {
					console.error ? console.error(error) : console.log(error)
				}
			})
	}
	driveGetFileList = () => {
		var params = JSON.parse(localStorage.getItem('oauth2-params'))
		if (!params || !params['access_token']) {
			oauth2SignIn()
			return
		}

		// GET https://www.googleapis.com/drive/v3/files/
		// Authorization: Bearer [YOUR_ACCESS_TOKEN]
		// Accept: application/json
		fetch('https://www.googleapis.com/drive/v3/files?fields=files/id,files/name,files/size,files/modifiedTime', {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				Authorization: 'Bearer ' + params['access_token'],
			},
		})
			.then(response => {
				response
					.json()
					.then(json => {
						let data = json
						// STEP 1: Check for errors
						// NOTE: Google returns an error object `{error:{errors:[], code:401, message:"..."}}`
						if (data && data.error && data.error.code) throw data.error

						// STEP 2: Update data
						let newState = this.state.dataFiles
						newState.available = data.files
						this.setState({
							dataFiles: newState,
						})

						// STEP 3: Re-select previously selected file (if any)
						let selFileId = localStorage.getItem('journal-selected-fileid')
						if (selFileId && this.state.dataFiles.available.length > 0) {
							let selFile = this.state.dataFiles.available.filter(file => {
								return file.id === selFileId
							})
							if (selFile && selFile[0]) {
								this.doSelectFileById(selFile[0].id)
							}
						}
					})
					.catch(error => {
						if (error.code == '401') {
							oauth2SignIn()
						} else {
							console.error ? console.error(error) : console.log(error)
						}
					})
			})
			.catch(error => {
				if (error.code == '401') {
					oauth2SignIn()
				} else {
					console.error ? console.error(error) : console.log(error)
				}
			})
	}

	/**
	 * @see: https://developers.google.com/drive/api/v3/manage-downloads
	 */
	doSelectFileById = (fileId: IDriveFile['id']) => {
		let params = JSON.parse(localStorage.getItem('oauth2-params'))
		let selFile =
			fileId &&
			this.state.dataFiles &&
			this.state.dataFiles.available &&
			this.state.dataFiles.available.filter(file => {
				return file.id === fileId
			}).length > 0
				? this.state.dataFiles.available.filter(file => {
						return file.id === fileId
				  })[0]
				: null

		// A:
		if (!selFile) {
			console.error ? console.error('NO SUCH FILE') : console.log('WTH?!')
			return
		}

		// B:
		let newState = this.state.dataFiles
		newState.selected = selFile
		newState.selected._isLoading = true
		this.setState({
			dataFiles: newState,
		})

		// C:
		fetch('https://www.googleapis.com/drive/v3/files/' + fileId + '?alt=media', {
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + params['access_token'],
			},
		})
			.then(response => {
				response
					.arrayBuffer()
					.then(buffer => {
						let decoded: string = new TextDecoder('utf-8').decode(buffer)
						let json: Object = {}
						let entries: Array<IJournalEntry>

						// A:
						if (decoded && decoded.length > 0) {
							try {
								// NOTE: Initial dream-journal file is empty!
								json = JSON.parse(decoded)
								entries = json['entries']
							} catch (ex) {
								// TODO: Show message onscreen
								console.error ? console.error(ex) : console.log(ex)
							}
						}

						// B:
						let newState = this.state.dataFiles
						newState.selected = selFile
						newState.selected._isLoading = false
						newState.selected.entries = entries || []
						this.setState({
							dataFiles: newState,
						})

						// C:
						localStorage.setItem('journal-selected-fileid', selFile.id)
					})
					.catch(error => {
						throw error
					})
			})
			.catch(error => {
				if (error.code == '401') {
					oauth2SignIn()
				} else if (error.code == '503') {
					let newState = this.state.dataFiles
					newState.selected._isLoading = false
					// TODO: new field like `hasError` to hold "Service Unavailable" etc
				} else {
					let newState = this.state.dataFiles
					newState.selected._isLoading = false
					console.error ? console.error(error) : console.log(error)
				}
			})
	}
	doRenameFile = (file: IDriveFile, name: string) => {
		let params = JSON.parse(localStorage.getItem('oauth2-params'))

		return new Promise((resolve, reject) => {
			// NOTE: 'Content-Type' is *required* (other a parse error is returned)
			fetch('https://www.googleapis.com/drive/v3/files/' + file.id, {
				method: 'PATCH',
				headers: {
					Authorization: 'Bearer ' + params['access_token'],
					'Content-Type': 'application/json; charset=UTF-8',
				},
				body: JSON.stringify({
					name: name,
				}),
			})
				.then(response => {
					response
						.json()
						.then(json => {
							// NOTE: Google-api will return an `{error:{}}` object, so check!
							if (!json.error && json.name) {
								let newState = this.state.dataFiles
								let dataFile = newState.available.filter(file => {
									return file.id === json.id
								})[0]
								dataFile.name = json.name
								this.setState({
									dataFiles: newState,
								})
							}
							resolve(json)
						})
						.catch(error => {
							reject(error)
						})
				})
				.catch(error => {
					reject(error)
				})
		})
	}
	/**
	 * @see: https://developers.google.com/drive/api/v3/reference/files/update
	 */
	doSaveFile = () => {
		return new Promise((resolve, reject) => {
			let params = JSON.parse(localStorage.getItem('oauth2-params'))

			// A:
			if (!this.state.dataFiles.selected) {
				// TODO: disable save button if no `selected` file exists
				console.log('No file selected!')
				return
			}

			// B: Update state
			let newState = this.state.dataFiles
			newState.selected._isSaving = true
			this.setState({
				dataFiles: newState,
			})

			let jsonBody: object = {
				entries: this.state.dataFiles.selected.entries.sort((a, b) => {
					if (a.entryDate > b.entryDate) return 1
					if (a.entryDate < b.entryDate) return -1
					return 0
				}),
			}

			let reqBody: string =
				'--foo_bar_baz\nContent-Type: application/json; charset=UTF-8\n\n' +
				JSON.stringify(JOURNAL_HEADER) +
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

			fetch(
				'https://www.googleapis.com/upload/drive/v3/files/' +
					this.state.dataFiles.selected.id +
					'?uploadType=multipart',
				{
					method: 'PATCH',
					headers: requestHeaders,
					body: reqBody,
				}
			)
				.then(response => {
					response
						.json()
						.then(fileResource => {
							// A: update state
							let newState = this.state.dataFiles
							newState.selected._isSaving = false
							this.setState({
								dataFiles: newState,
							})

							// B: refresh file list (to update "size", "modified")
							this.driveGetFileList()

							resolve(true)
						})
						.catch(error => {
							if (error.code == '401') {
								oauth2SignIn()
							} else {
								// TODO: Show message onscreen
								console.error ? console.error(error) : console.log(error)
							}
						})
				})
				.catch(error => {
					if (error.code == '401') {
						oauth2SignIn()
					} else {
						reject(error)
					}
				})
		})
	}

	isExistingEntryDate = (checkDate: string) => {
		return this.state.dataFiles.selected.entries.filter(ent => {
			return ent.entryDate == checkDate
		}).length > 0
			? true
			: false
	}
	doImportEntries = (entries: Array<IJournalEntry>) => {
		let newState = this.state.dataFiles

		return new Promise((resolve, reject) => {
			if (!newState || !newState.selected) {
				reject('No data file currently selected')
			} else {
				// 1: Add new entries
				newState.selected.entries = [...newState.selected.entries, ...entries].sort((a, b) => {
					if (a.entryDate < b.entryDate) return 1
					if (a.entryDate > b.entryDate) return -1
					return 0
				})

				return this.doSaveFile()
					.catch(err => {
						throw err
					})
					.then(res => {
						if (res != true) throw res
						resolve(true)
					})
					.catch(err => {
						reject(err)
					})
			}
		})
	}

	/**
	 * Add new `IJournalEntry` into selected `IDriveFile`
	 */
	doCreateEntry = (entry: IJournalEntry) => {
		let dataFiles = this.state.dataFiles

		return new Promise((resolve, reject) => {
			if (!dataFiles || !dataFiles.selected) {
				reject('No data file currently selected')
			} else {
				dataFiles.selected.entries.push(entry)
				this.setState({
					dataFiles: dataFiles,
				})

				return this.doSaveFile()
					.catch(err => {
						throw err
					})
					.then(res => {
						if (res != true) throw res
						resolve(true)
					})
					.catch(err => {
						reject(err)
					})
			}
		})
	}
	/**
	 * Add new `IJournalEntry` into selected `IDriveFile`
	 */
	doUpdateEntry = (entry: IJournalEntry, origEntryDate: string) => {
		let newState = this.state.dataFiles

		return new Promise((resolve, reject) => {
			if (!newState || !newState.selected) {
				reject('No data file currently selected')
			} else {
				let editEntry = newState.selected.entries.filter(ent => {
					return ent.entryDate == (origEntryDate != entry.entryDate ? origEntryDate : entry.entryDate)
				})[0]

				if (!editEntry) {
					reject('ERROR: Unable to find this entry to update it')
				} else {
					Object.keys(entry).forEach(key => {
						editEntry[key] = entry[key]
					})

					this.setState({
						dataFiles: newState,
					})

					return this.doSaveFile()
						.catch(err => {
							throw err
						})
						.then(res => {
							if (res != true) throw res
							resolve(true)
						})
						.catch(err => {
							reject(err)
						})
				}
			}
		})
	}
	/**
	 */
	doDeleteEntry = (entryDate: IJournalEntry['entryDate']) => {
		let dataFiles = this.state.dataFiles

		return new Promise((resolve, reject) => {
			if (!dataFiles || !dataFiles.selected) {
				reject('No data file currently selected')
			} else {
				// A:
				let delIdx = dataFiles.selected.entries.findIndex(ent => {
					return ent.entryDate == entryDate
				})

				// B:
				if (delIdx == -1) reject('Unable to find `entryDate` ' + entryDate)

				// C:
				dataFiles.selected.entries.splice(delIdx, 1)

				// D:
				this.setState({
					dataFiles: dataFiles,
				})

				// E:
				return this.doSaveFile()
					.catch(err => {
						throw err
					})
					.then(res => {
						if (res != true) throw res
						resolve(true)
					})
					.catch(err => {
						reject(err)
					})
			}
		})
	}

	render() {
		return (
			<main>
				<AppNavBar
					selDataFile={
						this.state.dataFiles && this.state.dataFiles.selected ? this.state.dataFiles.selected : null
					}
					onSaveFile={this.doSaveFile}
					onShowTab={this.chgShowTab}
				/>
				<AppTabs
					activeTab={this.state.showTab}
					authState={this.state.auth}
					availDataFiles={
						this.state.dataFiles && this.state.dataFiles.available ? this.state.dataFiles.available : null
					}
					doCreateEntry={this.doCreateEntry}
					doAuthSignIn={this.doAuthSignIn}
					doAuthSignOut={this.doAuthSignOut}
					doCreateJournal={this.driveCreateNewJournal}
					doFileListRefresh={this.driveGetFileList}
					doImportEntries={this.doImportEntries}
					doRenameFile={this.doRenameFile}
					doSaveImportState={this.doSaveImportState}
					doSelectFileById={this.doSelectFileById}
					importState={this.state.childImportState}
					onShowModal={this.chgShowModal}
					selDataFile={
						this.state.dataFiles && this.state.dataFiles.selected ? this.state.dataFiles.selected : null
					}
				/>
				<EntryModal
					doCreateEntry={this.doCreateEntry}
					doDeleteEntry={this.doDeleteEntry}
					doUpdateEntry={this.doUpdateEntry}
					editEntry={this.state.editEntry}
					isExistingEntryDate={this.isExistingEntryDate}
					onShowModal={this.chgShowModal}
					show={this.state.showModal}
				/>
			</main>
		)
	}
}

// App Container
const AppMain: React.SFC<{ compiler: string; framework: string }> = props => {
	return <App />
}

ReactDOM.render(<AppMain compiler='TypeScript' framework='React' />, document.getElementById('root'))
