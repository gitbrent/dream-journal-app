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

interface IDream {
	title: string
	notes?: string
	dreamSigns?: Array<string>
	lucidDream?: boolean
	lucidMethod?: 'dild' | 'mild' | 'wbtb' | 'other'
}
interface IDailyEntry {
	entryDate: string
	bedTime?: string
	notesPrep?: string
	notesWake?: string
	dreams?: Array<IDream>
}
interface IAppTabs {
	tabs: 'home' | 'search' | 'add'
}

// @see: https://flaviocopes.com/react-forms/
// @see: https://github.com/jaredpalmer/formik
// TODO: https://reactjs.org/docs/forms.html

class AppNavBar extends React.Component<
	{ appData: Array<IDailyEntry>; onShowModal: Function; onShowTab: Function },
	{ activeTab: IAppTabs['tabs'] }
> {
	constructor(props: Readonly<{ appData: Array<IDailyEntry>; onShowModal: Function; onShowTab: Function }>) {
		super(props)

		this.state = {
			activeTab: 'home',
		}
	}

	onShowModalHandler = e => {
		if (typeof this.props.onShowModal === 'function') {
			//this.props.onShowModal(e.target.value);
			//this.props.onShowModal('TAB1');
			this.props.onShowModal(true)
		}
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
			<nav className='navbar navbar-expand-lg navbar-light bg-light'>
				<a className='navbar-brand' href='javascript:void(0)'>
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
					aria-label='Toggle navigation'
				>
					<span className='navbar-toggler-icon' />
				</button>
				<div className='collapse navbar-collapse' id='navbarNav'>
					<ul className='navbar-nav'>
						<li className={this.state.activeTab == 'home' ? 'nav-item active' : 'nav-item'}>
							<a
								className='nav-link'
								href='javascript:void(0)'
								data-name='home'
								onClick={this.onShowTabHandler}
							>
								Home <span className='sr-only'>(current)</span>
							</a>
						</li>
						<li className={this.state.activeTab == 'add' ? 'nav-item active' : 'nav-item'}>
							<a
								className='nav-link'
								href='javascript:void(0)'
								data-name='add'
								onClick={this.onShowTabHandler}
							>
								View Dream Journal
							</a>
						</li>
						<li className={this.state.activeTab == 'search' ? 'nav-item active' : 'nav-item'}>
							<a
								className='nav-link'
								href='javascript:void(0)'
								data-name='search'
								onClick={this.onShowTabHandler}
							>
								Search Dream Journal
							</a>
						</li>
					</ul>
				</div>
				<div className='btn-group mr-3' role='group' aria-label='Journal Stats'>
					<button type='button' className='btn btn-secondary' disabled>
						Journal Entries
					</button>
					<button type='button' className='btn btn-secondary' disabled>
						{this.props.appData.length}
					</button>
				</div>
				<form className='form-inline mb-0'>
					<button type='button' onClick={this.onShowModalHandler} className='btn btn-outline-primary mr-2'>
						Settings
					</button>
				</form>
			</nav>
		)
	}
}

// ============================================================================

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
		client_id: '701167709173-0gp4mi6oi5n4mvqcfqso3uooh9l5o4lt.apps.googleusercontent.com',
		redirect_uri: 'http://localhost:8080/',
		response_type: 'token',
		scope: 'https://www.googleapis.com/auth/drive.appdata',
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
		localStorage.setItem('oauth2-test-params', JSON.stringify(params))
	}
}

class TabHome extends React.Component<{ onChgLoadData: Function }> {
	constructor(props: Readonly<{ onChgLoadData: Function }>) {
		super(props)
		// DOCS: https://reactjs.org/docs/refs-and-the-dom.html
		// Their own example doesnt work in v16.8
		// this.myRef = React.createRef(); // FIXME
	}

	handleGoogleDrive = e => {
		parseStoreAccessKey()
		var params = JSON.parse(localStorage.getItem('oauth2-test-params'))
		if (!params || !params['access_token']) {
			oauth2SignIn()
			return
		}

		/*
		Google OAuth2.0
		Scope: https://www.googleapis.com/auth/drive.appdata
		"View and manage its own configuration data in your Google Drive"
		*/
		// GET https://www.googleapis.com/drive/v3/files/
		// Authorization: Bearer [YOUR_ACCESS_TOKEN]
		// Accept: application/json
		fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder', {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				Authorization: 'Bearer ' + params['access_token'],
			},
		})
			.then(response => {
				response.json().then(json => {
					let data = json
					console.log(data)
					console.log(data.files)
				})
			})
			.catch(error => {
				console.error ? console.error(error) : console.log(error)
			})
	}

	handleFileSelect = event => {
		if (event.target.files.length > 0) {
			const reader = new FileReader()
			reader.onload = ev => {
				try {
					// NOTE: Cannot use `e.target.result` as of Jan-2019
					// SEE: https://stackoverflow.com/questions/35789498/new-typescript-1-8-4-build-error-build-property-result-does-not-exist-on-t
					let jsonJournal = JSON.parse(ev.target['result'])
					this.props.onChgLoadData(jsonJournal && jsonJournal.data ? jsonJournal.data : [])
				} catch (ex) {
					// TODO: Show errors on screen
					console.log('ERROR: ' + ex)
				}
			}
			reader.readAsText(event.target.files[0])
		}
	}

	render() {
		// TODO: FIXME:
		//let filePicker = <input ref={this.myRef} type="file" className="form-control-file d-none" accept=".json" onChange={this.handleFileSelect} />
		let filePicker = (
			<input type='file' className='form-control-file' accept='.json' onChange={this.handleFileSelect} />
		)
		/*
		TODO: use 2 buttons instead (New and Open)
		https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications#Using_hidden_file_input_elements_using_the_click()_method
		*/
		// HELP: need ref, cant create one
		// <button className="btn btn-primary w-50" onClick={filePicker.click()}>Open Dream Journal</button>

		return (
			<div className='container mt-5'>
				<div className='jumbotron'>
					<h1 className='display-4 text-primary mb-3 d-none d-md-block'>
						<img
							src={LogoBase64}
							width='150'
							height='150'
							className='mr-4 d-none d-lg-inline-block'
							alt='Logo'
						/>
						Dream Journal App
					</h1>
					<h2 className='display-5 text-primary mb-3 d-block d-md-none'>Dream Journal App</h2>
					<p className='lead'>
						Record your daily dream journal entries into well-formatted JSON, enabling keyword searches,
						metrics and more.
					</p>
					<hr className='my-5' />
					<div className='row'>
						<div className='col-12 col-md-6 text-center mb-3'>
							<button className='btn btn-primary w-50'>Open Dream Journal</button>
						</div>
						<div className='col-12 col-md-6 text-center mb-3'>
							<button className='btn btn-primary w-50'>Create Dream Journal</button>
						</div>
					</div>

					<p>Select an exising Dream Journal, or select "New Journal Entry" above to start a new one.</p>
					<div className='form-group bg-white p-3'>
						<label className='text-muted text-uppercase'>Open Exising File</label>
						{filePicker}
					</div>
					<button type='button' className='btn btn-warning' onClick={this.handleGoogleDrive}>
						Google Drive
					</button>
				</div>
			</div>
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

class TabAdd extends React.Component<{ onChgNewEntry: Function }, { dailyEntry: IDailyEntry }> {
	constructor(props: Readonly<{ show?: boolean; onChgNewEntry: Function }>) {
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
			}
			// TODO: CURR: keep going! add all other fields!!
			// what to do about DREAM-n rows - they wont have unique ids?

			this.setState({ dailyEntry: updatedEntry })
		}

		console.log(this.state.dailyEntry)
	}

	handleSubmit = event => {
		this.props.onChgNewEntry(this.state.dailyEntry)
		event.preventDefault()
		console.log('SUBMIT!')
		console.log(this.state.dailyEntry)
	}

	renderDreamRow = (dream: IDream, idx: number) => {
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
									onClick={this.addRowHandler}
								>
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

// ============================================================================

class AppModal extends React.Component<{ show?: boolean }, { show: boolean; dailyEntry: IDailyEntry }> {
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

	renderDreamRow = (dream: IDream, idx: number) => {
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
	activeTab: IAppTabs['tabs']
	onChgLoadData: Function
	onChgNewEntry: Function
}> {
	constructor(props: Readonly<{ activeTab: IAppTabs['tabs']; onChgLoadData: Function; onChgNewEntry: Function }>) {
		super(props)
	}

	render() {
		switch (this.props.activeTab) {
			case 'search':
				return <TabSearch />
			case 'add':
				return <TabAdd onChgNewEntry={this.props.onChgNewEntry} />
			case 'home':
			default:
				return <TabHome onChgLoadData={this.props.onChgLoadData} />
		}
	}
}

// APP UI
class App extends React.Component<{}, { data: Array<IDailyEntry>; showModal: boolean; showTab: IAppTabs['tabs'] }> {
	constructor(props) {
		super(props)

		this.state = {
			data: [],
			showModal: props.showModal || false,
			showTab: 'home',
		}
	}

	chgShowModal = (value: boolean) => {
		this.setState({
			showModal: value,
		})
	}
	chgShowTab = (value: IAppTabs['tabs']) => {
		this.setState({
			showTab: value,
		})
	}
	chgLoadData = (value: Array<IDailyEntry>) => {
		this.setState({
			data: value,
		})
		console.log('Data updated!')
		console.log(this.state.data)
	}
	chgNewEntry = (value: IDailyEntry) => {
		let appData = this.state.data
		appData.push(value)
		this.setState({
			data: appData,
		})
		console.log('New entry added!')
		console.log(this.state.data)
	}

	render() {
		return (
			<main>
				<AppNavBar appData={this.state.data} onShowModal={this.chgShowModal} onShowTab={this.chgShowTab} />
				<AppTabs
					activeTab={this.state.showTab}
					onChgLoadData={this.chgLoadData}
					onChgNewEntry={this.chgNewEntry}
				/>
				<AppModal show={this.state.showModal} />
			</main>
		)
	}
}

// AppMain
const AppMain: React.SFC<{ compiler: string; framework: string }> = props => {
	return <App />
}

ReactDOM.render(<AppMain compiler='TypeScript' framework='React' />, document.getElementById('root'))
