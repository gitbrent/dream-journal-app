/**
 *  :: Brain Cloud Dream Journal ::
 *
 *  Dream Journal App - Record and Search Daily Dream Entries
 *  https://github.com/gitbrent/dream-journal-app
 *
 *  This library is released under the MIT Public License (MIT)
 *
 *  Dream Journal App (C) 2019-present Brent Ely (https://github.com/gitbrent)
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, NavLink } from 'react-router-dom'
import { IAuthState, IDriveFile, IJournalEntry, AuthState, APP_VER } from './app.types'
import * as GDrive from './google-oauth'
import TabHome from '../app/app-home'
import TabView, { IAppViewState } from '../app/app-view'
import TabImport from '../app/app-import'
import TabSearch, { IAppSearchState } from '../app/app-search'
import TabAdmin, { IAppAdminState } from '../app/app-admin'
import TabTags, { IAppTagsState } from '../app/app-tags'
import LogoBase64 from '../img/logo_base64'
import '../css/bootstrap.cyborg.v5.0.0-beta1.css'
import '../css/react-tags.css'
import '../css/style.css'

// App Logic
interface IAppProps {}
interface IAppState {
	appErrMsg: string
	auth: IAuthState
	childImportState: object
	childSearchState: IAppSearchState
	childTagsState: IAppTagsState
	childViewState: IAppViewState
	childAdminState: IAppAdminState
	dataFile: IDriveFile
	isBusyLoad: boolean
	editEntry: IJournalEntry
}
class App extends React.Component<IAppProps, IAppState> {
	constructor(props: Readonly<IAppProps>) {
		super(props)

		this.state = {
			appErrMsg: '',
			auth: {
				status: AuthState.Unauthenticated,
				userName: '',
				userPhoto: '',
			},
			childImportState: null,
			childSearchState: null,
			childTagsState: null,
			childViewState: null,
			childAdminState: null,
			dataFile: null,
			isBusyLoad: false,
			editEntry: null,
		}

		this.initSetupOauth()

		console.log(APP_VER)
	}

	componentDidCatch = (error, errorInfo) => {
		this.setState({ appErrMsg: error.toString() })
		console.error(error)
		console.error(errorInfo)
	}

	initSetupOauth = () => {
		// Set 2 necessary callbacks to capture auth/file state changes
		GDrive.authStateCallback((result: IAuthState) => this.setState({ auth: result }))
		GDrive.busyLoadCallback((result: boolean) => this.setState({ isBusyLoad: result }))
		GDrive.dataFileCallback((result: IDriveFile) => this.setState({ dataFile: result }))

		// Make initial call at startup, if we're logged in, the datafile will be loaded and auth state set, otherwise, wait for user to click "Login"
		GDrive.doAuthUpdate()
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
	/**
	 * Retain state between tab changes
	 */
	doSaveAdminState = (newState: IAppAdminState) => {
		this.setState({
			childAdminState: newState,
		})
	}

	// App Pages
	Home = () => <TabHome dataFile={this.state.dataFile || null} isBusyLoad={this.state.isBusyLoad} authState={this.state.auth} />
	View = () => (
		<TabView dataFile={this.state.dataFile || null} doSaveViewState={this.doSaveViewState} viewState={this.state.childViewState} isBusyLoad={this.state.isBusyLoad} />
	)
	Search = () => (
		<TabSearch
			dataFile={this.state.dataFile || null}
			isBusyLoad={this.state.isBusyLoad}
			doSaveSearchState={this.doSaveSearchState}
			searchState={this.state.childSearchState}
		/>
	)
	Tags = () => (
		<TabTags dataFile={this.state.dataFile || null} isBusyLoad={this.state.isBusyLoad} doSaveTagsState={this.doSaveTagsState} tagsState={this.state.childTagsState} />
	)
	Import = () => <TabImport dataFile={this.state.dataFile || null} doSaveImportState={this.doSaveImportState} importState={this.state.childImportState} />
	Admin = () => (
		<TabAdmin dataFile={this.state.dataFile || null} isBusyLoad={this.state.isBusyLoad} doSaveAdminState={this.doSaveAdminState} adminState={this.state.childAdminState} />
	)

	render() {
		return (
			<Router>
				<nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
					<div className='container-fluid'>
						<a className='navbar-brand' href='/'>
							<img src={LogoBase64} width='30' height='30' className='d-inline-block align-top me-3' alt='' />
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
							<ul className='navbar-nav me-auto mb-2 mb-lg-0'>
								<li className='nav-item'>
									<NavLink to='/' exact={true} activeClassName='active' className='nav-link'>
										Home
									</NavLink>
								</li>
								<li className='nav-item'>
									<NavLink to='/view' activeClassName='active' className={!this.state.dataFile ? 'nav-link disabled' : 'nav-link'}>
										View Journal
									</NavLink>
								</li>
								<li className='nav-item'>
									<NavLink to='/search' activeClassName='active' className={!this.state.dataFile ? 'nav-link disabled' : 'nav-link'}>
										Search Journal
									</NavLink>
								</li>
								<li className='nav-item'>
									<NavLink to='/tags' activeClassName='active' className={!this.state.dataFile ? 'nav-link disabled' : 'nav-link'}>
										Dream Tags
									</NavLink>
								</li>
								<li className='nav-item'>
									<NavLink to='/import' activeClassName='active' className={!this.state.dataFile ? 'nav-link disabled' : 'nav-link'}>
										Import Dreams
									</NavLink>
								</li>
								<li className='nav-item'>
									<NavLink to='/admin' activeClassName='active' className={!this.state.dataFile ? 'nav-link disabled' : 'nav-link'}>
										Data Maint
									</NavLink>
								</li>
							</ul>
						</div>
					</div>
				</nav>

				<Route path='/' exact render={this.Home} />
				<Route path='/view' render={this.View} />
				<Route path='/search' render={this.Search} />
				<Route path='/tags' render={this.Tags} />
				<Route path='/import' render={this.Import} />
				<Route path='/admin' render={this.Admin} />
			</Router>
		)
	}
}

// App Container
const AppMain: React.SFC<{ compiler: string; framework: string }> = (_props) => <App />

ReactDOM.render(<AppMain compiler='TypeScript' framework='React' />, document.getElementById('root'))
