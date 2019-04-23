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
import { AuthState, IAuthState, IDriveFile, IDriveFiles } from './app'
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
		availDataFiles: IDriveFiles['available']
		doAuthSignIn: Function
		doAuthSignOut: Function
		doCreateJournal: Function
		doFileListRefresh: Function
		doRenameFile: Function
		doSelectFileById: Function
		selDataFile: IDriveFile
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
			availDataFiles: IDriveFiles['available']
			doAuthSignIn: Function
			doAuthSignOut: Function
			doCreateJournal: Function
			doFileListRefresh: Function
			doRenameFile: Function
			doSelectFileById: Function
			selDataFile: IDriveFile
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
			this.handleDriveFileList(null)
		}
	}

	handleAuthSignIn = e => {
		this.props.doAuthSignIn()
	}
	handleAuthSignOut = e => {
		this.props.doAuthSignOut()
	}

	handleDriveFileList = e => {
		this.props.doFileListRefresh()
	}
	handleDriveFileCreate = e => {
		this.props.doCreateJournal()
	}
	handleDriveFileGet = e => {
		this.props.doSelectFileById(e.target.getAttribute('data-file-id'))
	}
	/**
	 * @see:

	handleDriveFileCopy = e => {
		// TODO:
		// Use for "Make backup" (?)
		// POST https://www.googleapis.com/drive/v3/files/fileId/copy
	}
	*/

	handleCancelRename = event => {
		this.setState({
			errorMessage: '',
			fileBeingRenamed: null,
			newFileName: '',
			isRenaming: false,
		})
	}
	handleRenameInputChange = event => {
		this.setState({
			newFileName: event && event.target ? event.target.value : '',
		})
	}
	/**
	 * @see: https://developers.google.com/drive/api/v3/reference/files
	 * @see: https://stackoverflow.com/questions/43705453/how-do-i-rename-a-file-to-google-drive-rest-api-retrofit2
	 */
	handleDriveFileRename = e => {
		this.setState({
			errorMessage: '',
			fileBeingRenamed: this.props.availDataFiles.filter(file => {
				return file.id == e.target.getAttribute('data-file-id')
			})[0],
			newFileName: this.props.availDataFiles.filter(file => {
				return file.id == e.target.getAttribute('data-file-id')
			})[0].name,
		})
	}
	doRenameFile = e => {
		this.setState({
			isRenaming: true,
		})
		this.props
			.doRenameFile(
				this.props.availDataFiles.filter(file => {
					return file.id == e.target.getAttribute('data-file-id')
				})[0],
				this.state.newFileName
			)
			.catch(ex => {
				throw ex
			})
			.then(file => {
				// NOTE: Google-API will return an error object as a result
				if (file.error) throw file.error
				else {
					this.setState({
						errorMessage: '',
						fileBeingRenamed: null,
						newFileName: '',
						isRenaming: false,
					})
				}
			})
			.catch(error => {
				this.setState({
					errorMessage: error && error.message ? error.message : (error || '').toString(),
					isRenaming: false,
				})
			})
	}

	/**
	 * @see: https://developers.google.com/drive/api/v3/appdata
	 * @see: https://developers.google.com/drive/api/v3/search-parameters#file_fields
	 */
	render() {
		let cardbody: JSX.Element
		if (this.props.authState.status == AuthState.Authenticated) {
			cardbody = (
				<div>
					<p className='card-text'>
						<label className='text-muted text-uppercase d-block'>User Name:</label>
						{this.props.authState.userName}
					</p>
					<div className='row'>
						<div className='col-12 col-lg-6 mb-md-3'>
							<button
								className='btn btn-outline-primary w-100 mb-3 mb-md-0'
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
			cardbody = (
				<div>
					<p className='card-text'>Your session has expired. Please re-authenticate to continue.</p>
					<button className='btn btn-primary' onClick={this.handleAuthSignIn}>
						Sign In
					</button>
				</div>
			)
		} else {
			cardbody = (
				<div>
					<p className='card-text'>Please sign-in to allow access to Google Drive space.</p>
					<button className='btn btn-primary' onClick={this.handleAuthSignIn}>
						Sign In/Authorize
					</button>
				</div>
			)
		}

		let tableFileList: JSX.Element = (
			<form onSubmit={this.handleDriveFileRename}>
				<table className='table'>
					<thead className='thead'>
						<tr>
							<th style={{ width: '5%' }}>&nbsp;</th>
							<th style={{ width: '50%' }}>Name</th>
							<th className='text-center d-none d-md-table-cell'>Entries</th>
							<th className='text-center d-none d-md-table-cell'>Size</th>
							<th className='text-center d-none d-md-table-cell'>Modified&nbsp;▼</th>
							<th className='text-center d-none d-md-table-cell'>&nbsp;</th>
						</tr>
					</thead>
					<tbody>
						{this.props.authState.status == AuthState.Authenticated &&
							this.props.availDataFiles.map((file, idx) => {
								return (
									<tr key={'filerow' + idx}>
										{this.props.selDataFile &&
										this.props.selDataFile.id &&
										this.props.selDataFile.id === file.id ? (
											this.props.selDataFile._isLoading ? (
												<td className='align-middle text-center text-warning'>
													<div
														className='spinner-border spinner-border-sm mr-2'
														role='status'>
														<span className='sr-only' />
													</div>
												</td>
											) : (
												<td className='align-middle text-center'>
													<div className='text-info text-center w-100'>
														<small>Selected</small>
													</div>
												</td>
											)
										) : this.props.selDataFile &&
										  this.props.selDataFile.id &&
										  file.id === this.props.selDataFile.id ? (
											<td />
										) : !this.state.fileBeingRenamed ? (
											<td>
												<button
													className='btn btn-sm btn-info w-100'
													data-file-id={file['id']}
													onClick={this.handleDriveFileGet}>
													Select
												</button>
											</td>
										) : (
											<td />
										)}
										<td className='align-middle'>
											{this.state.fileBeingRenamed &&
											this.state.fileBeingRenamed.id === file.id ? (
												<input
													name='newFileName'
													value={this.state.newFileName}
													type='text'
													className='form-control'
													onChange={this.handleRenameInputChange}
													disabled={this.state.isRenaming}
													required
												/>
											) : (
												file.name
											)}
											{this.state.errorMessage ? (
												<div className='invalid-feedback d-block'>
													{this.state.errorMessage}
												</div>
											) : (
												''
											)}
										</td>
										<td className='align-middle text-center text-nowrap d-none d-md-table-cell'>
											{file['entries'] ? file['entries'].length : '?'}
										</td>
										<td className='align-middle text-center text-nowrap d-none d-md-table-cell'>
											{getReadableFileSizeString(Number(file['size']))}
										</td>
										<td className='align-middle text-center text-nowrap d-none d-md-table-cell'>
											{new Date(file['modifiedTime']).toLocaleString()}
										</td>
										<td className='align-middle text-center text-nowrap d-none d-md-table-cell'>
											{this.state.fileBeingRenamed &&
											this.state.fileBeingRenamed.id === file.id ? (
												this.state.isRenaming ? (
													<div
														className='spinner-border text-warning spinner-border-sm mr-2'
														role='status'>
														<span className='sr-only' />
													</div>
												) : (
													<div>
														<button
															type='button'
															className='btn btn-sm btn-success mr-2'
															data-file-id={file['id']}
															onClick={this.doRenameFile}>
															Save
														</button>
														<button
															type='button'
															className='btn btn-sm btn-outline-secondary'
															data-file-id={file['id']}
															onClick={this.handleCancelRename}>
															Cancel
														</button>
													</div>
												)
											) : (
												!this.state.fileBeingRenamed && (
													<button
														type='button'
														className='btn btn-sm btn-secondary mr-2'
														data-file-id={file['id']}
														onClick={this.handleDriveFileRename}>
														Rename
													</button>
												)
											)}
										</td>
									</tr>
								)
							})}
					</tbody>
				</table>
			</form>
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
						<div className='col-12 col-md-8 d-flex mb-5 mb-md-0'>
							<div className='card flex-fill'>
								<div className='card-header bg-primary'>
									<h5 className='card-title text-white mb-0'>Google Drive Cloud Integration</h5>
								</div>
								<div className='card-body bg-light text-dark'>
									<p className='card-text'>
										This application uses your Google Drive to store dream journals so they are
										safe, secure, and accessible on any of your devices.
									</p>
									<p className='card-text'>
										Signing In will request permissions to create and modify
										<strong> only its own files</strong> on your Google Drive.
									</p>
								</div>
							</div>
						</div>
						<div className='col-12 col-md-4 d-flex'>
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
								<div className='card-body bg-light text-dark'>{cardbody}</div>
							</div>
						</div>
					</div>

					<div className='card'>
						<div className='card-header bg-info'>
							<h5 className='card-title text-white mb-0'>Available Dream Journals</h5>
						</div>
						<div className='card-body bg-light text-dark'>
							{tableFileList}
							<div className='row'>
								<div className='col-12 col-md-6 text-center'>
									<button
										className='btn btn-outline-info w-100 mb-3 mb-md-0'
										onClick={this.handleDriveFileList}
										disabled={
											this.props.authState.status != AuthState.Authenticated ? true : false
										}>
										Refresh File List
									</button>
								</div>
								<div className='col-12 col-md-6 text-center'>
									<button
										className='btn btn-outline-info w-100'
										onClick={this.handleDriveFileCreate}
										disabled={
											this.props.authState.status != AuthState.Authenticated ? true : false
										}>
										New Dream Journal
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default TabHome
