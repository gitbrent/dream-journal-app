/*\
|*|  :: Brain Cloud Dream Journal ::
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

import * as React from 'react'
import { AuthState, IAuthState, IDriveFile } from './app'
import LogoBase64 from '../img/logo_base64'

function getReadableFileSizeString(fileSizeInBytes: number) {
	var i = -1
	var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB']
	do {
		fileSizeInBytes = fileSizeInBytes / 1024
		i++
	} while (fileSizeInBytes > 1024)

	return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i]
}

class TabHome extends React.Component<
	{
		authState: IAuthState
		dataFile: IDriveFile
		doAuthSignIn: Function
		doAuthSignOut: Function
	},
	{
		errorMessage: string
		fileBeingRenamed: IDriveFile
		newFileName: string
		isRenaming: boolean
	}
> {
	constructor(
		props: Readonly<{
			authState: IAuthState
			dataFile: IDriveFile
			doAuthSignIn: Function
			doAuthSignOut: Function
			doCreateJournal: Function
			doFileListRefresh: Function
			doRenameFile: Function
			doSelectFileById: Function
		}>
	) {
		super(props)

		this.state = {
			errorMessage: '',
			fileBeingRenamed: null,
			newFileName: '',
			isRenaming: false,
		}
	}

	/**
	 * Detect prop (auth) changes, then re-render file list
	 */
	componentDidUpdate(prevProps) {
		if (this.props.authState.status !== prevProps.authState.status) {
			// TODO: (?): this.handleDriveFileList(null)
		}
	}

	handleAuthSignIn = e => {
		this.props.doAuthSignIn()
	}
	handleAuthSignOut = e => {
		this.props.doAuthSignOut()
	}

	/**
	 * @see: https://developers.google.com/drive/api/v3/appdata
	 * @see: https://developers.google.com/drive/api/v3/search-parameters#file_fields
	 */
	render() {
		let cardAuthUser: JSX.Element
		if (this.props.authState.status == AuthState.Authenticated) {
			cardAuthUser = (
				<div>
					<p className='card-text mb-4'>
						<label className='text-muted text-uppercase d-block'>User Name:</label>
						{this.props.authState.userName}
					</p>
					<div className='row'>
						<div className='col-12 col-lg-6 mb-3 mb-lg-0'>
							<button
								className='btn btn-outline-primary w-100 mb-2 mb-md-0'
								onClick={this.handleAuthSignIn}>
								Renew
							</button>
						</div>
						<div className='col-12 col-lg-6 text-right'>
							<button className='btn btn-outline-secondary w-100' onClick={this.handleAuthSignOut}>
								Sign Out
							</button>
						</div>
					</div>
				</div>
			)
		} else if (this.props.authState.status == AuthState.Expired) {
			cardAuthUser = (
				<div>
					<p className='card-text mb-4'>Your session has expired. Please re-authenticate to continue.</p>
					<button className='btn btn-primary' onClick={this.handleAuthSignIn}>
						Sign In
					</button>
				</div>
			)
		} else {
			cardAuthUser = (
				<div>
					<p className='card-text mb-4'>Please sign-in to allow access to Google Drive space.</p>
					<button className='btn btn-primary' onClick={this.handleAuthSignIn}>
						Sign In/Authorize
					</button>
				</div>
			)
		}

		let cardDataFile: JSX.Element =
			this.props.dataFile && (this.props.dataFile._isSaving || this.props.dataFile._isLoading) ? (
				<div className='text-center'>
					<div className='spinner-border spinner-border-lg text-primary mb-4' role='status'>
						<span className='sr-only' />
					</div>
					<div>Loading/Saving...</div>
				</div>
			) : this.props.dataFile ? (
				<div className='row'>
					<div className='col-12 col-lg-6 mb-3 mb-lg-0'>
						<label className='text-muted text-uppercase d-block'>File Name</label>
						{this.props.dataFile.name}
					</div>
					<div className='col-6 col-lg-3'>
						<label className='text-muted text-uppercase d-block'>Entries</label>
						{this.props.dataFile.entries ? this.props.dataFile.entries.length : '?'}
					</div>
					<div className='col-6 col-lg-3'>
						<label className='text-muted text-uppercase d-block'>File Size</label>
						{getReadableFileSizeString(Number(this.props.dataFile.size))}
					</div>
				</div>
			) : (
				<div className='text-muted'>(none)</div>
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
						<div className='col-12 col-md-6 d-flex mb-5 mb-md-0'>
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
								<div className='card-body bg-light text-dark'>{cardAuthUser}</div>
							</div>
						</div>
						<div className='col-12 col-md-6 d-flex'>
							<div className='card flex-fill'>
								<div className='card-header bg-primary'>
									<h5 className='card-title text-white mb-0'>Dream Journal</h5>
								</div>
								<div className='card-body bg-light text-dark'>{cardDataFile}</div>
							</div>
						</div>
					</div>

					<div className='card'>
						<div className='card-header bg-info'>
							<h5 className='card-title text-white mb-0'>Google Drive Cloud Integration</h5>
						</div>
						<div className='card-body bg-light text-dark'>
							<p className='card-text'>
								This application uses your Google Drive to store dream journals so they are safe,
								secure, and accessible on any of your devices.
							</p>
							<p className='card-text'>
								Click "Sign In", select the Google account to use with this app, view the request
								permissions page asking to create and modify{' '}
								<strong>
									<u>only its own files</u>
								</strong>{' '}
								on your Google Drive. (This app cannot access your other Google Drive files)
							</p>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default TabHome
