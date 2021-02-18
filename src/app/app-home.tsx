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

import React, { useState, useEffect } from 'react'
import { APP_VER, AuthState, IAuthState, IDriveFile } from './app.types'
import { Plus } from 'react-bootstrap-icons'
import LogoBase64 from '../img/logo_base64'
import ModalEntry from './modal-entry'
import * as GDrive from './google-oauth'

interface Props {
	authState: IAuthState
	dataFile: IDriveFile
}

export default function TabHome(props: Props) {
	const [showModal, setShowModal] = useState(false)
	const [isBusyLoad, setIsBusyLoad] = useState(false)
	//const [errorMessage, setErrorMessage] = useState('')
	//const [isRenaming, setIsRenaming] = useState(false)
	//const [fileBeingRenamed, setFileBeingRenamed] = useState<IDriveFile>(null)
	//const [newFileName, setNewFileName] = useState('')

	useEffect(() => {
		/** @see https://stackoverflow.com/a/60907638 */
		let isMounted = true // note this flag denote mount status
		GDrive.busyLoadCallback((res: boolean) => isMounted && setIsBusyLoad(res))
		return () => (isMounted = false) // use effect cleanup to set flag false, if unmounted
	})

	function getReadableFileSizeString(fileSizeInBytes: number) {
		let idx = -1
		let byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB']
		do {
			fileSizeInBytes = fileSizeInBytes / 1024
			idx++
		} while (fileSizeInBytes > 1024)

		return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[idx]
	}

	function renderCardAuthUser(): JSX.Element {
		let cardAuthUser: JSX.Element

		if (props.authState && props.authState.status === AuthState.Authenticated) {
			cardAuthUser = (
				<div>
					<div className='row mb-4'>
						<div className='col'>
							<label>User Name</label>
							{props.authState.userName}
						</div>
						<div className='col-auto text-right'>
							<label>App Version</label>
							{APP_VER}
						</div>
					</div>
					<div className='row mb-0'>
						<div className='col'>
							<button className='btn btn-outline-primary w-100' onClick={() => GDrive.doAuthSignIn()}>
								Renew
							</button>
						</div>
						<div className='col'>
							<button className='btn btn-outline-secondary w-100' onClick={() => GDrive.doAuthSignOut()}>
								Sign Out
							</button>
						</div>
					</div>
				</div>
			)
		} else if (props.authState && props.authState.status === AuthState.Expired) {
			cardAuthUser = (
				<div>
					<p className='card-text mb-4'>Your session has expired. Please re-authenticate to continue.</p>
					<button className='btn btn-warning' onClick={() => GDrive.doAuthSignIn()}>
						Sign In
					</button>
				</div>
			)
		} else {
			cardAuthUser = (
				<div>
					<p className='card-text mb-4'>Please sign-in to allow access to Google Drive space.</p>
					<button className='btn btn-primary' onClick={() => GDrive.doAuthSignIn()}>
						Sign In/Authorize
					</button>
				</div>
			)
		}

		return cardAuthUser
	}

	function renderCardDataFile(): JSX.Element {
		return props.dataFile && (props.dataFile._isSaving || props.dataFile._isLoading || isBusyLoad) ? (
			<div className='text-center'>
				<div className='spinner-border spinner-border-lg text-primary mb-4' role='status'>
					<span className='visually-hidden' />
				</div>
				<div>Loading/Saving...</div>
			</div>
		) : props.dataFile ? (
			<div>
				<div className='row mb-3'>
					<div className='col'>
						<label>File Name</label>
						{props.dataFile.name}
					</div>
					<div className='col-auto text-right'>
						<label>Entries</label>
						{props.dataFile.entries ? props.dataFile.entries.length : '?'}
					</div>
				</div>
				<div className='row'>
					<div className='col'>
						<label>Last Saved</label>
						{props.dataFile ? new Date(props.dataFile.modifiedTime).toLocaleString() : '-'}
					</div>
					<div className='col-auto text-right'>
						<label>File Size</label>
						{getReadableFileSizeString(Number(props.dataFile.size))}
					</div>
				</div>
			</div>
		) : (
			<div className='text-muted'>(none)</div>
		)
	}

	return (
		<div className='container-xl mt-5'>
			<ModalEntry currEntry={null} showModal={showModal} setShowModal={(show: boolean) => setShowModal(show)} />

			<div className='jumbotron'>
				<div className='row align-items-center no-gutters'>
					<div className='col'>
						<h1 className='display-4 text-primary mb-0 d-none d-md-none d-xl-block'>
							<img src={LogoBase64} width='150' height='150' className='me-4' alt='Logo' />
							Brain Cloud - Dream Journal
						</h1>
						<h3 className='text-primary mb-0 d-none d-md-none d-lg-block d-xl-none'>
							<img src={LogoBase64} width='75' height='75' className='me-4' alt='Logo' />
							Brain Cloud - Dream Journal
						</h3>
						<h2 className='text-primary mb-0 d-none d-md-block d-lg-none'>Brain Cloud<br/>Dream Journal</h2>
						<h3 className='text-primary mb-0 d-block d-md-none'>Brain Cloud</h3>
					</div>
					<div className='col-auto'>
						<button className='btn btn-primary px-3 px-md-4 text-uppercase' type='button' disabled={!props.dataFile} onClick={() => setShowModal(true)}>
							Create
							<br />
							Entry
							<Plus size='64' className='d-none  d-md-none d-lg-block' />
							<Plus size='32' className='d-block d-lg-none mx-auto' />
						</button>
					</div>
				</div>

				<p className='lead mt-3'>Record your daily dream journal entries into well-formatted JSON, enabling keyword searches, metrics and more.</p>
				<hr className='my-4' />

				<div className='row mb-5'>
					<div className='col-12 col-md d-flex mb-5 mb-md-0'>
						<div className='card flex-fill'>
							<div className={'card-header' + (props.authState && props.authState.status === AuthState.Authenticated ? ' bg-success' : ' bg-warning')}>
								<h5 className='card-title text-white mb-0'>{props.authState ? props.authState.status : '???'}</h5>
							</div>
							<div className='card-body bg-light text-dark'>{renderCardAuthUser()}</div>
						</div>
					</div>
					<div className='col-12 col-md d-flex'>
						<div className='card flex-fill'>
							<div className='card-header bg-info'>
								<h5 className='card-title text-white mb-0'>Dream Journal</h5>
							</div>
							<div className='card-body bg-light text-dark'>{renderCardDataFile()}</div>
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
