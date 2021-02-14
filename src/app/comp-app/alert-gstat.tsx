import React, { useState, useEffect } from 'react'
import { CloudSlash } from 'react-bootstrap-icons'
import * as GDrive from '../google-oauth'

export default function AlertGdriveStatus() {
	const [isBusyLoad, setIsBusyLoad] = useState(false)

	useEffect(() => {
		/** @see https://stackoverflow.com/a/60907638 */
		let isMounted = true // note this flag denote mount status
		GDrive.busyLoadCallback((stat: boolean) => isMounted && setIsBusyLoad(stat)) // async operation here
		return () => (isMounted = false) // use effect cleanup to set flag false, if unmounted
	})

	return (
		<section className='container text-center my-5'>
			{isBusyLoad ? (
				<div className='alert alert-primary text-nowrap d-inline-block' role='alert'>
					<div className='row align-items-center'>
						<div className='col-auto pr-0'>
							<div className='spinner-border text-white' role='status'>
								<span className='sr-only'>Loading...</span>
							</div>
						</div>
						<div className='col'>Loading cloud data...</div>
					</div>
				</div>
			) : (
				<div className='alert alert-warning text-nowrap d-inline-block' role='alert'>
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
