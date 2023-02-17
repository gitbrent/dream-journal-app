import React from 'react'
import { CloudSlash } from 'react-bootstrap-icons'

interface Props {
	isBusyLoad: boolean
}

export default function AlertGdriveStatus(props: Props) {
	return (
		<section className='container text-center my-5'>
			{props.isBusyLoad ? (
				<div className='alert alert-primary text-nowrap d-inline-block' role='alert'>
					<div className='row align-items-center'>
						<div className='col-auto pe-0'>
							<div className='spinner-border text-white' role='status'>
								<span className='visually-hidden'>Loading...</span>
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
						<div className='col text-end'>
							<button type='button' onClick={() => alert('FIXME:')} className='btn btn-secondary'>
								Renew
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	)
}
