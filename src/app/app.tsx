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

// TODO: https://github.com/FortAwesome/react-fontawesome

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import LogoBase64 from '../img/logo_base64'

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

enum AppTab {
	home = 'home',
	view = 'view',
	search = 'search',
	add = 'add',
}
enum AuthState {
	Authenticated = 'Authenticated',
	Unauthenticated = 'Unauthenticated',
	Expired = 'Expired',
}

interface IAuthState {
	status: AuthState
	userName: ''
	userPhoto: ''
}
interface IJournalDream {
	title: string
	notes?: string
	dreamSigns?: Array<string>
	dreamImages?: Array<string>
	isLucidDream?: boolean
	lucidMethod?: 'dild' | 'mild' | 'wbtb' | 'wild' | 'other'
}
interface IJournalEntry {
	entryDate: string
	bedTime?: string
	notesPrep?: string
	notesWake?: string
	dreams?: Array<IJournalDream>
}
interface IDriveFile {
	id: string
	entries: Array<IJournalEntry>
	modifiedTime: string
	name: string
	size: string
}
interface IDriveFiles {
	available: Array<IDriveFile>
	selected: IDriveFile
}

// @see: https://flaviocopes.com/react-forms/
// @see: https://github.com/jaredpalmer/formik
// TODO: https://reactjs.org/docs/forms.html

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
	{ onSaveFile: Function; onShowModal: Function; onShowTab: Function; selFileName: IDriveFile['name'] },
	{ activeTab: AppTab }
> {
	constructor(
		props: Readonly<{
			onSaveFile: Function
			onShowModal: Function
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
	onShowModalHandler = e => {
		this.props.onShowModal(true)
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
					Dream Journal App
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
								View Dream Journal
							</a>
						</li>
						<li className={this.state.activeTab == AppTab.add ? 'nav-item active' : 'nav-item'}>
							<a
								className='nav-link'
								href='javascript:void(0)'
								data-name='add'
								onClick={this.onShowTabHandler}>
								Add Journal Entry
							</a>
						</li>
						<li className={this.state.activeTab == AppTab.search ? 'nav-item active' : 'nav-item'}>
							<a
								className='nav-link'
								href='javascript:void(0)'
								data-name='search'
								onClick={this.onShowTabHandler}>
								Search Dream Journal
							</a>
						</li>
					</ul>
				</div>
				<div className='btn-group mr-3' role='group' aria-label='Journal Stats'>
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
	dataFiles: IDriveFiles
	doCreateJournal: Function
	doFileListRefresh: Function
	doSelectFileById: Function
}> {
	constructor(
		props: Readonly<{
			authState: IAuthState
			dataFiles: IDriveFiles
			doCreateJournal: Function
			doFileListRefresh: Function
			doSelectFileById: Function
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

	handleDriveLogin = e => {
		oauth2SignIn()
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
					<button className='btn btn-success' onClick={this.handleDriveLogin}>
						Re-Auth
					</button>
				</div>
			)
		} else if (this.props.authState.status == AuthState.Expired) {
			cardbody = (
				<div>
					<p className='card-text'>Your session has expired. Please re-authenticate to continue.</p>
					<button className='btn btn-success' onClick={this.handleDriveLogin}>
						Renew
					</button>
				</div>
			)
		} else {
			cardbody = (
				<div>
					<p className='card-text'>Please sign-in to allow access to Google Drive space.</p>
					<button className='btn btn-primary' onClick={this.handleDriveLogin}>
						Sign In/Authorize
					</button>
				</div>
			)
		}

		let selFile =
			this.props.dataFiles.selected && this.props.dataFiles.selected.id
				? this.props.dataFiles.available.filter(file => {
						return file.id === this.props.dataFiles.selected.id
				  })[0]
				: null
		let tableFileList: JSX.Element = (
			<table className='table'>
				<thead className='thead'>
					<tr>
						<th>Status</th>
						<th>File Name</th>
						<th className='text-center'>File Size</th>
						<th>Last Modified</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{this.props.dataFiles.available.map((file, idx) => {
						return (
							<tr key={'filerow' + idx}>
								{selFile && file.id === selFile.id ? (
									<td>
										<div className='badge badge-success'>Active</div>
									</td>
								) : (
									<td />
								)}
								<td>{file['name']}</td>
								<td className='text-center'>{getReadableFileSizeString(Number(file['size']))}</td>
								<td className='text-nowrap'>{new Date(file['modifiedTime']).toLocaleString()}</td>
								{selFile && file.id === selFile.id ? (
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
					<h1 className='display-4 text-primary d-none d-md-block'>
						<img
							src={LogoBase64}
							width='150'
							height='150'
							className='mr-4 d-none d-lg-inline-block'
							alt='Logo'
						/>
						Brain Cloud - Dream Journal
					</h1>
					<h2 className='display-5 text-primary mb-3 d-block d-md-none'>Brain Cloud</h2>
					<p className='lead'>
						Record your daily dream journal entries into well-formatted JSON, enabling keyword searches,
						metrics and more.
					</p>
					<hr className='my-4' />

					<div className='d-flex mb-5'>
						<div className='card flex-grow-1 w-75 mr-5'>
							<div className='card-header bg-primary'>
								<h5 className='card-title text-white mb-0'>Google Drive Cloud Integration</h5>
							</div>
							<div className='card-body bg-light text-dark'>
								<p className='card-text'>
									This application uses your Google Drive to store dream journals so they are safe,
									secure, and accessible on any of your devices.
								</p>
								<p className='card-text'>
									Signing In will request permissions to create and modify
									<strong> only its own files</strong> on your Google Drive.
								</p>
							</div>
						</div>
						<div className='card flex-grow-1 w-25'>
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

					<div className='row'>
						<div className='col-12'>
							<div className='card'>
								<div className='card-header bg-info'>
									<h5 className='card-title text-white mb-0'>Available Dream Journals</h5>
								</div>
								<div className='card-body bg-light text-dark'>
									{tableFileList}
									<div className='row'>
										<div className='col-12 col-md-6 text-center'>
											<button
												className='btn btn-outline-info w-50'
												onClick={this.handleDriveFileList}>
												Refresh File List
											</button>
										</div>
										<div className='col-12 col-md-6 text-center'>
											<button
												className='btn btn-outline-info w-50'
												onClick={this.handleDriveFileCreate}>
												Create New Dream Journal
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

class TabView extends React.Component<{ selDataFile: IDriveFile }> {
	constructor(props: Readonly<{ selDataFile: IDriveFile }>) {
		super(props)
	}

	render() {
		console.log(this.props.selDataFile)
		let tableFileList: JSX.Element = (
			<table className='table'>
				<thead className='thead'>
					<tr>
						<th>Entry Date</th>
						<th>Dream Count</th>
						<th>Action</th>
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
								<td>{entry.dreams.length}</td>
								<td>
									<button className='btn btn-sm btn-primary' data-entry-key={entry.entryDate}>
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
							<td colSpan={3} className='text-center p-3 text-muted'>
								(Select a Dream Journal to see entries)
							</td>
						</tr>
					)}
				</tfoot>
			</table>
		)

		return (
			<div className='container mt-3'>
				<h2 className='text-primary mb-3'>View Dream Journal</h2>
				{tableFileList}
			</div>
		)
	}
}

class TabAdd extends React.Component<{ doAddNewEntry: Function }, { dailyEntry: IJournalEntry }> {
	constructor(props: Readonly<{ show?: boolean; doAddNewEntry: Function }>) {
		super(props)

		this.state = {
			dailyEntry: {
				entryDate: new Date().toISOString().substring(0, 10),
				bedTime: '',
				notesPrep: '',
				notesWake: '',
				dreams: [{ title: '' }],
			},
		}
	}

	addRowHandler = event => {
		let dailyEntryNew = this.state.dailyEntry
		dailyEntryNew.dreams.push({ title: '' })
		this.setState({ dailyEntry: dailyEntryNew })
	}

	handleChange = event => {
		console.log('form field changed!')

		if (event && event.target && event.target.id) {
			let updatedEntry = this.state.dailyEntry

			if (event.target.id == 'entryDate') {
				updatedEntry.entryDate = event.target.value
			} else if (event.target.id == 'bedTime') {
				updatedEntry.bedTime = event.target.value
			} else if (event.target.id == 'notesPrep') {
				updatedEntry.notesPrep = event.target.value
			} else if (event.target.id == 'notesWake') {
				updatedEntry.notesWake = event.target.value
			}

			// CURR: FIXME:
			// TODO: CURR: keep going! add DREAM ROW(S)
			// what to do about DREAM-n rows - they wont have unique ids?

			this.setState({ dailyEntry: updatedEntry })
		}

		console.log(this.state.dailyEntry)
	}

	handleSubmit = event => {
		this.props.doAddNewEntry(this.state.dailyEntry)
		event.preventDefault()
	}

	renderDreamRow = (dream: IJournalDream, idx: number) => {
		return (
			<div className='row p-3 mb-4 bg-light' key={'dreamrow' + idx}>
				<div className='col-auto'>
					<h2 className='text-primary font-weight-light'>{idx + 1}</h2>
				</div>
				<div className='col'>
					<div className='row mb-3'>
						<div className='col'>
							<label className='text-muted text-uppercase text-sm'>Title</label>
							<input
								id='title'
								type='text'
								className='form-control'
								value={dream.title}
								onChange={this.handleChange}
							/>
						</div>
						<div className='col-auto'>
							<label className='text-muted text-uppercase text-sm d-block'>Lucid Dream?</label>
							<span>TODO-bs4-toggle</span>
						</div>
						<div className='col-auto'>
							<label className='text-muted text-uppercase text-sm d-block'>Lucid Method</label>
							<select className='form-control'>
								<option>Select...</option>
							</select>
						</div>
					</div>
					<div className='row'>
						<div className='col'>
							<label className='text-muted text-uppercase text-sm'>Notes</label>
							<textarea
								id='notes'
								className='form-control'
								rows={5}
								value={dream.notes}
								onChange={this.handleChange}
							/>
						</div>
					</div>
				</div>
			</div>
		)
	}

	render() {
		return (
			<form onSubmit={this.handleSubmit}>
				<div className='container mt-3'>
					<div className='row no-gutters'>
						<div className='col'>
							<h2 className='text-primary mb-3'>New Journal Entry</h2>
						</div>
						<div className='col-auto'>
							<button type='submit' className='btn btn-primary px-4'>
								Add to Journal
							</button>
						</div>
					</div>
					<div className='container bg-light p-4'>
						<div className='row mb-4'>
							<div className='col-12 col-md-6 required'>
								<label className='text-muted text-uppercase text-sm'>Entry Date</label>
								<input
									id='entryDate'
									type='date'
									className='form-control w-50'
									required
									value={this.state.dailyEntry.entryDate}
									onChange={this.handleChange}
								/>
								<div className='invalid-feedback'>Please provide Entry Date</div>
							</div>
							<div className='col-12 col-md-6'>
								<label className='text-muted text-uppercase text-sm'>Bed Time</label>
								<input
									id='bedTime'
									type='time'
									className='form-control w-50'
									value={this.state.dailyEntry.bedTime}
									onChange={this.handleChange}
								/>
							</div>
						</div>
						<div className='row'>
							<div className='col-12 col-md-6'>
								<label className='text-muted text-uppercase text-sm'>Prep Notes</label>
								<textarea id='notesPrep' className='form-control' rows={3} />
							</div>
							<div className='col-12 col-md-6'>
								<label className='text-muted text-uppercase text-sm'>Wake Notes</label>
								<textarea id='notesWake' className='form-control' rows={3} />
							</div>
						</div>
					</div>
					<div className='container mt-4'>
						<div className='row mb-3'>
							<div className='col'>
								<h4 className='text-primary'>Dreams</h4>
							</div>
							<div className='col-auto'>
								<button
									type='button'
									className='btn btn-sm btn-outline-info'
									onClick={this.addRowHandler}>
									Add Dream Row
								</button>
							</div>
						</div>
						{this.state.dailyEntry.dreams.map((dream, idx) => this.renderDreamRow(dream, idx))}
					</div>
				</div>
			</form>
		)
	}
}

class TabSearch extends React.Component {
	render() {
		return (
			<div className='container mt-3'>
				<h2 className='text-primary mb-3'>Search Dream Journal</h2>

				<div className='row'>
					<div className='col-auto'>
						<h1 className='text-primary'>TODO</h1>
					</div>
					<div className='col-auto'>
						<h6 id='appVer' className='text-black-50 font-weight-light' />
					</div>
				</div>
			</div>
		)
	}
}

// ============================================================================

class AppModal extends React.Component<{ show?: boolean }, { show: boolean; dailyEntry: IJournalEntry }> {
	constructor(props: Readonly<{ show?: boolean }>) {
		super(props)

		this.state = {
			show: props.show,
			dailyEntry: {
				entryDate: null,
				bedTime: null,
				notesPrep: null,
				notesWake: null,
				dreams: [{ title: '' }],
			},
		}
	}

	// React-Design: Allow `props` changes from other Components to change state/render
	componentWillReceiveProps(nextProps) {
		const newName = nextProps.show
		if (this.state.show !== newName) {
			this.setState({ show: newName })

			// NOTE: `constructor` is only called once on app init, so use this to reset state as modal is reused
			if (newName == true) {
				this.setState({
					dailyEntry: {
						entryDate: null,
						bedTime: null,
						notesPrep: null,
						notesWake: null,
						dreams: [{ title: '' }],
					},
				})
			}
		}
	}

	addRowHandler = e => {
		let dailyEntryNew = this.state.dailyEntry
		dailyEntryNew.dreams.push({ title: '' })
		this.setState({ dailyEntry: dailyEntryNew })
	}

	changeHandler = e => {
		console.log('form field changed!')
	}

	renderDreamRow = (dream: IJournalDream, idx: number) => {
		return (
			<div className='row pt-3 mb-4 border-top' key={'dreamrow' + idx}>
				<div className='col-auto'>
					<h2 className='text-primary font-weight-light'>{idx + 1}</h2>
				</div>
				<div className='col'>
					<div className='row mb-3'>
						<div className='col'>
							<label className='text-muted text-uppercase text-sm'>Title</label>
							<input
								id='title'
								type='text'
								className='form-control'
								value={dream.title}
								onChange={this.changeHandler}
							/>
						</div>
						<div className='col-auto'>
							<label className='text-muted text-uppercase text-sm d-block'>Lucid Dream?</label>
							<span>TODO-bs4-toggle</span>
						</div>
						<div className='col-auto'>
							<label className='text-muted text-uppercase text-sm d-block'>Lucid Method</label>
							<select className='form-control'>
								<option>Select...</option>
							</select>
						</div>
					</div>
					<div className='row'>
						<div className='col'>
							<label className='text-muted text-uppercase text-sm'>Notes</label>
							<textarea
								id='notes'
								className='form-control'
								rows={5}
								value={dream.notes}
								onChange={this.changeHandler}
							/>
						</div>
					</div>
				</div>
			</div>
		)
	}

	render() {
		let modalClose = () => {
			this.setState({ show: false })
		}

		return (
			<Modal size='lg' show={this.state.show} onHide={modalClose} backdrop='static'>
				<Modal.Header className='bg-primary' closeButton>
					<Modal.Title className='text-white'>Journal Entry</Modal.Title>
				</Modal.Header>

				<Modal.Body className='bg-light'>
					<div className='container mb-4'>
						<div className='row mb-3'>
							<div className='col-12 col-md-6 required'>
								<label className='text-muted text-uppercase text-sm'>Entry Date</label>
								<input id='entryDate' type='date' className='form-control w-50' required />
								<div className='invalid-feedback'>Please provide Entry Date</div>
							</div>
							<div className='col-12 col-md-6'>
								<label className='text-muted text-uppercase text-sm'>Bed Time</label>
								<input id='bedTime' type='time' className='form-control w-50' />
							</div>
						</div>
						<div className='row'>
							<div className='col-12 col-md-6'>
								<label className='text-muted text-uppercase text-sm'>Prep Notes</label>
								<textarea id='notesPrep' className='form-control' rows={3} />
							</div>
							<div className='col-12 col-md-6'>
								<label className='text-muted text-uppercase text-sm'>Wake Notes</label>
								<textarea id='notesWake' className='form-control' rows={3} />
							</div>
						</div>
					</div>

					<div className='container'>
						<div className='row mb-3'>
							<div className='col'>
								<h5 className='text-primary'>Dreams</h5>
							</div>
							<div className='col-auto'>
								<button className='btn btn-sm btn-outline-info' onClick={this.addRowHandler}>
									Add Dream Row
								</button>
							</div>
						</div>
						{this.state.dailyEntry.dreams.map((dream, idx) => this.renderDreamRow(dream, idx))}
					</div>
				</Modal.Body>

				<Modal.Footer>
					<Button variant='secondary' className='px-4 mr-2' onClick={modalClose}>
						Close
					</Button>
					<Button variant='primary' className='w-25'>
						Submit
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
	dataFiles: IDriveFiles
	doAddNewEntry: Function
	doCreateJournal: Function
	doFileListRefresh: Function
	doSelectFileById: Function
	selDataFile: IDriveFile
}> {
	constructor(
		props: Readonly<{
			activeTab: AppTab
			authState: IAuthState
			dataFiles: IDriveFiles
			doAddNewEntry: Function
			doCreateJournal: Function
			doFileListRefresh: Function
			doSelectFileById: Function
			selDataFile: IDriveFile
		}>
	) {
		super(props)
	}

	render() {
		switch (this.props.activeTab) {
			case AppTab.view:
				return <TabView selDataFile={this.props.selDataFile} />
			case AppTab.add:
				return <TabAdd doAddNewEntry={this.props.doAddNewEntry} />
			case AppTab.search:
				return <TabSearch />
			case AppTab.home:
			default:
				return (
					<TabHome
						authState={this.props.authState}
						dataFiles={this.props.dataFiles}
						doCreateJournal={this.props.doCreateJournal}
						doFileListRefresh={this.props.doFileListRefresh}
						doSelectFileById={this.props.doSelectFileById}
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
		showModal: boolean
		showTab: AppTab
	}
> {
	constructor(props: Readonly<{ auth: IAuthState; dataFiles: IDriveFiles; showModal: boolean }>) {
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
			showModal: props.showModal || false,
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

	chgShowModal = (value: boolean) => {
		this.setState({
			showModal: value,
		})
	}
	chgShowTab = (value: AppTab) => {
		this.setState({
			showTab: value,
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

		if (!selFile) {
			console.error ? console.error('NO SUCH FILE') : console.log('WTH?!')
			return
		}

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
						if (decoded && decoded.length > 0) {
							try {
								// NOTE: Initial dream-journal file is empty!
								json = JSON.parse(decoded)
								entries = json['entries']
								console.log('FYI: Get File results:')
								console.log(json) // DEBUG
							} catch (ex) {
								// TODO: Show message onscreen
								console.error ? console.error(ex) : console.log(ex)
							}
						}
						let newState = this.state.dataFiles
						newState.selected = selFile
						newState.selected.entries = entries || []

						this.setState({
							dataFiles: newState,
						})
						console.log('FYI: app.state.dataFiles updated')
						console.log(this.state.dataFiles)

						localStorage.setItem('journal-selected-fileid', selFile.id)
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
						console.log(fileResource)
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
					onShowModal={this.chgShowModal}
					onShowTab={this.chgShowTab}
				/>
				<AppTabs
					activeTab={this.state.showTab}
					authState={this.state.auth}
					dataFiles={this.state.dataFiles}
					doAddNewEntry={this.doAddNewEntry}
					doCreateJournal={this.driveCreateNewJournal}
					doFileListRefresh={this.driveGetFileList}
					doSelectFileById={this.doSelectFileById}
					selDataFile={
						this.state.dataFiles && this.state.dataFiles.selected ? this.state.dataFiles.selected : null
					}
				/>
				<AppModal show={this.state.showModal} />
			</main>
		)
	}
}

// App Container
const AppMain: React.SFC<{ compiler: string; framework: string }> = props => {
	return <App />
}

ReactDOM.render(<AppMain compiler='TypeScript' framework='React' />, document.getElementById('root'))
