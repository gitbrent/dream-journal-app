import React from 'react'
import { IJournalEntry, IDriveFile } from './app'

export default class TabSearch extends React.Component<{ selDataFile: IDriveFile }> {
	constructor(props: Readonly<{ selDataFile: IDriveFile }>) {
		super(props) 
	}

	render() {
		return (
			<div className='container mt-5'>
				<div className='card mb-5'>
					<div className='card-header bg-primary'>
						<h5 className='card-title text-white mb-0'>Search / Analyize Dream Journal Entries</h5>
					</div>
					<div className='card-body bg-light'>
						<div className='row align-items-top'>
							<div className='col-auto'>
								<div className='iconSvg size96 wizard' />
							</div>
							<div className='col'>
								<p className='card-text'>
									The best feature of a well-formatted dream journal is the ability to analyze its
									contents.
								</p>
								<p className='card-text'>
									How many lucid dreams have you had?
									<br />
									What are your common dream signs?
									<br />
									How many times have you dreamed about school?
									<br />
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className='row bg-light p-4'>
					<div className='col text-center border-secondary border-right'>
						<label className='text-muted text-uppercase'>Daily Entries</label>
						<h1 className='text-primary'>
							{this.props.selDataFile && this.props.selDataFile.entries
								? this.props.selDataFile.entries.length
								: '-'}
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
								: '-'}
						</h1>
					</div>
				</div>
			</div>
		)
	}
}
