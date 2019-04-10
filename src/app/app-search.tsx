import React from 'react'
import { IJournalDream, IJournalEntry, IDriveFile } from './app'

interface ISearchMatch {
	entryDate: IJournalEntry['entryDate']
	dream: IJournalDream
}
const _MS_PER_DAY = 1000 * 60 * 60 * 24

export default class TabSearch extends React.Component<
	{ selDataFile: IDriveFile },
	{ searchMatches: Array<ISearchMatch>; searchTerm: string }
> {
	constructor(props: Readonly<{ selDataFile: IDriveFile }>) {
		super(props)

		this.state = {
			searchMatches: [],
			searchTerm: '',
		}
	}

	/*

	// a and b are javascript Date objects
	function dateDiffInDays(a, b) {
	  // Discard the time and time-zone information.
	  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
	  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

	  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
	}

	// test it
	const a = new Date("2017-01-01"),
	    b = new Date("2017-07-25"),
	    difference = dateDiffInDays(a, b);
	*/

	doKeywordSearch = () => {
		let arrFound = []
		let regex = new RegExp('\\b' + this.state.searchTerm + '\\b', 'gi')

		if (!this.props.selDataFile || this.props.selDataFile.entries.length <= 0) return

		this.props.selDataFile.entries.forEach(entry => {
			;(entry.dreams || []).forEach(dream => {
				if ((dream.notes || '').match(regex))
					arrFound.push({
						entryDate: entry.entryDate,
						dream: dream,
					})
			})
		})

		this.setState({
			searchMatches: arrFound,
		})
	}

	/**
	 * @see: https://stackoverflow.com/questions/29652862/highlight-text-using-reactjs
	 */
	getHighlightedText(text: string, highlight: string) {
		// Split on highlight term and include term into parts, ignore case
		//let parts = text.split(new RegExp(`(${highlight})`, 'gi'));
		let parts = text.split(new RegExp('\\b(' + highlight + ')\\b', 'gi'))
		return (
			<span>
				{' '}
				{parts.map((part, i) => (
					<span
						key={i}
						className={part.toLowerCase() === highlight.toLowerCase() ? 'badge badge-warning' : ''}>
						{part}
					</span>
				))}{' '}
			</span>
		)
	}

	render() {
		let searchMatches: JSX.Element = (
			<div className='container bg-light my-5'>
				{this.state.searchMatches.map((obj, idx) => {
					return (
						<div className='row p-4' key={'searchResultRow' + idx}>
							<div className='col-auto'>{new Date(obj.entryDate).toLocaleDateString()}</div>
							<div className='col-2'>{obj.dream.title}</div>
							<div className='col' style={{ whiteSpace: 'pre-line' }}>
								{this.getHighlightedText(obj.dream.notes, this.state.searchTerm)}
							</div>
						</div>
					)
				})}
				{this.state.searchMatches.length == 0 ? <h3>(No Dreams Found)</h3> : ''}
			</div>
		)

		return (
			<div>
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
				</div>

				<div className='container bg-light mt-5'>
					<div className='row p-4'>
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

				<div className='container bg-light mt-5'>
					<div className='row p-4'>
						<div className='col-auto'>
							<div className='iconSvg size24 search' />
						</div>
						<div className='col'>
							<input
								type='text'
								className='form-control'
								onKeyPress={event => {
									if (event.key == 'Enter') this.doKeywordSearch()
								}}
								onChange={event => {
									this.setState({ searchTerm: event.target.value })
								}}
							/>
						</div>
						<div className='col-auto'>
							<button type='button' className='btn btn-primary' onClick={this.doKeywordSearch}>
								Search
							</button>
						</div>
					</div>
				</div>

				{searchMatches}
			</div>
		)
	}
}
