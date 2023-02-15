/**
 * @see https://developers.google.com/drive/api/guides/about-sdk
 * @see https://developers.google.com/drive/api/guides/search-files#node.js
 * @see https://developers.google.com/drive/api/guides/fields-parameter
 * @see https://developers.google.com/drive/api/v3/reference/files/get
 */
import React, { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { IDriveDataFile, IJournalEntry, IDriveConfFile } from './app.types'
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
import { googlegsi } from './googlegsi'

export default function AppMain() {
	//const [appErrMsg, setAppErrMsg] = useState('')
	const [dataFile, setDataFile] = useState<IDriveDataFile>()
	const [confFile, setConfFile] = useState<IDriveConfFile>()
	const [isBusyLoad, setIsBusyLoad] = useState(false)
	const [editEntry, setEditEntry] = useState<IJournalEntry>()
	let googleapi: googlegsi

	/** load gapi script on startup */
	useEffect(() => {
		googleapi = new googlegsi(gapiCallback)
	}, [])

	function gapiCallback(): void {
		const brent = googleapi?.dataFile
		setDataFile(brent)
	}

	//#region tabs
	const Home = () => (<TabHome dataFile={dataFile} isBusyLoad={isBusyLoad} authState={undefined} />)
	const Bedtime = () => (<TabBedtime confFile={confFile} dataFile={dataFile} isBusyLoad={isBusyLoad} />)
	const Explore = () => (<TabExplore confFile={confFile} dataFile={dataFile} isBusyLoad={isBusyLoad} />)
	const Journal = () => (<TabJournal dataFile={dataFile} doSaveViewState={null} viewState={null} isBusyLoad={isBusyLoad} />)
	const Search = () => (<TabSearch dataFile={dataFile} isBusyLoad={isBusyLoad} />)
	const Tags = () => (<TabTags dataFile={dataFile || null} isBusyLoad={isBusyLoad} />)
	const Import = () => <TabImport dataFile={dataFile} doSaveImportState={null} importState={null} />
	const Admin = () => <TabAdmin dataFile={dataFile} isBusyLoad={isBusyLoad} doSaveAdminState={null} adminState={null} />
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
