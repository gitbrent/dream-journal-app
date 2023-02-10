/**
 * @see https://developers.google.com/drive/api/guides/about-sdk
 * @see https://developers.google.com/drive/api/guides/search-files#node.js
 * @see https://developers.google.com/drive/api/guides/fields-parameter
 * @see https://developers.google.com/drive/api/v3/reference/files/get
 * @see https://medium.com/@willikay11/how-to-link-your-react-application-with-google-drive-api-v3-list-and-search-files-2e4e036291b7
 */
import React, { useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { gapi } from 'gapi-script'
import { IAuthState, IDriveDataFile, IJournalEntry, IDriveConfFile, IGapiCurrUser, IGapiFile } from './app.types'
import TabHome from '../app/app-home'
import TabBedtime from '../app/app-bedtime'
import TabExplore from '../app/app-explore'
import TabJournal from './app-journal'
import TabTags from '../app/app-tags'
//import TabTags2 from '../app/app-tags2'
import TabSearch from '../app/app-search'
import TabAdmin from '../app/app-admin'
import TabImport from '../app/app-import'
import LogoBase64 from '../img/logo_base64'

export default function AppMain() {
	const GAPI_CLIENT_ID = process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_ID
	const GAPI_API_KEY = process.env.REACT_APP_GOOGLE_DRIVE_API_KEY
	const GAPI_DISC_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
	const GAPI_SCOPES = 'https://www.googleapis.com/auth/drive.file'
	//
	const [signedInUser, setSignedInUser] = useState('')
	const [gapiFiles, setGapiFiles] = useState<IGapiFile[]>([])
	//
	const [appErrMsg, setAppErrMsg] = useState('')
	const [auth, setAuth] = useState<IAuthState>(null)
	const [dataFile, setDataFile] = useState<IDriveDataFile>(null)
	const [confFile, setConfFile] = useState<IDriveConfFile>(null)
	const [isBusyLoad, setIsBusyLoad] = useState(false)
	const [editEntry, setEditEntry] = useState<IJournalEntry>(null)

	/**
	 * Sign in the user upon button click.
	 */
	const handleAuthClick = () => {
		gapi.auth2.getAuthInstance().signIn()
	}

	/**
	 * Called when the signed in status changes, to update the UI appropriately. After a sign-in, the API is called.
	 */
	const updateSigninStatus = (isSignedIn: boolean) => {
		if (isSignedIn) {
			const currentUser: IGapiCurrUser = gapi.auth2.getAuthInstance().currentUser

			// Set the signed in user
			setSignedInUser(currentUser?.le?.wt?.Ad)
			setIsBusyLoad(false)

			// list files if user is authenticated
			listFiles()
			//fetchFolders() // WIP:
		} else {
			// prompt user to sign in
			handleAuthClick()
		}
	}

	/**
	 * Print files
	 */
	const listFiles = (searchTerm = null) => {
		console.log('TODO: `searchTerm`', searchTerm)

		gapi.client.drive.files
			.list({
				pageSize: 1000,
				fields: 'nextPageToken, files(id, name, createdTime, mimeType, modifiedTime, size)',
				// TODO: works! but we need to add filter/scaling for videos q: `mimeType = 'image/png' or mimeType = 'image/jpeg' or mimeType = 'image/gif' or mimeType = 'video/mp4'`,
				q: 'trashed=false and (mimeType = \'image/png\' or mimeType = \'image/jpeg\' or mimeType = \'image/gif\')',
			})
			.then(function(response: any) {
				const res = JSON.parse(response.body)
				setGapiFiles(res.files)
			})
	}

	/**
 *  Initializes the API client library and sets up sign-in state listeners.
 */
	const initClient = () => {
		setIsBusyLoad(true)
		gapi.client
			.init({
				apiKey: GAPI_API_KEY,
				clientId: GAPI_CLIENT_ID,
				discoveryDocs: GAPI_DISC_DOCS,
				scope: GAPI_SCOPES,
			})
			.then(
				() => {
					// Listen for sign-in state changes.
					gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus)

					// Handle the initial sign-in state.
					updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())

					setIsBusyLoad(false)
				},
				(error: any) => {
					console.error(error)
					setIsBusyLoad(false)
				}
			)
	}

	const handleClientLoad = () => {
		gapi.load('client:auth2', initClient)
	}

	function renderLogin(): JSX.Element {
		return (<section onClick={handleClientLoad} className="text-center p-4 bg-dark">
			<div className='p-4'>
				<img height="150" width="150" src="/google-drive.png" alt="GoogleDriveImage" />
			</div>
			<h5>Google Drive</h5>
			<p>view media directly from your google drive</p>
		</section>)
	}


	//#region tabs
	const Home = () => (<TabHome dataFile={dataFile || null} isBusyLoad={isBusyLoad} authState={auth} />)

	const Bedtime = () => (
		<TabBedtime confFile={confFile || null}
			dataFile={dataFile || null}
			isBusyLoad={isBusyLoad}
		/>
	)
	const Explore = () => (
		<TabExplore confFile={confFile || null} dataFile={dataFile || null} isBusyLoad={isBusyLoad} />
	)
	const Journal = () => (
		<TabJournal dataFile={dataFile || null} doSaveViewState={null} viewState={null} isBusyLoad={isBusyLoad} />
	)
	const Search = () => (
		<TabSearch dataFile={dataFile || null} isBusyLoad={isBusyLoad} doSaveSearchState={null} searchState={null} />
	)
	const Tags = () => (
		<TabTags dataFile={dataFile || null} isBusyLoad={isBusyLoad} />
	)
	const Import = () => <TabImport dataFile={dataFile || null} doSaveImportState={null} importState={null} />
	const Admin = () => <TabAdmin dataFile={dataFile || null} isBusyLoad={isBusyLoad} doSaveAdminState={null} adminState={null} />

	const Nav = (): JSX.Element => {
		const navLinkBaseClass = !dataFile ? 'nav-link disabled' : 'nav-link'

		return (
			<nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
				<div className='container-fluid'>
					<a className='navbar-brand' href='/'>
						<img src={LogoBase64} width='30' height='30' className='d-inline-block align-top me-3' alt='logo' />
						Brain Cloud
					</a>
					<button
						type='button'
						className='navbar-toggler'
						data-bs-toggle='collapse'
						data-bs-target='#navbarNav'
						aria-controls='navbarNav'
						aria-expanded='false'
						aria-label='Toggle navigation'>
						<span className='navbar-toggler-icon' />
					</button>
					<div className='collapse navbar-collapse' id='navbarNav'>
						<ul className='navbar-nav me-auto mb-2 mb-lg-0'>
							<li className='nav-item'>
								<NavLink to='/' className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
									Home
								</NavLink>
							</li>
							<li className='nav-item'>
								<NavLink to='/bedtime' className={({ isActive }) => (isActive ? `${navLinkBaseClass} active` : navLinkBaseClass)}>
									Bedtime
								</NavLink>
							</li>
							<li className='nav-item'>
								<NavLink to='/explore' className={({ isActive }) => (isActive ? `${navLinkBaseClass} active` : navLinkBaseClass)}>
									Explore
								</NavLink>
							</li>
							<li className='nav-item'>
								<NavLink to='/journal' className={({ isActive }) => (isActive ? `${navLinkBaseClass} active` : navLinkBaseClass)}>
									Journal
								</NavLink>
							</li>
							<li className='nav-item'>
								<NavLink to='/tags' className={({ isActive }) => (isActive ? `${navLinkBaseClass} active` : navLinkBaseClass)}>
									Tags
								</NavLink>
							</li>
							<li className='nav-item'>
								<NavLink to='/search' className={({ isActive }) => (isActive ? `${navLinkBaseClass} active` : navLinkBaseClass)}>
									Search
								</NavLink>
							</li>
							<li className='nav-item d-none d-lg-block'>
								<NavLink to='/import' className={({ isActive }) => (isActive ? `${navLinkBaseClass} active` : navLinkBaseClass)}>
									Import
								</NavLink>
							</li>
							<li className='nav-item d-none d-lg-block'>
								<NavLink to='/admin' className={({ isActive }) => (isActive ? `${navLinkBaseClass} active` : navLinkBaseClass)}>
									Admin
								</NavLink>
							</li>
						</ul>
					</div>
				</div>
			</nav>
		)
	}
	//#endregion

	return (
		<BrowserRouter>
			{Nav()}
			{renderLogin()}
			<Routes>
				<Route path='/' element={Home()} />
				<Route path='/bedtime' element={Bedtime()} />
				<Route path='/explore' element={Explore()} />
				<Route path='/journal' element={Journal()} />
				<Route path='/tags' element={Tags()} />
				<Route path='/search' element={Search()} />
				<Route path='/import' element={Import()} />
				<Route path='/admin' element={Admin()} />
			</Routes>
		</BrowserRouter>
	)

}
