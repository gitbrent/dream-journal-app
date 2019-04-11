import React from 'react'
import Alert from 'react-bootstrap/Alert'
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import { IJournalDream, IJournalEntry, IDriveFile } from './app'

interface ISearchMatch {
	entryDate: IJournalEntry['entryDate']
	dream: IJournalDream
}

export default class TabSearch extends React.Component<
	{ onShowModal: Function; selDataFile: IDriveFile },
	{ filterShowLucid: boolean; searchMatches: Array<ISearchMatch>; searchTerm: string; showAlert: boolean }
> {
	constructor(props: Readonly<{ onShowModal: Function; selDataFile: IDriveFile }>) {
		super(props)

		let localShowAlert = JSON.parse(localStorage.getItem('show-alert-search'))

		this.state = {
			filterShowLucid: false,
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

	handleEntryEdit = e => {
		this.props.onShowModal({
			show: true,
			editEntry: this.props.selDataFile.entries.filter(entry => {
				return entry.entryDate == e.target.getAttribute('data-entry-key')
			})[0],
		})
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

		// TODO: Show Lucid/Succes check icon and star icon when found
		let searchMatches: JSX.Element = (
			<div>
				{this.state.searchMatches.map((entry, idx) => {
					return (
						<div className='card' key={'searchResultCard' + idx}>
							<div className='card-body'>
								<a
									href='javascript:void(0)'
									title='View Entry'
									className='card-link'
									data-entry-key={entry.entryDate}
									onClick={this.handleEntryEdit}>
									<h5 className='card-title'> {entry.dream.title}</h5>
								</a>
								<p className='card-text' style={{ whiteSpace: 'pre-line' }}>
									{this.getHighlightedText(entry.dream.notes, this.state.searchTerm)}
								</p>
								<p className='card-text'>
									<small className='text-muted'>
										{new Date(entry.entryDate).toLocaleDateString()}
									</small>
								</p>
							</div>
						</div>
					)
				})}
			</div>
		)

		return (
			<div>
				<div className='container my-5'>
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
							<div className='row align-items-center p-2'>
								<div className='col-auto'>
									<div className='iconSvg size80 analyze' />
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

				<div className='container my-5'>
					<div className='row'>
						<div className='col-12 col-md-6'>
							<div className='card'>
								<div className='card-header bg-info'>
									<h5 className='card-title text-white mb-0'>Search</h5>
								</div>
								<div className='card-body bg-light p-4'>
									<div className='row align-items-center'>
										<div className='col-auto'>
											<div className='iconSvg size32 search' />
										</div>
										<div className='col'>
											<input
												type='text'
												className='form-control'
												placeholder='keyword or phrase'
												onKeyPress={event => {
													if (event.key == 'Enter') this.doKeywordSearch()
												}}
												onChange={event => {
													this.setState({ searchTerm: event.target.value })
													if (!event.target.value) this.setState({ searchMatches: [] })
												}}
												disabled={!this.props.selDataFile ? true : false}
											/>
										</div>
										<div className='col-auto'>
											<button
												type='button'
												className='btn btn-outline-primary'
												onClick={this.doKeywordSearch}
												disabled={!this.props.selDataFile ? true : false}>
												Search
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className='col-12 col-md-6'>
							<div className='card'>
								<div className='card-header bg-secondary'>
									<h5 className='card-title text-white mb-0'>Filter</h5>
								</div>
								<div className='card-body bg-light p-4'>
									<div className='row align-items-center'>
										<div className='col-auto'>
											<div className='iconSvg size32 filter' />
										</div>
										<div className='col'>
											<BootstrapSwitchButton
												onChange={(checked: boolean) => {
													this.setState({ filterShowLucid: checked })
												}}
												checked={this.state.filterShowLucid}
												onlabel='Show Lucid Dreams'
												onstyle='outline-success'
												offlabel='Dont Show Lucid Dreams'
												offstyle='outline-dark'
												style='w-100'
											/>
										</div>
										<div className='col'>
											<BootstrapSwitchButton
												onChange={(checked: boolean) => {
													this.setState({ filterShowLucid: checked })
												}}
												checked={this.state.filterShowLucid}
												onlabel='Show Starred'
												onstyle='outline-warning'
												offlabel='Dont Show Starred'
												offstyle='outline-dark'
												disabled={true}
												style='w-100'
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className='container bg-light pt-3 my-5'>
					{this.state.searchTerm && this.state.searchMatches.length > 0 ? (
						<h5 className='text-info ml-3 mb-3'>
							Found {this.state.searchMatches.length} Dreams (
							{Math.round((this.state.searchMatches.length / totalDreams) * 100)}
							%)
						</h5>
					) : (
						''
					)}
					{this.state.searchTerm ? (
						<div className='card-columns'>{searchMatches}</div>
					) : (
						<h3 className='text-center'>(enter a keyword above to search)</h3>
					)}
				</div>
			</div>
		)
	}
}
