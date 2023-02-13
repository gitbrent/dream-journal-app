/**
 * @see https://developers.google.com/drive/api/guides/about-sdk
 * @see https://developers.google.com/drive/api/guides/search-files#node.js
 * @see https://developers.google.com/drive/api/guides/fields-parameter
 * @see https://developers.google.com/drive/api/v3/reference/files/get
 */
import React, { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { IAuthState, IDriveDataFile, IJournalEntry, IDriveConfFile, IGapiFile } from './app.types'
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
// integrate <script>-loaded googeapi library with typescript
/// <reference types="../../node_modules/@types/gapi/index.d.ts" />
/// <reference types="../../node_modules/@types/gapi.auth2/index.d.ts" />
/// <reference types="../../node_modules/@types/gapi.drive/index.d.ts" />
declare global {
	interface Window {
		gapi: {
			client: () => void,
			load: () => void,
		};
	}
}
// integrate <script> ^^^

export default function AppMain() {
	const GAPI_CLIENT_ID = process.env.REACT_APP_GOOGLE_DRIVE_CLIENT_ID
	const GAPI_API_KEY = process.env.REACT_APP_GOOGLE_DRIVE_API_KEY
	const GAPI_DISC_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
	const GAPI_SCOPES = 'https://www.googleapis.com/auth/drive.file'
	//
	//const [gapiClient, setGapiClient] = useState<gapi.client.init>(undefined)
	const [googleAuth, setGoogleAuth] = useState<gapi.auth2.GoogleAuth>(null)
	//
	const [signedInUser, setSignedInUser] = useState('')
	const [gapiFiles, setGapiFiles] = useState<IGapiFile[]>([])
	//
	const [appErrMsg, setAppErrMsg] = useState('')
	const [dataFile, setDataFile] = useState<IDriveDataFile>(null)
	const [confFile, setConfFile] = useState<IDriveConfFile>(null)
	const [isBusyLoad, setIsBusyLoad] = useState(false)
	const [editEntry, setEditEntry] = useState<IJournalEntry>(null)

	/** load gapi script on startup */
	useEffect(() => {
		const script = document.createElement('script')
		script.src = 'https://apis.google.com/js/api.js'
		script.onload = () => window.gapi.load('client:auth2', initClient)
		document.body.appendChild(script)
	}, [])

	useEffect(() => {
		if (googleAuth) updateSigninStatus()
	}, [googleAuth])

	const initClient = () => {
		try {
			window.gapi.client.init({
				apiKey: GAPI_API_KEY,
				clientId: GAPI_CLIENT_ID,
				scope: GAPI_SCOPES,
				discoveryDocs: GAPI_DISC_DOCS
			}).then(() => {
				const auth2 = window.gapi.auth2.getAuthInstance()
				auth2.isSignedIn.listen(updateSigninStatus)
				setGoogleAuth(auth2)
			})
		} catch (e) {
			console.error(e)
		}
	}

	const updateSigninStatus = async () => {
		const currentUser = googleAuth.currentUser.get()
		const isAuthorized = currentUser.hasGrantedScopes(GAPI_SCOPES)
		const userName = currentUser.getBasicProfile().getName()
		setSignedInUser(currentUser && isAuthorized ? userName : '(?)')
	}

	const signInFunction = () => {
		googleAuth.signIn().then(() => {
			updateSigninStatus()
		})
	}

	const signOutFunction = () => {
		googleAuth.signOut().then(() => {
			updateSigninStatus()
		})
	}

	const listFiles = () => {
		window.gapi.client.drive.files
			.list({ q: 'trashed=false and mimeType = \'application/json\'' })
			.then((response: { body: string }) => {
				const res = JSON.parse(response.body)
				setGapiFiles(res.files)
				console.log(res.files)
			})
	}

	/*
	const downloadDataFile = async () => {
		const service = window.gapi.drive({ version: 'v3', googleAuth })

		try {
			const file = await service.files.get({ fileId: fileId })
			console.log(file.status)
			return file.status
		} catch (err) {
			// TODO(developer) - Handle error
			throw err
		}
	}
	*/

	//

	function renderLogin(): JSX.Element {
		return (<div className="App">
			<div>UserName: <strong>{signedInUser}</strong></div>
			{signedInUser ? (<div>
				<button type='button' className='btn btn-secondary' onClick={signOutFunction}>Sign Out</button>
				<button type='button' className='btn btn-secondary' onClick={listFiles}>List Files</button>
			</div>) :
				<button type='button' className='btn btn-primary' onClick={signInFunction}>Sign In</button>
			}
		</div>)

		return (<section onClick={signInFunction} className="text-center p-4 bg-black">
			<div className='row align-items-center justify-content-center'>
				<div className='col-auto'>
					<img height="100" width="100" src="/google-drive-icon.svg" alt="google drive logo" />
				</div>
				<div className='col-auto'>
					<h5>Google Drive</h5>
					{signedInUser
						? <div>{signedInUser}</div>
						: <p>(click to login)</p>
					}
				</div>
			</div>
			{isBusyLoad && <div className='bg-info p-4'>BUSY</div>}
			<div>gapiFiles = {gapiFiles?.length}</div>
		</section>)
	}

	//#region tabs
	const Home = () => (<TabHome dataFile={dataFile || null} isBusyLoad={isBusyLoad} authState={null} />)

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
