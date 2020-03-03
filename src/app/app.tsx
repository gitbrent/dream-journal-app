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

// TODO: [Auth redirect](https://reacttraining.com/react-router/web/example/auth-workflow)
// FUTURE: https://github.com/FortAwesome/react-fontawesome

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom'
import '../css/bootstrap.yeticyborg.css'
import '../css/react-tags.css'
import '../css/svg-images.css'
import '../css/style.css'
import LogoBase64 from '../img/logo_base64'
import TabHome from '../app/app-home'
import TabView, { IAppViewState } from '../app/app-view'
import TabImport from '../app/app-import'
import TabSearch, { IAppSearchState } from '../app/app-search'
import TabTags, { IAppTagsState } from '../app/app-tags'
import EntryModal from '../app/modals/daily-entry-modal'
import { IAuthState, IDriveFile, IJournalEntry, AuthState, IDreamSignTag } from './app.types'

/*
// TODO: FIXME: https://stackoverflow.com/questions/48699820/how-do-i-hide-api-key-in-create-react-app
console.log(process.env.REACT_APP_GDRIVE_CLIENT_ID)
console.log(`${process.env.REACT_APP_GDRIVE_CLIENT_ID}`)
*/
/*
const API_KEY = `${process.env.REACT_APP_GDRIVE_API_KEY}`;
console.log(API_KEY)
*/
const GITBRENT_CLIENT_ID = '300205784774-vt1v8lerdaqlnmo54repjmtgo5ckv3c3.apps.googleusercontent.com'
const GDRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'
const FIREBASE_URL = 'https://brain-cloud-dream-journal.firebaseapp.com'
const LOCALHOST_URL = 'http://localhost:8080'
const JOURNAL_HEADER = {
	name: 'dream-journal.json',
	description: 'Brain Cloud Dream Journal data file',
	mimeType: 'application/json',
}

// App Logic
interface IAppProps {
	showModal?: boolean
}
interface IAppState {
	auth: IAuthState
	childImportState: object
	childSearchState: IAppSearchState
	childTagsState: IAppTagsState
	childViewState: IAppViewState
	dataFile: IDriveFile
	editEntry: IJournalEntry
	showModal: boolean
}
class App extends React.Component<IAppProps, IAppState> {
	constructor(props: Readonly<IAppProps>) {
		super(props)

		this.state = {
			auth: {
				status: AuthState.Unauthenticated,
				userName: '',
				userPhoto: '',
			},
			childImportState: null,
			childSearchState: null,
			childTagsState: null,
			childViewState: null,
			dataFile: null,
			editEntry: null,
			showModal: typeof props.showModal === 'boolean' ? props.showModal : false,
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
	/**
	 * Retain state between tab changes
	 */
	doSaveSearchState = (newState: IAppSearchState) => {
		this.setState({
			childSearchState: newState,
		})
	}
	/**
	 * Retain state between tab changes
	 */
	doSaveTagsState = (newState: IAppTagsState) => {
		this.setState({
			childTagsState: newState,
		})
	}
	/**
	 * Retain state between tab changes
	 */
	doSaveViewState = (newState: IAppViewState) => {
		this.setState({
			childViewState: newState,
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
							// B: Get files (so Route pages have data)
							this.driveGetFileList()
						}
					})
					.catch(error => {
						if (error.code === '401') {
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
			.then(_response => {
				this.setState({
					auth: {
						status: AuthState.Unauthenticated,
						userName: '',
						userPhoto: '',
					},
					dataFile: null,
				})
				localStorage.setItem('journal-selected-fileid', null)
			})
			.catch(error => {
				console.error ? console.error(error) : console.log(error)
			})
	}

	driveGetFileList = () => {
		let params = JSON.parse(localStorage.getItem('oauth2-params'))
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

						// A: Check for errors
						// NOTE: Google returns an error object `{error:{errors:[], code:401, message:"..."}}`
						if (data && data.error && data.error.code) throw data.error

						// B: Capture datafile
						let driveDataFile = data.files.filter(file => file.name === JOURNAL_HEADER.name)[0] || null
						this.setState({
							dataFile: driveDataFile,
						})

						// C: Load or Create data file
						driveDataFile ? this.doSelectFile() : this.doCreateFile()
					})
					.catch(error => {
						if (error.code === '401') {
							oauth2SignIn()
						} else {
							console.error ? console.error(error) : console.log(error)
						}
					})
			})
			.catch(error => {
				if (error.code === '401') {
					oauth2SignIn()
				} else {
					console.error ? console.error(error) : console.log(error)
				}
			})
	}
	/**
	 * @see: https://developers.google.com/drive/api/v3/multipart-upload
	 */
	doCreateFile = () => {
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
					.then(_json => {
						this.driveGetFileList()
					})
					.catch(error => {
						throw error
					})
			})
			.catch(error => {
				if (error.code === '401') {
					oauth2SignIn()
				} else {
					console.error ? console.error(error) : console.log(error)
				}
			})
	}
	/**
	 * @see: https://developers.google.com/drive/api/v3/manage-downloads
	 */
	doSelectFile = () => {
		// A
		let params = JSON.parse(localStorage.getItem('oauth2-params'))

		// B
		let newState = this.state.dataFile
		newState._isLoading = true
		this.setState({
			dataFile: newState,
		})

		// C
		fetch('https://www.googleapis.com/drive/v3/files/' + this.state.dataFile.id + '?alt=media', {
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
						let newState = this.state.dataFile
						newState._isLoading = false
						newState.entries = entries || []
						this.setState({
							dataFile: newState,
						})
					})
					.catch(error => {
						throw error
					})
			})
			.catch(error => {
				if (error.code === '401') {
					oauth2SignIn()
				} else if (error.code === '503') {
					let newState = this.state.dataFile
					newState._isLoading = false
					// TODO: new field like `hasError` to hold "Service Unavailable" etc
				} else {
					let newState = this.state.dataFile
					newState._isLoading = false
					console.error ? console.error(error) : console.log(error)
				}
			})
	}
	/**
	 * @see: https://developers.google.com/drive/api/v3/reference/files/update
	 */
	doSaveFile = () =>
		new Promise((resolve, reject) => {
			let params = JSON.parse(localStorage.getItem('oauth2-params'))

			// A: Set state
			let newState = this.state.dataFile
			newState._isSaving = true
			this.setState({
				dataFile: newState,
			})

			// TEMP: (20191101): vvv TODO: (several entries were loaded before code was solid and created non-array dreamsigns)
			/*
				newState.entries.forEach(entry => {
					entry.dreams.forEach(dream => {
						// WORKED! if (typeof dream.dreamSigns === 'string') dream.dreamSigns = (dream.dreamSigns as string).split(',')
						// WORKED! dream.dreamSigns = dream.dreamSigns.map(sign=>{ return sign.trim() })
					})
				})
			*/

			// B: Fix missing dates that canbe created by import data/formatting, etc.
			let entriesFix = newState.entries
			entriesFix.forEach((entry, idx) => (entry.entryDate = entry.entryDate ? entry.entryDate : `1999-01-0${idx + 1}`))

			// C: Sort by `entryDate`
			let jsonBody: object = {
				entries: entriesFix.sort((a, b) => (a.entryDate > b.entryDate ? 1 : -1)),
			}

			// D: Write file
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

			fetch('https://www.googleapis.com/upload/drive/v3/files/' + this.state.dataFile.id + '?uploadType=multipart', {
				method: 'PATCH',
				headers: requestHeaders,
				body: reqBody,
			})
				.then(response => {
					response
						.json()
						.then(_fileResource => {
							// A: update state
							let newState = this.state.dataFile
							newState._isSaving = false
							this.setState({
								dataFile: newState,
							})

							// B: refresh file list (to update "size", "modified")
							this.driveGetFileList()

							// Done
							resolve(true)
						})
						.catch(error => {
							if (error.code === '401') {
								oauth2SignIn()
							} else {
								// TODO: Show message onscreen
								console.error ? console.error(error) : console.log(error)
							}
						})
				})
				.catch(error => {
					if (error.code === '401') {
						oauth2SignIn()
					} else {
						reject(error)
					}
				})
		})

	isExistingEntryDate = (checkDate: string) => (this.state.dataFile.entries.filter(ent => ent.entryDate === checkDate).length > 0 ? true : false)

	doImportEntries = (entries: Array<IJournalEntry>) =>
		new Promise((resolve, reject) => {
			let newState = this.state.dataFile
			if (!newState || !newState.id) {
				reject('No data file currently selected')
			} else {
				// 1: Add new entries
				newState.entries = [...newState.entries, ...entries].sort((a, b) => {
					if (a.entryDate < b.entryDate) return 1
					if (a.entryDate > b.entryDate) return -1
					return 0
				})

				return this.doSaveFile()
					.catch(err => {
						throw err
					})
					.then(res => {
						if (res !== true) throw res
						resolve(true)
					})
					.catch(err => {
						reject(err)
					})
			}
		})

	getDreamSignTags = (): IDreamSignTag[] => {
		let allTags: string[] = []

		if (!this.state.dataFile || !this.state.dataFile.entries) return []

		this.state.dataFile.entries.forEach(entry => {
			entry.dreams.forEach(dream => {
				dream.dreamSigns.forEach(sign => {
					if (sign && allTags.indexOf(sign.toLowerCase()) === -1) allTags.push(sign.toLowerCase())
				})
			})
		})

		return allTags.sort().map((sign, idx) => new Object({ id: idx, name: sign }) as IDreamSignTag)
	}

	/**
	 * Add new `IJournalEntry` into selected `IDriveFile`
	 */
	doCreateEntry = (entry: IJournalEntry) =>
		new Promise((resolve, reject) => {
			let newState = this.state.dataFile
			if (!newState || !newState.id) {
				reject('No data file currently selected')
			} else {
				newState.entries.push(entry)
				this.setState({
					dataFile: newState,
				})

				return this.doSaveFile()
					.catch(err => {
						throw err
					})
					.then(res => {
						if (res !== true) throw res
						resolve(true)
					})
					.catch(err => {
						reject(err)
					})
			}
		})

	/**
	 * Add new `IJournalEntry` into selected `IDriveFile`
	 */
	doUpdateEntry = (entry: IJournalEntry, origEntryDate: string) => {
		let newState = this.state.dataFile

		return new Promise((resolve, reject) => {
			if (!newState || !newState.id) {
				reject('No data file currently selected')
			} else {
				let editEntry = newState.entries.filter(ent => ent.entryDate === (origEntryDate !== entry.entryDate ? origEntryDate : entry.entryDate))[0]

				if (!editEntry) {
					reject('ERROR: Unable to find this entry to update it')
				} else {
					Object.keys(entry).forEach(key => {
						editEntry[key] = entry[key]
					})

					this.setState({
						dataFile: newState,
					})

					return this.doSaveFile()
						.catch(err => {
							throw err
						})
						.then(res => {
							if (res !== true) throw res
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
		let newState = this.state.dataFile

		return new Promise((resolve, reject) => {
			if (!newState || !newState.id) {
				reject('No data file currently selected')
			} else {
				// A:
				let delIdx = newState.entries.findIndex(ent => ent.entryDate === entryDate)

				// B:
				if (delIdx === -1) reject('Unable to find `entryDate` ' + entryDate)

				// C:
				newState.entries.splice(delIdx, 1)

				// D:
				this.setState({
					dataFile: newState,
				})

				// E:
				return this.doSaveFile()
					.catch(err => {
						throw err
					})
					.then(res => {
						if (res !== true) throw res
						resolve(true)
					})
					.catch(err => {
						reject(err)
					})
			}
		})
	}

	// App Pages

	Home = () => (
		<TabHome
			authState={this.state.auth}
			dataFile={this.state.dataFile || null}
			doAuthSignIn={this.doAuthSignIn}
			doAuthSignOut={this.doAuthSignOut}
			onShowModal={this.chgShowModal}
		/>
	)

	Journal = () => (
		<TabView
			dataFile={this.state.dataFile || null}
			dreamSignTags={this.getDreamSignTags()}
			onShowModal={this.chgShowModal}
			doSaveViewState={this.doSaveViewState}
			viewState={this.state.childViewState}
		/>
	)

	Search = () => (
		<TabSearch
			dataFile={this.state.dataFile || null}
			onShowModal={this.chgShowModal}
			doSaveSearchState={this.doSaveSearchState}
			searchState={this.state.childSearchState}
		/>
	)

	Tags = () => (
		<TabTags dataFile={this.state.dataFile || null} onShowModal={this.chgShowModal} doSaveTagsState={this.doSaveTagsState} tagsState={this.state.childTagsState} />
	)

	Import = () => (
		<TabImport
			dataFile={this.state.dataFile || null}
			doImportEntries={this.doImportEntries}
			doSaveImportState={this.doSaveImportState}
			importState={this.state.childImportState}
		/>
	)

	render() {
		return (
			<Router>
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
							<li className='nav-item'>
								<NavLink to='/' exact={true} className='nav-link' activeClassName='active'>
									Home
								</NavLink>
							</li>
							<li className='nav-item'>
								<NavLink to='/journal' activeClassName='active' className={!this.state.dataFile ? 'nav-link disabled' : 'nav-link d-none d-lg-block'}>
									View Journal
								</NavLink>
							</li>
							<li className='nav-item'>
								<NavLink to='/search' activeClassName='active' className={!this.state.dataFile ? 'nav-link disabled' : 'nav-link d-none d-lg-block'}>
									Search Journal
								</NavLink>
							</li>
							<li className='nav-item'>
								<NavLink to='/tags' activeClassName='active' className={!this.state.dataFile ? 'nav-link disabled' : 'nav-link d-none d-lg-block'}>
									Dreamsign Tags
								</NavLink>
							</li>
							<li className='nav-item'>
								<NavLink to='/import' activeClassName='active' className={!this.state.dataFile ? 'nav-link disabled' : 'nav-link d-none d-lg-block'}>
									Import Dreams
								</NavLink>
							</li>
						</ul>
					</div>
				</nav>

				<Route path='/' exact render={this.Home} />
				<Route path='/journal' render={this.Journal} />
				<Route path='/search' render={this.Search} />
				<Route path='/tags' render={this.Tags} />
				<Route path='/import' render={this.Import} />

				<EntryModal
					dreamSignTags={this.getDreamSignTags()}
					doCreateEntry={this.doCreateEntry}
					doDeleteEntry={this.doDeleteEntry}
					doUpdateEntry={this.doUpdateEntry}
					editEntry={this.state.editEntry}
					isExistingEntryDate={this.isExistingEntryDate}
					onShowModal={this.chgShowModal}
					show={this.state.showModal}
				/>
			</Router>
		)
	}
}

// App Container
const AppMain: React.SFC<{ compiler: string; framework: string }> = _props => <App />

ReactDOM.render(<AppMain compiler='TypeScript' framework='React' />, document.getElementById('root'))

/**
 * @see: https://developers.google.com/identity/protocols/OAuth2UserAgent#example
 */
function oauth2SignIn() {
	// @see: https://developers.google.com/identity/protocols/OAuth2UserAgent

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
