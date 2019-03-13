/*\
|*|  :: Dream Journey ::
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

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import '../css/bootstrap.yeticyborg.css'
import DateRangePicker from '../app/date-range-picker'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import LogoBase64 from '../img/logo_base64'
import TabImport from '../app/app-import'
import TabSearch from '../app/app-search'

/* WIP
//import '../templates/bootstrap-switch-button.css'
//import SwitchButton from './bootstrap-switch-button'
//<SwitchButton/>
*/

enum AppTab {
	home = 'home',
	view = 'view',
	search = 'search',
	import = 'import',
}
enum AuthState {
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

interface IAuthState {
	status: AuthState
	userName: ''
	userPhoto: ''
}
export interface IDriveFile {
	id: string
	entries: Array<IJournalEntry>
	modifiedTime: string
	name: string
	size: string
	isLoading: boolean
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
	name: 'dream-journal.json',
	description: 'Brain Cloud Dream Journal data file',
	mimeType: 'application/json',
}
const EMPTY_DREAM = {
	title: '',
	notes: '',
	dreamSigns: [],
	dreamImages: [],
	isLucidDream: false,
	lucidMethod: InductionTypes.none,
}

// ============================================================================

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

function getReadableFileSizeString(fileSizeInBytes: number) {
	var i = -1
	var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB']
	do {
		fileSizeInBytes = fileSizeInBytes / 1024
		i++
	} while (fileSizeInBytes > 1024)

	return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i]
}

// ============================================================================

class AppNavBar extends React.Component<
	{ onSaveFile: Function; onShowTab: Function; selFileName: IDriveFile['name'] },
	{ activeTab: AppTab }
> {
	constructor(
		props: Readonly<{
			onSaveFile: Function
			onShowTab: Function
			selFileName: IDriveFile['name']
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
								className='nav-link'
								href='javascript:void(0)'
								data-name='import'
								onClick={this.onShowTabHandler}>
								Import Entries
							</a>
						</li>
					</ul>
				</div>
				<div className='btn-group mr-3' role='group' aria-label='Selected Journal Name'>
					<button type='button' className='btn btn-secondary' disabled>
						{this.props.selFileName}
					</button>
				</div>
				<form className='form-inline mb-0'>
					<button type='button' onClick={this.onSaveFile} className='btn btn-outline-primary mr-2'>
						Save
					</button>
				</form>
			</nav>
		)
	}
}

class TabHome extends React.Component<{
	authState: IAuthState
	availDataFiles: IDriveFiles['available']
	doAuthSignOut: Function
	doCreateJournal: Function
	doFileListRefresh: Function
	doSelectFileById: Function
	selDataFile: IDriveFile
}> {
	constructor(
		props: Readonly<{
			authState: IAuthState
			availDataFiles: IDriveFiles['available']
			doAuthSignOut: Function
			doCreateJournal: Function
			doFileListRefresh: Function
			doSelectFileById: Function
			selDataFile: IDriveFile
		}>
	) {
		super(props)
	}

	/**
	 * Detect prop (auth) changes, then re-render file list
	 */
	componentDidUpdate(prevProps) {
		if (this.props.authState.status !== prevProps.authState.status) {
			this.handleDriveFileList(null)
		}
	}

	handleDriveSignIn = e => {
		oauth2SignIn()
	}
	handleDriveSignOut = e => {
		this.props.doAuthSignOut()
	}

	handleDriveFileList = e => {
		this.props.doFileListRefresh()
	}

	handleDriveFileCreate = e => {
		this.props.doCreateJournal()
	}

	handleDriveFileGet = e => {
		this.props.doSelectFileById(e.target.getAttribute('data-file-id'))
	}

	/**
	 * @see:
	 */
	handleDriveFileCopy = e => {
		// TODO:
		// Use for "Make backup" (?)
		// POST https://www.googleapis.com/drive/v3/files/fileId/copy
	}

	/**
	 * @see: https://developers.google.com/drive/api/v3/reference/files
	 * @see: https://stackoverflow.com/questions/43705453/how-do-i-rename-a-file-to-google-drive-rest-api-retrofit2
	 */
	handleDriveFileRename = e => {
		// TODO:
		// PATCH https://www.googleapis.com/drive/v3/files/fileId
	}

	/**
	 * @see: https://developers.google.com/drive/api/v3/appdata
	 * @see: https://developers.google.com/drive/api/v3/search-parameters#file_fields
	 */
	render() {
		let cardbody: JSX.Element
		if (this.props.authState.status == AuthState.Authenticated) {
			cardbody = (
				<div>
					<p className='card-text'>
						<label className='text-muted text-uppercase d-block'>User Name:</label>
						{this.props.authState.userName}
					</p>
					<div className='row'>
						<div className='col-12 col-lg-6 mb-md-3'>
							<button
								className='btn btn-outline-primary w-100 mb-3 mb-md-0'
								onClick={this.handleDriveSignIn}>
								Renew
							</button>
						</div>
						<div className='col-12 col-lg-6 text-right'>
							<button className='btn btn-outline-secondary w-100' onClick={this.handleDriveSignOut}>
								Sign Out
							</button>
						</div>
					</div>
				</div>
			)
		} else if (this.props.authState.status == AuthState.Expired) {
			cardbody = (
				<div>
					<p className='card-text'>Your session has expired. Please re-authenticate to continue.</p>
					<button className='btn btn-primary' onClick={this.handleDriveSignIn}>
						Sign In
					</button>
				</div>
			)
		} else {
			cardbody = (
				<div>
					<p className='card-text'>Please sign-in to allow access to Google Drive space.</p>
					<button className='btn btn-primary' onClick={this.handleDriveSignIn}>
						Sign In/Authorize
					</button>
				</div>
			)
		}

		let tableFileList: JSX.Element = (
			<table className='table'>
				<thead className='thead'>
					<tr>
						<th>Status</th>
						<th>File Name</th>
						<th className='text-center d-none d-md-table-cell'>File Size</th>
						<th className='text-center d-none d-md-table-cell'>Last Modified</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{this.props.authState.status == AuthState.Authenticated &&
						this.props.availDataFiles.map((file, idx) => {
							return (
								<tr key={'filerow' + idx}>
									{this.props.selDataFile && this.props.selDataFile.name ? (
										this.props.selDataFile.isLoading ? <td className="text-warning">
										<div className="spinner-border spinner-border-sm mr-2" role="status">
										  <span className="sr-only"></span>
										</div>Loading...
										</td> :
										<td>
											<div className='badge badge-success p-2'>Active</div>
										</td>
									) : (
										<td />
									)}
									<td>{file.name}</td>
									<td className='text-center d-none d-md-table-cell'>
										{getReadableFileSizeString(Number(file['size']))}
									</td>
									<td className='text-center text-nowrap d-none d-md-table-cell'>
										{new Date(file['modifiedTime']).toLocaleString()}
									</td>
									{this.props.selDataFile &&
									this.props.selDataFile.id &&
									file.id === this.props.selDataFile.id ? (
										<td />
									) : (
										<td>
											<button
												className='btn btn-sm btn-primary'
												data-file-id={file['id']}
												onClick={this.handleDriveFileGet}>
												Select
											</button>
										</td>
									)}
								</tr>
							)
						})}
				</tbody>
			</table>
		)

		return (
			<div className='container mt-5'>
				<div className='jumbotron'>
					<h1 className='display-4 text-primary d-none d-md-none d-xl-block'>
						<img src={LogoBase64} width='150' height='150' className='mr-4' alt='Logo' />
						Brain Cloud - Dream Journal
					</h1>
					<h1 className='display-4 text-primary d-none d-md-none d-lg-block d-xl-none'>
						<img src={LogoBase64} width='75' height='75' className='mr-4' alt='Logo' />
						Brain Cloud - Dream Journal
					</h1>
					<h1 className='display-5 text-primary d-none d-md-block d-lg-none'>
						<img src={LogoBase64} width='50' height='50' className='mr-4' alt='Logo' />
						Brain Cloud - Dream Journal
					</h1>
					<h1 className='display-5 text-primary d-block d-md-none'>
						<img src={LogoBase64} width='50' height='50' className='mr-4' alt='Logo' />
						Brain Cloud
					</h1>
					<p className='lead mt-3'>
						Record your daily dream journal entries into well-formatted JSON, enabling keyword searches,
						metrics and more.
					</p>
					<hr className='my-4' />

					<div className='row mb-5'>
						<div className='col-12 col-md-8 d-flex mb-5 mb-md-0'>
							<div className='card flex-fill'>
								<div className='card-header bg-primary'>
									<h5 className='card-title text-white mb-0'>Google Drive Cloud Integration</h5>
								</div>
								<div className='card-body bg-light text-dark'>
									<p className='card-text'>
										This application uses your Google Drive to store dream journals so they are
										safe, secure, and accessible on any of your devices.
									</p>
									<p className='card-text'>
										Signing In will request permissions to create and modify
										<strong> only its own files</strong> on your Google Drive.
									</p>
								</div>
							</div>
						</div>
						<div className='col-12 col-md-4 d-flex'>
							<div className='card flex-fill'>
								<div
									className={
										'card-header' +
										(this.props.authState.status == AuthState.Authenticated
											? ' bg-success'
											: ' bg-warning')
									}>
									<h5 className='card-title text-white mb-0'>{this.props.authState.status}</h5>
								</div>
								<div className='card-body bg-light text-dark'>{cardbody}</div>
							</div>
						</div>
					</div>

					<div className='card'>
						<div className='card-header bg-info'>
							<h5 className='card-title text-white mb-0'>Available Dream Journals</h5>
						</div>
						<div className='card-body bg-light text-dark'>
							{tableFileList}
							<div className='row'>
								<div className='col-12 col-md-6 text-center'>
									<button
										className='btn btn-outline-info w-100 mb-3 mb-md-0'
										onClick={this.handleDriveFileList}>
										Refresh File List
									</button>
								</div>
								<div className='col-12 col-md-6 text-center'>
									<button className='btn btn-outline-info w-100' onClick={this.handleDriveFileCreate}>
										New Dream Journal
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

class TabView extends React.Component<{ onShowModal: Function; selDataFile: IDriveFile }> {
	constructor(props: Readonly<{ onShowModal: Function; selDataFile: IDriveFile }>) {
		super(props)
	}

	handleNewModal = e => {
		this.props.onShowModal({
			show: true,
		})
	}

	handleEditEntryModal = e => {
		this.props.onShowModal({
			show: true,
			editEntry: this.props.selDataFile.entries.filter(entry => {
				return entry.entryDate == e.target.getAttribute('data-entry-key')
			})[0],
		})
	}

	// TODO: Show days with dreams and/or with Lucid success:
	// @see: http://react-day-picker.js.org/examples/elements-cell

	render() {
		let tableFileList: JSX.Element = (
			<table className='table'>
				<thead className='thead'>
					<tr>
						<th>Entry Date</th>
						<th className='text-center d-none d-md-table-cell'>Bed Time</th>
						<th className='text-center d-none d-md-table-cell'>Dream Count</th>
						<th className='text-center d-none d-md-table-cell'>Lucid Dream?</th>
						<th className='text-center'>Action</th>
					</tr>
				</thead>
				<tbody>
					{(this.props.selDataFile && this.props.selDataFile.entries
						? this.props.selDataFile.entries
						: []
					).map((entry: IJournalEntry, idx) => {
						return (
							<tr key={'journalrow' + idx}>
								<td>{entry.entryDate}</td>
								<td className='text-center d-none d-md-table-cell'>{entry.bedTime}</td>
								<td className='text-center d-none d-md-table-cell'>{entry.dreams.length}</td>
								<td className='text-center d-none d-md-table-cell'>
									{entry.dreams.filter(dream => {
										return dream.isLucidDream == true
									}).length > 0 ? (
										<div className='badge badge-success'>Yes</div>
									) : (
										''
									)}
								</td>
								<td className='text-center'>
									<button
										className='btn btn-sm btn-primary px-4'
										data-entry-key={entry.entryDate}
										onClick={this.handleEditEntryModal}>
										Edit
									</button>
								</td>
							</tr>
						)
					})}
				</tbody>
				<tfoot>
					{this.props.selDataFile &&
						this.props.selDataFile.entries &&
						this.props.selDataFile.entries.length == 0 && (
							<tr>
								<td colSpan={3} className='text-center p-3 text-muted'>
									(No Dream Journal entries found - select "Add Journal Entry" above to create a new
									one)
								</td>
							</tr>
						)}
					{!this.props.selDataFile && (
						<tr>
							<td colSpan={5} className='text-center p-3 text-muted'>
								(Select a Dream Journal to see entries)
							</td>
						</tr>
					)}
				</tfoot>
			</table>
		)

		return (
			<div className='container mt-5'>
				<div className='row justify-content-between'>
					<div className='col-12'>
						<div className='card'>
							<div className='card-header bg-primary'>
								<h5 className='card-title text-white mb-0'>Modify Journal</h5>
							</div>
							<div className='card-body bg-light'>
								<div className='row mb-4 align-items-center'>
									<div className='col'>
										Your latest journal entries are shown by default. Use the date range search to
										find specific entries.
									</div>
									<div className='col-auto'>
										<button
											type='button'
											className='btn btn-success'
											disabled={!this.props.selDataFile}
											onClick={this.handleNewModal}>
											Create Day
										</button>
									</div>
								</div>
								<div className='text-center d-block d-sm-none'>
									<DateRangePicker numberOfMonths={1} />
								</div>
								<div className='text-center d-none d-sm-block d-md-none'>
									<DateRangePicker numberOfMonths={2} />
								</div>
								<div className='text-center d-none d-md-block d-lg-none'>
									<DateRangePicker numberOfMonths={2} />
								</div>
								<div className='text-center d-none d-lg-block d-xl-none'>
									<DateRangePicker numberOfMonths={3} />
								</div>
								<div className='text-center d-none d-xl-block'>
									<DateRangePicker numberOfMonths={4} />
								</div>
								{tableFileList}
							</div>
						</div>
					</div>
				</div>

				<div className='row'>
					<div className='col-12' />
				</div>
			</div>
		)
	}
}

// ============================================================================

class EntryModal extends React.Component<
	{ editEntry?: IJournalEntry; onShowModal: Function; show?: boolean },
	{ dailyEntry: IJournalEntry; show: boolean }
> {
	constructor(props: Readonly<{ editEntry?: IJournalEntry; onShowModal: Function; show?: boolean }>) {
		super(props)

		this.state = {
			dailyEntry: {
				entryDate: new Date().toISOString().substring(0, 10),
				bedTime: null,
				notesPrep: null,
				notesWake: null,
				dreams: [EMPTY_DREAM],
			},
			show: props.show,
		}
	}

	// React-Design: Allow `props` changes from other Components to change state/render
	componentWillReceiveProps(nextProps) {
		// A:
		if (
			typeof nextProps.show !== 'undefined' &&
			typeof nextProps.show === 'boolean' &&
			this.state.show !== nextProps.show
		) {
			this.setState({ show: nextProps.show })
		}
		// B:
		if (nextProps.editEntry && this.state.dailyEntry !== nextProps.editEntry) {
			// NOTE: React Feb-2019 wont do: `dailyEntry: nextProps.editEntry`
			// SOLN: create a copy use json+json as `dreams` requires deep copy
			this.setState({
				dailyEntry: JSON.parse(JSON.stringify(nextProps.editEntry)),
			})
		}
		/* HOWTO: reset values upon "New" item entry - do we *have* to pass a flag?? :(
		else if ( !nextProps.editEntry ) {
			// NOTE: `constructor` is only called once on app init, so use this to reset state as modal is reused
			this.setState({
				dailyEntry: {
					entryDate: null,
					bedTime: null,
					notesPrep: null,
					notesWake: null,
					dreams: [{ title: '' }],
				},
			})
			console.log('MODAL: RESET DATA')
		}
		*/
	}

	addRowHandler = event => {
		let dailyEntryNew = this.state.dailyEntry
		dailyEntryNew.dreams.push({
			title: '',
			notes: '',
			dreamSigns: [],
			dreamImages: [],
			isLucidDream: false,
			lucidMethod: null,
		})
		this.setState({ dailyEntry: dailyEntryNew })
	}

	handleInputChange = event => {
		const target = event.target
		const value = target.type === 'checkbox' ? target.checked : target.value
		const name = target.name

		let newState = this.state.dailyEntry
		newState[name] = value

		this.setState({
			dailyEntry: newState,
		})
	}
	handleInputDreamChange = event => {
		const target = event.target
		const value = target.type === 'checkbox' ? target.checked : target.value
		const name = target.name

		let newState = this.state.dailyEntry
		newState.dreams[event.target.getAttribute('data-dream-idx')][name] = value

		this.setState({
			dailyEntry: newState,
		})
	}
	handleSubmit = event => {
		// TODO: Insert or Update?
		if (this.props.editEntry) {
			// TODO: This works, but its an encapsilation violation!!
			// Pass up to App instead (as we'll do for insert)
			// Actually, thats the soln - just pass it up - let app componet search and add or update
			let entryCopy = this.state.dailyEntry
			Object.keys(entryCopy).forEach(key => {
				this.props.editEntry[key] = this.state.dailyEntry[key]
			})
		}
		this.modalClose()
		event.preventDefault()
	}

	modalClose = () => {
		// Reset state in both components
		this.setState({ show: false })
		this.props.onShowModal({ show: false })
	}

	renderDreamRow = (dream: IJournalDream, dreamIdx: number) => {
		return (
			<div className='row pt-3 mb-4' key={'dreamrow' + dreamIdx}>
				<div className='col-auto'>
					<h1 className='text-primary font-weight-light'>{dreamIdx + 1}</h1>
				</div>
				<div className='col'>
					<div className='row mb-3'>
						<div className='col-12 col-md-6'>
							<label className='text-muted text-uppercase text-sm d-block'>Dream Signs</label>
							<input
								name='dreamSigns'
								type='text'
								className='form-control'
								value={dream.dreamSigns}
								onChange={this.handleInputDreamChange}
								data-dream-idx={dreamIdx}
							/>
						</div>
						<div className='col-6 col-md-3'>
							<label className='text-muted text-uppercase text-sm d-block'>Lucid Dream?</label>
							<input
								name='isLucidDream'
								type='checkbox'
								data-toggle='switchbutton'
								checked={dream.isLucidDream}
								onChange={this.handleInputDreamChange}
								data-dream-idx={dreamIdx}
							/>
						</div>
						<div className='col-6 col-md-3'>
							<label className='text-muted text-uppercase text-sm d-block'>Lucid Method</label>
							<select
								name='lucidMethod'
								value={dream.lucidMethod || InductionTypes.none}
								data-dream-idx={dreamIdx}
								onChange={this.handleInputDreamChange}
								className='form-control'>
								{Object.keys(InductionTypes).map(type => {
									return (
										<option value={type} key={'lucid-' + type + '-' + dreamIdx}>
											{InductionTypes[type]}
										</option>
									)
								})}
							</select>
						</div>
					</div>
					<div className='row mb-3'>
						<div className='col'>
							<label className='text-muted text-uppercase text-sm'>Title</label>
							<input
								name='title'
								type='text'
								className='form-control'
								value={dream.title}
								onChange={this.handleInputDreamChange}
								data-dream-idx={dreamIdx}
							/>
						</div>
					</div>
					<div className='row'>
						<div className='col'>
							<label className='text-muted text-uppercase text-sm'>Notes</label>
							<textarea
								name='notes'
								className='form-control'
								rows={5}
								value={dream.notes}
								onChange={this.handleInputDreamChange}
								data-dream-idx={dreamIdx}
							/>
						</div>
					</div>
				</div>
			</div>
		)
	}

	render() {
		return (
			<Modal size='lg' show={this.state.show} onHide={this.modalClose} backdrop='static'>
				<Modal.Header className='bg-primary' closeButton>
					<Modal.Title className='text-white'>Journal Entry</Modal.Title>
				</Modal.Header>

				<Modal.Body className='bg-light'>
					<div className='container mb-4'>
						<div className='row mb-3'>
							<div className='col-12 col-md-6 required'>
								<label className='text-muted text-uppercase text-sm'>Entry Date</label>
								<input
									name='entryDate'
									type='date'
									value={this.state.dailyEntry.entryDate}
									onChange={this.handleInputChange}
									className='form-control w-50'
									required
								/>
								<div className='invalid-feedback'>Please provide Entry Date</div>
							</div>
							<div className='col-12 col-md-6'>
								<label className='text-muted text-uppercase text-sm'>Bed Time</label>
								<input
									name='bedTime'
									type='time'
									value={this.state.dailyEntry.bedTime}
									onChange={this.handleInputChange}
									className='form-control w-50'
								/>
							</div>
						</div>
						<div className='row'>
							<div className='col-12 col-md-6'>
								<label className='text-muted text-uppercase text-sm'>Prep Notes</label>
								<textarea
									name='notesPrep'
									value={this.state.dailyEntry.notesPrep}
									onChange={this.handleInputChange}
									className='form-control'
									rows={3}
								/>
							</div>
							<div className='col-12 col-md-6'>
								<label className='text-muted text-uppercase text-sm'>Wake Notes</label>
								<textarea
									name='notesWake'
									value={this.state.dailyEntry.notesWake}
									onChange={this.handleInputChange}
									className='form-control'
									rows={3}
								/>
							</div>
						</div>
					</div>

					<div className='container'>
						<div className='row mb-3'>
							<div className='col'>
								<h5 className='text-primary'>Dreams</h5>
							</div>
							<div className='col-auto'>
								<button className='btn btn-sm btn-outline-primary' onClick={this.addRowHandler}>
									Add Dream Row
								</button>
							</div>
						</div>
						{this.state.dailyEntry.dreams.map((dream, idx) => this.renderDreamRow(dream, idx))}
					</div>
				</Modal.Body>

				<Modal.Footer>
					<Button variant='outline-secondary' className='px-4 mr-2' onClick={this.modalClose}>
						Close
					</Button>
					<Button variant='success' className='w-25' onClick={this.handleSubmit}>
						Add Entry
					</Button>
				</Modal.Footer>
			</Modal>
		)
	}
}

// ============================================================================

class AppTabs extends React.Component<{
	activeTab: AppTab
	authState: IAuthState
	availDataFiles: IDriveFiles['available']
	doAddNewEntry: Function
	doAuthSignOut: Function
	doCreateJournal: Function
	doFileListRefresh: Function
	doSelectFileById: Function
	onShowModal: Function
	selDataFile: IDriveFile
}> {
	constructor(
		props: Readonly<{
			activeTab: AppTab
			authState: IAuthState
			availDataFiles: IDriveFiles['available']
			doAddNewEntry: Function
			doAuthSignOut: Function
			doCreateJournal: Function
			doFileListRefresh: Function
			doSelectFileById: Function
			onShowModal: Function
			selDataFile: IDriveFile
		}>
	) {
		super(props)
	}

	render() {
		switch (this.props.activeTab) {
			case AppTab.view:
				return <TabView onShowModal={this.props.onShowModal} selDataFile={this.props.selDataFile} />
			case AppTab.search:
				return <TabSearch />
			case AppTab.import:
				return <TabImport selDataFile={this.props.selDataFile} />
			case AppTab.home:
			default:
				return (
					<TabHome
						authState={this.props.authState}
						availDataFiles={this.props.availDataFiles}
						doAuthSignOut={this.props.doAuthSignOut}
						doCreateJournal={this.props.doCreateJournal}
						doFileListRefresh={this.props.doFileListRefresh}
						doSelectFileById={this.props.doSelectFileById}
						selDataFile={this.props.selDataFile}
					/>
				)
		}
	}
}

// MAIN APP
class App extends React.Component<
	{},
	{
		auth: IAuthState
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
							if (selFile && selFile[0]) this.doSelectFileById(selFile[0].id)
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
	doSelectFileById = (fileId: string) => {
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
		newState.selected.isLoading = true
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
						newState.selected.isLoading = false
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
				}
				else if (error.code == '503') {
					let newState = this.state.dataFiles
					newState.selected.isLoading = false
					// TODO: new field like `hasError` to hold "Service Unavailable" etc
				}
				else {
					let newState = this.state.dataFiles
					newState.selected.isLoading = false
					console.error ? console.error(error) : console.log(error)
				}
			})
	}
	doAddNewEntry = (value: IJournalEntry) => {
		let dataFiles = this.state.dataFiles

		if (!dataFiles || !dataFiles.selected) {
			alert('no file selected')
			// TODO: https://getbootstrap.com/docs/4.3/components/toasts/
		} else {
			dataFiles.selected.entries.push(value)
			this.setState({
				dataFiles: dataFiles,
			})
			console.log('New entry added!')
			console.log(this.state.dataFiles.selected)
		}
	}
	/**
	 * @see: https://developers.google.com/drive/api/v3/reference/files/update
	 */
	doSaveFile = () => {
		let params = JSON.parse(localStorage.getItem('oauth2-params'))

		if (!this.state.dataFiles.selected) {
			// TODO: disable save button if no `selected` file exists
			console.log('No file selected!')
			return
		}

		let jsonBody: object = {
			entries: this.state.dataFiles.selected.entries,
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
						// TODO: toast "success"
						// TODO: update date in app menubar?
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

	render() {
		return (
			<main>
				<AppNavBar
					selFileName={
						this.state.dataFiles && this.state.dataFiles.selected && this.state.dataFiles.selected.name
							? this.state.dataFiles.selected.name
							: '(no file selected)'
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
					doAddNewEntry={this.doAddNewEntry}
					doCreateJournal={this.driveCreateNewJournal}
					doFileListRefresh={this.driveGetFileList}
					doAuthSignOut={this.doAuthSignOut}
					doSelectFileById={this.doSelectFileById}
					onShowModal={this.chgShowModal}
					selDataFile={
						this.state.dataFiles && this.state.dataFiles.selected ? this.state.dataFiles.selected : null
					}
				/>
				<EntryModal
					editEntry={this.state.editEntry}
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
