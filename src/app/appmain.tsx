/**
 * @see https://developers.google.com/drive/api/guides/about-sdk
 * @see https://developers.google.com/drive/api/guides/search-files#node.js
 * @see https://developers.google.com/drive/api/guides/fields-parameter
 * @see https://developers.google.com/drive/api/v3/reference/files/get
 */
import React, { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { IDriveDataFile, IJournalEntry, IDriveConfFile, IGapiFile, IS_LOCALHOST } from './app.types'
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
	const [gapiDataFile, setGapiDataFile] = useState<IGapiFile>(null)
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
		const currentUser = googleAuth?.currentUser.get()
		const isAuthorized = currentUser?.hasGrantedScopes(GAPI_SCOPES) || false
		const userName = currentUser?.getBasicProfile().getName() || ''
		setSignedInUser(isAuthorized ? userName : '(?)')
	}

	const signInFunction = () => {
		googleAuth?.signIn().then(() => {
			updateSigninStatus()
		})
	}

	const signOutFunction = () => {
		googleAuth?.signOut().then(() => {
			updateSigninStatus()
		})
	}

	const listFiles = () => {
		gapi.client.drive.files
			.list({ q: 'trashed=false and mimeType = \'application/json\'' })
			.then((response: { body: string }) => {
				const respBody = JSON.parse(response.body)
				const respFiles: IGapiFile[] = respBody.files
				if (IS_LOCALHOST) console.log('respFiles', respFiles)
				const dataFile = respFiles.filter(item => item.name === 'dream-journal.json')[0]
				if (IS_LOCALHOST) console.log('dataFile', dataFile)
				setGapiDataFile(dataFile)
			})
	}

	/**
	 * `window.gapi.client.drive.files.get` can onyl get metadata, contents requires below
	 * @see https://developers.google.com/drive/api/v2/reference/files/get#javascript
	 * @returns
	 */
	const downloadDataFile = async () => {
		try {
			const accessToken = gapi.auth.getToken().access_token

			fetch(`https://www.googleapis.com/drive/v3/files/${gapiDataFile.id}?alt=media`, {
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
							console.log(entries ? entries : [])
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


			const xhr = new XMLHttpRequest()
			xhr.open('GET', `https://www.googleapis.com/drive/v3/files/${gapiDataFile.id}?alt=media`)
			xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken)
			xhr.onload = () => {
				console.log(xhr.responseText)
			}
			xhr.onerror = (err) => {
				console.error(err)
			}
			xhr.send()
		} catch (err) {
			// TODO(developer) - Handle error
			throw err
		}
	}

	//

	function renderLogin(): JSX.Element {
		return (<div className="App">
			<div className='bg-info text-white p-3 mb-3'>UserName: <strong>{signedInUser}</strong></div>
			{signedInUser ? (<div>
				<button type='button' className='btn btn-primary me-2' onClick={listFiles}>List Files</button>
				<button type='button' className='btn btn-info me-2' disabled={!gapiDataFile?.id} onClick={downloadDataFile}>Download File</button>
				<button type='button' className='btn btn-secondary' onClick={signOutFunction}>Sign Out</button>
			</div>) :
				<button type='button' className='btn btn-primary' onClick={signInFunction}>Sign In</button>
			}
		</div>)
	}

	//#region tabs
	const Home = () => (<TabHome dataFile={dataFile} isBusyLoad={isBusyLoad} authState={null} />)

	const Bedtime = () => (
		<TabBedtime confFile={confFile || null} dataFile={dataFile || null} isBusyLoad={isBusyLoad} />
	)
	const Explore = () => (
		<TabExplore confFile={confFile || null} dataFile={dataFile || null} isBusyLoad={isBusyLoad} />
	)
	const Journal = () => (
		<TabJournal dataFile={dataFile || null} doSaveViewState={null} viewState={null} isBusyLoad={isBusyLoad} />
	)
	const Search = () => (<TabSearch dataFile={dataFile || null} isBusyLoad={isBusyLoad} />)
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
