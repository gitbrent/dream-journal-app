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

import { useContext } from 'react'
import { APP_VER, IJournalEntry } from './app.types'
import { AuthContext } from '../api-google/AuthContext'
import { DataContext } from '../api-google/DataContext'
import { Plus } from 'react-bootstrap-icons'
import LogoBase64 from '../img/logo_base64'

interface Props {
	setShowModal: (show: boolean) => void
	setCurrEntry: (entry: IJournalEntry | undefined) => void
}

export default function TabHome(props: Props) {
	const { isSignedIn, signIn, signOut, userProfile } = useContext(AuthContext)
	const { isLoading, refreshData, driveDataFile } = useContext(DataContext)

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

		if (isSignedIn) {
			cardAuthUser = (
				<section>
					<div className='row mb-4'>
						<div className='col'>
							<h6 className='card-title text-primary-emphasis'>User Name</h6>
							<h3 className='fw-light mb-0'>{userProfile?.getName() || '(?)'}</h3>
						</div>
						<div className='col-auto text-end'>
							<h6 className='card-title text-primary-emphasis'>App Version</h6>
							<h3 className='fw-light mb-0'>{APP_VER || '(?)'}</h3>
						</div>
					</div>
					<div className='row mt-4'>
						<div className='col'>
							<h6 className='card-title text-primary-emphasis'>User Email</h6>
							<h3 className='fw-light mb-0'>{userProfile?.getEmail() || '(?)'}</h3>
						</div>
					</div>
				</section>
			)
		} else {
			cardAuthUser = (
				<div>
					<p className='card-text mb-4'>Please sign-in to allow access to Google Drive space.</p>
					<button className='btn btn-primary' onClick={() => signIn()}>
						Sign In/Authorize
					</button>
				</div>
			)
		}

		return cardAuthUser
	}

	function renderCardDataFile(): JSX.Element {
		return isLoading ? (
			<div className='text-warning d-flex flex-column justify-content-center align-items-center h-100'>
				<div className='spinner-border spinner-border-lg mb-4' role='status'>
					<span className='visually-hidden' />
				</div>
				<h3 className='mb-0 fw-light'>Loading/Saving...</h3>
			</div>
		) : driveDataFile ? (
			<section>
				<div className='row mb-3'>
					<div className='col'>
						<h6 className='card-title text-primary-emphasis'>File Name</h6>
						<h3 className='fw-light mb-0'>{driveDataFile?.name || '(?)'}</h3>
					</div>
					<div className='col-auto text-end'>
						<h6 className='card-title text-primary-emphasis'>File Size</h6>
						<h3 className='fw-light mb-0'>{driveDataFile?.size ? getReadableFileSizeString(Number(driveDataFile.size)) : '-'}</h3>
					</div>
				</div>
				<div className='row mt-4'>
					<div className='col'>
						<h6 className='card-title text-primary-emphasis'>Last Saved</h6>
						<h3 className='fw-light mb-0'>{driveDataFile?.modifiedTime ? new Date(driveDataFile.modifiedTime).toLocaleString() : '-'}</h3>
					</div>
					<div className='col-auto text-end'>
						<h6 className='card-title text-primary-emphasis'>Total Entries</h6>
						<h3 className='fw-light mb-0'>{driveDataFile?.entries ? driveDataFile.entries.length : '-'}</h3>
					</div>
				</div>
			</section>
		) : (
			<div className='text-muted'>(none)</div>
		)
	}

	return (
		<section className='m-2 m-md-5'>
			<div className='be-bg-darkest p-4 p-md-5'>
				<div className='row align-items-center mb-5'>
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
					{isSignedIn && <div className='col-auto'>
						<button className='btn btn-lg btn-success text-uppercase d-flex align-items-center' type='button' disabled={!driveDataFile || isLoading} onClick={() => doShowNewEntryModal()}>
							<div className='text-start py-3 me-3'>
								<Plus size='4rem' className='d-none  d-md-none d-lg-block' />
								<Plus size='2rem' className='d-block d-lg-none mx-auto' />
							</div>
							<div className='text-start h3 mb-0 py-3'>
								<div>Create</div>
								<div>Entry</div>
							</div>
						</button>
					</div>}
				</div>
				{isSignedIn ?
					<div className='row g-5 row-cols-1 row-cols-md-2'>
						<div className='col'>
							<div className='card text-bg-primary h-100'>
								<div className='card-header'>
									<h5 className='card-title'>Session Details</h5>
								</div>
								<div className='card-body bg-primary-subtle'>{renderCardAuthUser()}</div>
								<div className='card-footer bg-primary-subtle py-3'>
									<button className='btn btn-outline-danger btn-lg w-100' onClick={signOut} disabled={isLoading}>
										Sign Out
									</button>
								</div>
							</div>
						</div>
						<div className='col'>
							<div className='card text-bg-primary h-100'>
								<div className='card-header'>
									<h5 className='card-title'>Dream Journal</h5>
								</div>
								<div className='card-body bg-primary-subtle'>{renderCardDataFile()}</div>
								<div className='card-footer bg-primary-subtle py-3'>
									<button className='btn btn-outline-warning btn-lg w-100' onClick={refreshData} disabled={isLoading}>
										Reload Data
									</button>
								</div>
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
							<button className='btn btn-outline-primary btn-lg mt-3 w-100' onClick={() => signIn()}>
								Sign In
							</button>
						</div>
					</div>
				}
			</div>
		</section>
	)
}
