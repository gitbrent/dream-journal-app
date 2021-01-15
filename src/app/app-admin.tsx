import React, { useState, useEffect } from 'react'
import { IDriveFile } from './app.types'

export interface IAppAdminProps {
	dataFile: IDriveFile
	doSaveAdminState: Function
	adminState: IAppAdminState
}
export interface IAppAdminState {
	searchDone: boolean
	/*
	searchMatches: ISearchMatch[]
	searchOptMatchType: SearchMatchTypes
	searchOptScope: SearchScopes
	searchTerm: string
	searchTermInvalidMsg: string
	showAlert: boolean
	*/
}

export default function TabAdmin(props: IAppAdminProps) {
	return (
		<div>
			<header className='container my-5'>
				<div className='card my-5'>
					<div className='card-header bg-primary'>
						<h5 className='card-title text-white mb-0'>Dream Journal Admin</h5>
					</div>
					<div className='card-body bg-light'>
						<div className='row align-items-start justify-content-around'>
							<div className='col-auto text-center d-none d-md-block'>
								<label className='text-primary text-uppercase'>Months</label>
								<div className='badge badge-pill badge-primary w-100'>{' years'}</div>
							</div>
						</div>
					</div>
				</div>
			</header>

			<main>
				<div>TODO:</div>
			</main>
		</div>
	)
}
