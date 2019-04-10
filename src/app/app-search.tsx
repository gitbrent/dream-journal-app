import React from 'react'
import Alert from 'react-bootstrap/Alert'
import { IJournalDream, IJournalEntry, IDriveFile } from './app'

interface ISearchMatch {
	entryDate: IJournalEntry['entryDate']
	dream: IJournalDream
}

export default class TabSearch extends React.Component<
	{ selDataFile: IDriveFile },
	{ searchMatches: Array<ISearchMatch>; searchTerm: string; showAlert: boolean }
> {
	constructor(props: Readonly<{ selDataFile: IDriveFile }>) {
		super(props)

		let localShowAlert = JSON.parse(localStorage.getItem('show-alert-search'))

		this.state = {
			searchMatches: [],
			searchTerm: '',
			showAlert: typeof localShowAlert === 'boolean' ? localShowAlert : true,
		}
	}

	handleHideAlert = event => {
		localStorage.setItem('show-alert-search', 'false')
		this.setState({ showAlert: false })
	}

	getTotalMonths = () => {
		if (!this.props.selDataFile || (this.props.selDataFile.entries || []).length == 0) return 0

		let d1 = new Date(this.props.selDataFile.entries[0].entryDate)
		let d2 = new Date(this.props.selDataFile.entries[this.props.selDataFile.entries.length - 1].entryDate)
		let months
		months = (d2.getFullYear() - d1.getFullYear()) * 12
		months -= d1.getMonth() + 1
		months += d2.getMonth()
		months += 2 // include both first and last months

		return months <= 0 ? 0 : months
	}

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
		let totalDreams = 0
		let totalLucids = 0

		if (this.props.selDataFile && this.props.selDataFile.entries) {
			this.props.selDataFile.entries.forEach(entry => {
				totalDreams += entry.dreams.length

				totalLucids += entry.dreams.filter(dream => {
					return dream.isLucidDream
				}).length
			})
		}

		let searchMatches: JSX.Element = (
			<div className='container bg-light my-1'>
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
				{this.state.searchTerm && this.state.searchMatches.length == 0 ? (
					<h3 className='text-center'>(No Dreams Found)</h3>
				) : (
					''
				)}
			</div>
		)

		return (
			<div>
				<div className='container mt-5'>
					{this.state.showAlert ? (
						<Alert variant='success'>
							<Alert.Heading>Make good use of your Dream Journal</Alert.Heading>
							<p>
								Analyze your journal to learn more about yourself, spot common themes/dreamsigns and
								improve your lucid dreaming ability.
							</p>
							<ul>
								<li>How many lucid dreams have you had?</li>
								<li>What are your common dream signs?</li>
								<li>How many times have you dreamed about school?</li>
							</ul>
							<p>Let's find out!</p>
							<hr />
							<div className='d-flex justify-content-end'>
								<button className='btn btn-light' onClick={this.handleHideAlert}>
									Dismiss
								</button>
							</div>
						</Alert>
					) : (
						''
					)}
					<div className='card my-5'>
						<div className='card-header bg-primary'>
							<h5 className='card-title text-white mb-0'>Dream Journal Metrics</h5>
						</div>
						<div className='card-body bg-light'>
							<div className='row align-items-center'>
								<div className='col-auto'>
									<div className='iconSvg size96 analyze' />
								</div>
								<div className='col text-center'>
									<label className='text-primary text-uppercase'>Total Months</label>
									<h1 className='text-primary mb-0'>{this.getTotalMonths() || '-'}</h1>
								</div>
								<div className='col text-center'>
									<label className='text-primary text-uppercase'>Total Daily Entries</label>
									<h1 className='text-primary mb-0'>
										{this.props.selDataFile && this.props.selDataFile.entries
											? this.props.selDataFile.entries.length
											: '-'}
									</h1>
								</div>
								<div className='col text-center'>
									<label className='text-info text-uppercase'>Total Dreams</label>
									<h1 className='text-info mb-0'>{totalDreams || '-'}</h1>
								</div>
								<div className='col text-center'>
									<label className='text-success text-uppercase'>Lucid Dreams</label>
									<h1 className='text-success mb-0'>{totalLucids || '-'}</h1>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className='container mt-5'>
					<div className='card my-5'>
						<div className='card-header bg-primary'>
							<h5 className='card-title text-white mb-0'>Keyword Search</h5>
						</div>
						<div className='card-body bg-light'>
							<div className='row align-items-center p-4'>
								<div className='col-auto'>
									<div className='iconSvg size32 search' />
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
										disabled={!this.props.selDataFile ? true : false}
									/>
								</div>
								<div className='col-auto'>
									<button
										type='button'
										className='btn btn-primary'
										onClick={this.doKeywordSearch}
										disabled={!this.props.selDataFile ? true : false}>
										Search
									</button>
								</div>
							</div>
							{searchMatches}
						</div>
					</div>
				</div>
			</div>
		)
	}
}
