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

import { useState } from 'react'
import { APP_VER, AuthState, IAuthState, IDriveDataFile, IJournalEntry, IS_LOCALHOST } from './app.types'
import { Plus } from 'react-bootstrap-icons'
import LogoBase64 from '../img/logo_base64'
import { appdata } from './appdata'

interface Props {
	appdataSvc: appdata
	authState: IAuthState
	dataFile: IDriveDataFile
	setShowModal: (show: boolean) => void
	setCurrEntry: (entry: IJournalEntry | undefined) => void
}

export default function TabHome(props: Props) {
	const [isBusy, setIsBusy] = useState(false)

	async function doAuthSignIn() {
		setIsBusy(true)
		await props.appdataSvc.doAuthSignIn()
		setIsBusy(false)
	}

	async function doReadDataFile() {
		setIsBusy(true)
		await props.appdataSvc.doRefreshDataFile()
		setIsBusy(false)
	}

	function doShowNewEntryModal() {
		props.setCurrEntry(undefined)
		props.setShowModal(true)
	}

	function getReadableFileSizeString(fileSizeInBytes: number) {
		let idx = -1
		const byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB']
		do {
			fileSizeInBytes = fileSizeInBytes / 1024
			idx++
		} while (fileSizeInBytes > 1024)

		return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[idx]
	}

	function renderCardAuthUser(): JSX.Element {
		let cardAuthUser: JSX.Element = <div />

		if (IS_LOCALHOST && props.authState) console.log(props.authState)
		if (props.authState && props.authState.status === AuthState.Authenticated) {
			cardAuthUser = (
				<div>
					<div className='row mb-3'>
						<div className='col'>
							<h5 className='card-title'>User Name</h5>
							<p className='card-text'>{props.authState.userName || '(?)'}</p>
						</div>
						<div className='col-auto text-end'>
							<h5>App Version</h5>
							<h6 className='mb-0'>{APP_VER}</h6>
						</div>
					</div>
					<div className='row mb-0'>
						<div className='col'>
							<button className='btn btn-outline-warning btn-lg w-100' onClick={() => doReadDataFile()}>
								Reload Data
							</button>
						</div>
						<div className='col'>
							<button className='btn btn-outline-danger btn-lg w-100' onClick={() => props.appdataSvc.doAuthSignOut()}>
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
					<button className='btn btn-warning' onClick={() => doAuthSignIn()}>
						Sign In
					</button>
				</div>
			)
		} else {
			cardAuthUser = (
				<div>
					<p className='card-text mb-4'>Please sign-in to allow access to Google Drive space.</p>
					<button className='btn btn-primary' onClick={() => doAuthSignIn()}>
						Sign In/Authorize
					</button>
				</div>
			)
		}

		return cardAuthUser
	}

	function renderCardDataFile(): JSX.Element {
		return isBusy ? (
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
						<h5 className='card-title'>File Name</h5>
						<p className='card-text'>{props.dataFile?.name || '(?)'}</p>
					</div>
					<div className='col-auto text-end'>
						<h5 className='card-title'>Entries</h5>
						<p className='card-text'>{props.dataFile?.entries ? props.dataFile.entries.length : '-'}</p>
					</div>
				</div>
				<div className='row'>
					<div className='col'>
						<h5 className='card-title'>Last Saved</h5>
						<p className='card-text'>{props.dataFile?.modifiedTime ? new Date(props.dataFile.modifiedTime).toLocaleString() : '-'}</p>
					</div>
					<div className='col-auto text-end'>
						<h5 className='card-title'>File Size</h5>
						<p className='card-text'>{props.dataFile?.size ? getReadableFileSizeString(Number(props.dataFile.size)) : '-'}</p>
					</div>
				</div>
			</div>
		) : (
			<div className='text-muted'>(none)</div>
		)
	}

	return (
		<section className='m-2 m-md-5' style={{ marginLeft: '10rem!important', marginRight: '10rem!important' }}>
			<div className='be-bg-darkest p-4 p-md-5'>
				<div className='row align-items-center g-0 mb-3'>
					<div className='col'>
						<h1 className='display-4 text-primary mb-0 d-none d-md-none d-xl-block'>
							<img src={LogoBase64} width='150' height='150' className='me-4' alt='Logo' />
							Brain Cloud - Dream Journal
						</h1>
						<h3 className='text-primary mb-0 d-none d-md-none d-lg-block d-xl-none'>
							<img src={LogoBase64} width='75' height='75' className='me-4' alt='Logo' />
							Brain Cloud - Dream Journal
						</h3>
						<h2 className='text-primary mb-0 d-none d-md-block d-lg-none'>
							Brain Cloud
							<br />
							Dream Journal
						</h2>
						<h3 className='text-primary mb-0 d-block d-md-none'>
							Brain Cloud
							<br />
							Dream Journal
						</h3>
					</div>
					{props.authState?.status === AuthState.Authenticated && <div className='col-auto'>
						<button className='btn btn-primary px-3 px-md-4 text-uppercase' type='button' disabled={!props.dataFile || isBusy} onClick={() => doShowNewEntryModal()}>
							Create
							<br />
							Entry
							<Plus size='64' className='d-none  d-md-none d-lg-block' />
							<Plus size='32' className='d-block d-lg-none mx-auto' />
						</button>
					</div>}
				</div>

				<h6 className='my-5'>Record your daily dream journal entries into well-formatted JSON, enabling keyword searches, metrics and more.</h6>

				{props.authState?.status === AuthState.Authenticated ?
					<div className='row g-5 row-cols-1 row-cols-md-2'>
						<div className='col'>
							<div className='card h-100'>
								<div className='card-header bg-success'>
									<h4 className='card-title text-white'>{props.authState?.status}</h4>
								</div>
								<div className='card-body'>{renderCardAuthUser()}</div>
							</div>
						</div>
						<div className='col'>
							<div className='card h-100'>
								<div className='card-header bg-info'>
									<h5 className='card-title text-white'>Dream Journal</h5>
								</div>
								<div className='card-body'>{renderCardDataFile()}</div>
							</div>
						</div>
					</div>
					:
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
							<button className='btn btn-outline-primary btn-lg mt-3 w-100' onClick={() => doAuthSignIn()}>
								Sign In
							</button>
						</div>
					</div>
				}
			</div>
		</section>
	)
}
