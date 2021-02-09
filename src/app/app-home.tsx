/*
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
import { APP_VER, AuthState, IAuthState, IDriveFile } from './app.types'
import { Plus } from 'react-bootstrap-icons'
import LogoBase64 from '../img/logo_base64'

function getReadableFileSizeString(fileSizeInBytes: number) {
	let idx = -1
	let byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB']
	do {
		fileSizeInBytes = fileSizeInBytes / 1024
		idx++
	} while (fileSizeInBytes > 1024)

	return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[idx]
}

export interface IHomeProps {
	authState: IAuthState
	dataFile: IDriveFile
	doAuthSignIn: Function
	doAuthSignOut: Function
	onShowModal: Function
}
interface IHomeState {
	errorMessage: string
	fileBeingRenamed: IDriveFile
	newFileName: string
	isRenaming: boolean
}

export default class TabHome extends React.Component<IHomeProps, IHomeState> {
	constructor(props: Readonly<IHomeProps>) {
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
	componentDidUpdate(prevProps: any) {
		if (this.props.authState.status !== prevProps.authState.status) {
			// TODO: (?): this.handleDriveFileList(null)
		}
	}

	handleAuthSignIn = (_event: React.MouseEvent<HTMLButtonElement>) => {
		this.props.doAuthSignIn()
	}
	handleAuthSignOut = (_event: React.MouseEvent<HTMLButtonElement>) => {
		this.props.doAuthSignOut()
	}

	handleNewModal = (_event: React.MouseEvent<HTMLInputElement>) => {
		this.props.onShowModal({
			show: true,
		})
	}

	/**
	 * @see: https://developers.google.com/drive/api/v3/appdata
	 * @see: https://developers.google.com/drive/api/v3/search-parameters#file_fields
	 */
	render() {
		let cardAuthUser: JSX.Element
		if (this.props.authState.status === AuthState.Authenticated) {
			cardAuthUser = (
				<div>
					<div className='row mb-4'>
						<div className='col'>
							<label className='text-muted text-uppercase d-block'>User Name</label>
							{this.props.authState.userName}
						</div>
						<div className='col-auto text-right'>
							<label className='text-muted text-uppercase d-block'>App Version</label>
							{APP_VER}
						</div>
					</div>
					<div className='row mb-0'>
						<div className='col'>
							<button className='btn btn-outline-primary w-100' onClick={this.handleAuthSignIn}>
								Renew
							</button>
						</div>
						<div className='col'>
							<button className='btn btn-outline-secondary w-100' onClick={this.handleAuthSignOut}>
								Sign Out
							</button>
						</div>
					</div>
				</div>
			)
		} else if (this.props.authState.status === AuthState.Expired) {
			cardAuthUser = (
				<div>
					<p className='card-text mb-4'>Your session has expired. Please re-authenticate to continue.</p>
					<button className='btn btn-warning' onClick={this.handleAuthSignIn}>
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
				<div>
					<div className='row mb-3'>
						<div className='col'>
							<label className='text-muted text-uppercase d-block'>File Name</label>
							{this.props.dataFile.name}
						</div>
						<div className='col-auto text-right'>
							<label className='text-muted text-uppercase d-block'>Entries</label>
							{this.props.dataFile.entries ? this.props.dataFile.entries.length : '?'}
						</div>
					</div>
					<div className='row'>
						<div className='col'>
							<label className='text-muted text-uppercase d-block'>Last Saved</label>
							{this.props.dataFile ? new Date(this.props.dataFile.modifiedTime).toLocaleString() : '-'}
						</div>
						<div className='col-auto text-right'>
							<label className='text-muted text-uppercase d-block'>File Size</label>
							{getReadableFileSizeString(Number(this.props.dataFile.size))}
						</div>
					</div>
				</div>
			) : (
				<div className='text-muted'>(none)</div>
			)

		return (
			<div className='container mt-5'>
				<div className='jumbotron'>
					<div className='row align-items-center no-gutters'>
						<div className='col'>
							<h1 className='display-4 text-primary mb-0 d-none d-md-none d-xl-block'>
								<img src={LogoBase64} width='150' height='150' className='mr-4' alt='Logo' />
								Brain Cloud - Dream Journal
							</h1>
							<h3 className='text-primary mb-0 d-none d-md-none d-lg-block d-xl-none'>
								<img src={LogoBase64} width='75' height='75' className='mr-4' alt='Logo' />
								Brain Cloud - Dream Journal
							</h3>
							<h1 className='text-primary mb-0 d-none d-md-block d-lg-none'>Brain Cloud - Dream Journal</h1>
							<h1 className='text-primary mb-0 d-block d-md-none'>Brain Cloud</h1>
						</div>
						<div className='col-auto'>
							<button className='btn btn-primary px-4 text-uppercase' type='button' disabled={!this.props.dataFile} onClick={this.handleNewModal}>
								Create
								<br />
								Entry
								<Plus size='64' className='d-none  d-md-none d-lg-block' />
								<Plus size='32' className='d-block d-lg-none' />
							</button>
						</div>
					</div>

					<p className='lead mt-3'>Record your daily dream journal entries into well-formatted JSON, enabling keyword searches, metrics and more.</p>
					<hr className='my-4' />

					<div className='row mb-5'>
						<div className='col-12 col-md d-flex mb-5 mb-md-0'>
							<div className='card flex-fill'>
								<div className={'card-header' + (this.props.authState.status === AuthState.Authenticated ? ' bg-success' : ' bg-warning')}>
									<h5 className='card-title text-white mb-0'>{this.props.authState.status || '???'}</h5>
								</div>
								<div className='card-body bg-light text-dark'>{cardAuthUser}</div>
							</div>
						</div>
						<div className='col-12 col-md d-flex'>
							<div className='card flex-fill'>
								<div className='card-header bg-info'>
									<h5 className='card-title text-white mb-0'>Dream Journal</h5>
								</div>
								<div className='card-body bg-light text-dark'>{cardDataFile}</div>
							</div>
						</div>
					</div>

					<div className='row mb-0'>
						<div className='col-12 col-md d-flex'>
							<div className='card'>
								<div className='card-header bg-secondary'>
									<h5 className='card-title text-white mb-0'>Google Drive Cloud Integration</h5>
								</div>
								<div className='card-body bg-light text-dark'>
									<p className='card-text'>
										This application uses your Google Drive to store dream journals so they are safe, secure, and accessible on any of your devices.
									</p>
									<p className='card-text'>
										Click "Sign In", select the Google account to use with this app, view the request permissions page asking to create and modify{' '}
										<strong>
											<u>only its own files</u>
										</strong>{' '}
										on your Google Drive. (This app cannot access your other Google Drive files)
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}
