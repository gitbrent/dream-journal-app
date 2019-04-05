import React from 'react'
import { IJournalEntry, IDriveFile } from './app'

export default class TabSearch extends React.Component<{ selDataFile: IDriveFile }> {
	constructor(props: Readonly<{ selDataFile: IDriveFile }>) {
		super(props)
	}

	render() {
		return (
			<div className='container mt-3'>
				<h2 className='text-primary mb-3'>Search Dream Journal</h2>

				<div className='row bg-light p-4'>
					<div className='col text-center border-secondary border-right'>
						<label className='text-muted text-uppercase'>Daily Entries</label>
						<h1 className='text-primary'>
							{this.props.selDataFile && this.props.selDataFile.entries
								? this.props.selDataFile.entries.length
								: '?'}
						</h1>
					</div>
					<div className='col text-center'>
						<label className='text-muted text-uppercase'>Lucid Dreams</label>
						<h1 className='text-primary'>
							{this.props.selDataFile && this.props.selDataFile.entries
								? this.props.selDataFile.entries.filter(entry => {
										return (
											entry.dreams.filter(dream => {
												return dream.isLucidDream
											}).length > 0
										)
								  }).length
								: '0'}
						</h1>
					</div>
				</div>
			</div>
		)
	}
}
