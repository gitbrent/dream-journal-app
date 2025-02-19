/**
 * @see https://developers.google.com/drive/api/guides/about-sdk
 * @see https://developers.google.com/drive/api/guides/search-files#node.js
 * @see https://developers.google.com/drive/api/guides/fields-parameter
 * @see https://developers.google.com/drive/api/v3/reference/files/get
 */
import { useContext, useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { IJournalEntry } from './app.types'
import { AuthContext } from '../api-google/AuthContext'
import { DataContext } from '../api-google/DataContext'
import TabHome from '../app/app-home'
import TabBedtime from '../app/app-bedtime'
import TabExplore from '../app/app-explore'
import TabJournal from './app-journal'
import TabTags from '../app/app-tags'
//import TabTags2 from '../app/app-tags2'
import TabSearch from '../app/app-search'
import TabAdmin from '../app/app-admin'
import TabImport from '../app/app-import'
import ModalEntry from './modal-entry'
import LogoBase64 from '../img/logo_base64'

// TODO: create a modal here, then pass it everywhere (https://stackoverflow.com/a/65522446) also (https://stackoverflow.com/a/62503461)
// ....: then we can stop passing dataSvc around!

export default function AppMain() {
	const { isSignedIn, signIn } = useContext(AuthContext)
	const { refreshData } = useContext(DataContext)
	//
	const [showModal, setShowModal] = useState(false)
	// WIP: VVVV
	const [currEntry, setCurrEntry] = useState<IJournalEntry | undefined>()
	const [currDreamIdx, setCurrDreamIdx] = useState(0)
	// FIXME: ^^^ SATURDAY: WHAT? NO, the Modal itself has these vvv just pass the methods!

	useEffect(() => {
		if (isSignedIn) refreshData()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSignedIn])
	/*
	useEffect(() => {
		const appInst = appdataSvc ?? new appdata(() => { setDataSvcLoadTime(new Date().toISOString()) });
		setAppdataSvc(appInst)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])*/
	/*
	useEffect(() => {
		if (appdataSvc && dataSvcLoadTime) {
			if (IS_LOCALHOST) console.log(`[MAIN] appdataSvc.authState = ${appdataSvc.authState.status}`)
			setAuthState(appdataSvc.authState)
			setConfFile(appdataSvc.confFile)
			setDataFile(appdataSvc.dataFile)
			setIsBusyLoad(false)
		}
	}, [appdataSvc, dataSvcLoadTime])
	*/
	/*
	const Modal = () => {
		return appdataSvc
			? <ModalEntry appdataSvc={appdataSvc} currEntry={currEntry} currDreamIdx={currDreamIdx} showModal={showModal} setShowModal={(show: boolean) => setShowModal(show)} />
			: <AlertGdriveStatus isBusyLoad={true} />
	}*/
	const Search = () => (<TabSearch setShowModal={setShowModal} setCurrEntry={setCurrEntry} setCurrDreamIdx={setCurrDreamIdx} />)
	const Tags = () => (<TabTags setShowModal={setShowModal} setCurrEntry={setCurrEntry} />)
	const Nav = (): JSX.Element => {
		const navLinkBaseClass = !isSignedIn ? 'nav-link disabled' : 'nav-link'

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

	// NEW: WIP:
	function renderLogin(): JSX.Element {
		return (
			<section id="contHome" className="m-5">
				<div id="loginCont" className="text-center bg-black p-5 rounded">
					<img src="/google-drive.png" alt="GoogleDriveLogo" className="w-25" />
					<div className="my-3">
						<div className="display-6">Google Drive</div>
						<div className="display-6">Media Viewer</div>
					</div>
					<button type="button" className='btn btn-lg bg-success w-100 mt-4' onClick={signIn}>Sign In with Google</button>
				</div>

				<div className='card'>
					<div className='card-header bg-primary'>
						<h5 className='card-title text-white'>Google Drive Cloud Integration</h5>
					</div>
					<div className='card-body p-4'>
						<p className='card-text'>
							This application uses your Google Drive to store dream journals so they are safe, secure, and accessible on any of your devices.
						</p>
						<p className='card-text'>
							Click &quot;Sign In&quot;, select the Google account to use with this app, view the request permissions page asking to create and modify{' '}
							<strong>
								<u>only its own files</u>
							</strong>{' '}
							on your Google Drive. (This app cannot access your other Google Drive files)
						</p>
						<button className='btn btn-outline-primary btn-lg mt-3 w-100' onClick={signIn}>Sign In</button>
					</div>
				</div>

			</section>
		)
	}

	return (
		!isSignedIn ?
			renderLogin()
			:
			<BrowserRouter>
				{Nav()}
				{<ModalEntry currEntry={currEntry} currDreamIdx={currDreamIdx} showModal={showModal} setShowModal={(show: boolean) => setShowModal(show)} />}
				<Routes>
					<Route path='/' element={<TabHome setShowModal={setShowModal} setCurrEntry={setCurrEntry} />} />
					<Route path='/bedtime' element={<TabBedtime setShowModal={setShowModal} setCurrEntry={setCurrEntry} setCurrDreamIdx={setCurrDreamIdx} />} />
					<Route path='/explore' element={<TabExplore setShowModal={setShowModal} setCurrEntry={setCurrEntry} />} />
					<Route path='/journal' element={<TabJournal setShowModal={setShowModal} setCurrEntry={setCurrEntry} />} />
					<Route path='/tags' element={Tags()} />
					<Route path='/search' element={Search()} />
					<Route path='/import' element={<TabImport />} />
					<Route path='/admin' element={<TabAdmin setShowModal={setShowModal} setCurrEntry={setCurrEntry} />} />
				</Routes>
			</BrowserRouter>
	)
}
