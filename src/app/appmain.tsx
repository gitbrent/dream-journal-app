/**
 * @see https://developers.google.com/drive/api/guides/about-sdk
 * @see https://developers.google.com/drive/api/guides/search-files#node.js
 * @see https://developers.google.com/drive/api/guides/fields-parameter
 * @see https://developers.google.com/drive/api/v3/reference/files/get
 */
import React, { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { IDriveDataFile, IDriveConfFile, IAuthState, AuthState } from './app.types'
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
import { appdata } from './appdata'

// TODO: create a modal here, then pass it everywhere (https://stackoverflow.com/a/65522446) also (https://stackoverflow.com/a/62503461)
// ....: then we can stop passing dataSvc around!

export default function AppMain() {
	const DEF_AUTH_STATE: IAuthState = {
		status: AuthState.Unauthenticated,
		userName: '',
		userPhoto: '',
	}
	const DEF_CONF_FILE: IDriveConfFile = {
		id: '',
		dreamIdeas: [],
		lucidGoals: [],
		mildAffirs: [],
		tagTypeAW: [],
		tagTypeCO: [],
		tagTypeFO: [],
		tagTypeAC: [],
	}
	const DEF_DATA_FILE: IDriveDataFile = {
		id: '',
		entries: [],
		modifiedTime: '',
		name: '',
		size: '',
	}
	const isBusyLoad = false
	// TODO: const [isBusyLoad, setIsBusyLoad] = useState(false)
	//??? const [editEntry, setEditEntry] = useState<IJournalEntry>()
	const [isDataSvcLoaded, setIsDataSvcLoaded] = useState(false)
	const [appdataSvc, setAppdataSvc] = useState<appdata>()
	const [authState, setAuthState] = useState<IAuthState>(DEF_AUTH_STATE)
	const [confFile, setConfFile] = useState<IDriveConfFile>(DEF_CONF_FILE)
	const [dataFile, setDataFile] = useState<IDriveDataFile>(DEF_DATA_FILE)

	/** load gapi script on startup */
	useEffect(() => {
		if (!appdataSvc) setAppdataSvc(new appdata(() => setIsDataSvcLoaded(true)))
	}, [])

	useEffect(() => {
		console.log(`${appdataSvc} && ${isDataSvcLoaded}`) // FIXME:

		if (appdataSvc && isDataSvcLoaded) {
			console.log(appdataSvc.authState)

			setAuthState(appdataSvc.authState)
			setConfFile(appdataSvc.confFile)
			setDataFile(appdataSvc.dataFile)
		}
	}, [appdataSvc, isDataSvcLoaded])

	useEffect(() => {
		console.log('FUCK')
		console.log(authState)
	}, [authState])

	const Home = () => (<TabHome dataFile={dataFile} isBusyLoad={isBusyLoad} authState={authState} appdataSvc={appdataSvc} />)
	const Bedtime = () => (<TabBedtime confFile={confFile} dataFile={dataFile} isBusyLoad={isBusyLoad} appdataSvc={appdataSvc} />)
	const Explore = () => (<TabExplore confFile={confFile} dataFile={dataFile} isBusyLoad={isBusyLoad} appdataSvc={appdataSvc} />)
	const Journal = () => (<TabJournal dataFile={dataFile} isBusyLoad={isBusyLoad} appdataSvc={appdataSvc} />)
	const Search = () => (<TabSearch dataFile={dataFile} isBusyLoad={isBusyLoad} appdataSvc={appdataSvc} />)
	const Tags = () => (<TabTags dataFile={dataFile || null} isBusyLoad={isBusyLoad} appdataSvc={appdataSvc} />)
	const Import = () => <TabImport dataFile={dataFile} appdataSvc={appdataSvc} />
	const Admin = () => <TabAdmin dataFile={dataFile} isBusyLoad={isBusyLoad} appdataSvc={appdataSvc} />
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

	return (
		<BrowserRouter>
			{Nav()}
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
