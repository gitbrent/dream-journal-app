import React, { useState, useEffect } from 'react'
import { CloudSlash } from 'react-bootstrap-icons'
import * as GDrive from '../google-oauth'

export default function AlertGdriveStatus() {
	const [isBusyLoad, setIsBusyLoad] = useState(false)

	useEffect(() => GDrive.busyLoadCallback((stat) => setIsBusyLoad(stat)), [])

	return (
		<section className='container my-5'>
			{isBusyLoad ? (
				<div className='alert alert-primary w-50 mx-auto' role='alert'>
					<div className='row align-items-center'>
						<div className='col-auto pr-0'>
							<div className='spinner-border text-white' role='status'>
								<span className='sr-only'>Loading...</span>
							</div>
						</div>
						<div className='col'>
							<h5 className='mb-0'>Loading cloud data...</h5>
						</div>
					</div>
				</div>
			) : (
				<div className='alert alert-warning' role='alert'>
					<div className='row align-items-center'>
						<div className='col-auto'>
							<CloudSlash size='36' />
						</div>
						<div className='col'>Your session has expired.</div>
						<div className='col text-right'>
							<button type='button' onClick={() => GDrive.doAuthSignIn()} className='btn btn-secondary'>
								Renew
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	)
}
