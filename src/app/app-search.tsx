import React from 'react'
import Alert from 'react-bootstrap/Alert'
//import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import { IJournalDream, IJournalEntry, IDriveFile } from './app'

enum SearchMatchTypes {
	contains = 'Contains',
	starts = 'Starts With',
	whole = 'Whole Word',
}
enum SearchScopes {
	all = 'All Fields',
	signs = 'Dream Signs',
	notes = 'Dream Notes',
	title = 'Dream Title',
}

interface ISearchMatch {
	entryDate: IJournalEntry['entryDate']
	dream: IJournalDream
}

export default class TabSearch extends React.Component<
	{
		doSaveSearchState: Function
		onShowModal: Function
		searchState: object
		selDataFile: IDriveFile
	},
	{
		searchMatches: Array<ISearchMatch>
		searchOptMatchType: SearchMatchTypes
		searchOptScope: SearchScopes
		searchTerm: string
		searchTermInvalidMsg: string
		showAlert: boolean
	}
> {
	constructor(
		props: Readonly<{
			doSaveSearchState: Function
			onShowModal: Function
			searchState: object
			selDataFile: IDriveFile
		}>
	) {
		super(props)

		let localShowAlert = JSON.parse(localStorage.getItem('show-alert-search'))

		this.state = {
			searchOptMatchType:
				this.props.searchState && this.props.searchState['searchOptMatchType']
					? this.props.searchState['searchOptMatchType']
					: SearchMatchTypes.whole,
			searchOptScope:
				this.props.searchState && this.props.searchState['searchOptScope']
					? this.props.searchState['searchOptScope']
					: SearchScopes.all,
			searchMatches:
				this.props.searchState && this.props.searchState['searchMatches']
					? this.props.searchState['searchMatches']
					: [],
			searchTerm:
				this.props.searchState && this.props.searchState['searchTerm']
					? this.props.searchState['searchTerm']
					: '',
			searchTermInvalidMsg:
				this.props.searchState && this.props.searchState['searchTermInvalidMsg']
					? this.props.searchState['searchTermInvalidMsg']
					: '',
			showAlert: typeof localShowAlert === 'boolean' ? localShowAlert : true,
		}
	}

	/**
	 * this constructor is called whenever tab is hidden/shown, so state must be preserved by parent (lifting state up)
	 */
	componentWillUnmount = () => {
		this.props.doSaveSearchState(this.state)
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

	handleTypeChange = event => {
		let newState = { searchOptMatchType: null }

		if (event.target.value == SearchMatchTypes.contains) newState.searchOptMatchType = SearchMatchTypes.contains
		else if (event.target.value == SearchMatchTypes.starts) newState.searchOptMatchType = SearchMatchTypes.starts
		else if (event.target.value == SearchMatchTypes.whole) newState.searchOptMatchType = SearchMatchTypes.whole
		this.setState(newState)

		setTimeout(this.doKeywordSearch, 100) // TODO: no use, state change
	}
	handleScopeChange = event => {
		let newState = { searchOptScope: null }

		if (event.target.value == SearchScopes.all) newState.searchOptScope = SearchScopes.all
		else if (event.target.value == SearchScopes.notes) newState.searchOptScope = SearchScopes.notes
		else if (event.target.value == SearchScopes.signs) newState.searchOptScope = SearchScopes.signs
		else if (event.target.value == SearchScopes.title) newState.searchOptScope = SearchScopes.title
		this.setState(newState)

		setTimeout(this.doKeywordSearch, 100) // TODO: no use, state change
	}

	doKeywordSearch = () => {
		let arrFound = []
		let regex = new RegExp(this.state.searchTerm, 'gi') // SearchMatchTypes.contains
		if (this.state.searchOptMatchType == SearchMatchTypes.whole)
			regex = new RegExp('\\b' + this.state.searchTerm + '\\b', 'gi')
		else if (this.state.searchOptMatchType == SearchMatchTypes.starts)
			regex = new RegExp('\\b' + this.state.searchTerm, 'gi')
		if (!this.props.selDataFile || this.props.selDataFile.entries.length <= 0) return

		this.props.selDataFile.entries.forEach(entry => {
			;(entry.dreams || []).forEach(dream => {
				// searchOptScope
				if (this.state.searchOptScope == SearchScopes.all) {
					if (
						(dream.notes || '').match(regex) ||
						(dream.title || '').match(regex) ||
						(Array.isArray(dream.dreamSigns) &&
							dream.dreamSigns.filter(sign => {
								return sign.match(regex)
							}).length > 0)
					) {
						arrFound.push({
							entryDate: entry.entryDate,
							dream: dream,
						})
					}
				} else if (this.state.searchOptScope == SearchScopes.notes) {
					if ((dream.notes || '').match(regex)) {
						arrFound.push({
							entryDate: entry.entryDate,
							dream: dream,
						})
					}
				} else if (this.state.searchOptScope == SearchScopes.signs) {
					if (
						Array.isArray(dream.dreamSigns) &&
						dream.dreamSigns.filter(sign => {
							return sign.match(regex)
						}).length > 0
					) {
						arrFound.push({
							entryDate: entry.entryDate,
							dream: dream,
						})
					}
				} else if (this.state.searchOptScope == SearchScopes.title) {
					if ((dream.title || '').match(regex)) {
						arrFound.push({
							entryDate: entry.entryDate,
							dream: dream,
						})
					}
				}
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
		let parts = []
		try {
			if (this.state.searchOptMatchType == SearchMatchTypes.contains)
				parts = text.split(new RegExp('(' + highlight + ')', 'gi'))
			else if (this.state.searchOptMatchType == SearchMatchTypes.whole)
				parts = text.split(new RegExp('\\b(' + highlight + ')\\b', 'gi'))
			else if (this.state.searchOptMatchType == SearchMatchTypes.starts)
				parts = text.split(new RegExp('\\b(' + highlight + ')', 'gi'))
		} catch (ex) {
			//this.setState({ searchTermInvalidMsg: ex }) // TODO: FIXME: cannot set state bc were called inside `render()` !!
			console.warn(ex)
		}
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
							<h5 className='card-header'>
								<a
									href='javascript:void(0)'
									title='View Entry'
									className='card-link'
									data-entry-key={entry.entryDate}
									onClick={this.handleEntryEdit}>
									{entry.dream.title}
								</a>
							</h5>
							{this.state.searchOptScope == SearchScopes.all ||
							this.state.searchOptScope == SearchScopes.notes ? (
								<div className='card-body'>
									<p className='card-text' style={{ whiteSpace: 'pre-line' }}>
										{this.getHighlightedText(entry.dream.notes, this.state.searchTerm)}
									</p>
								</div>
							) : (
								''
							)}
							<div className='card-footer text-muted'>
								{this.state.searchOptScope == SearchScopes.all ||
								this.state.searchOptScope == SearchScopes.signs ? (
									<div>
										{entry.dream.dreamSigns && Array.isArray(entry.dream.dreamSigns)
											? entry.dream.dreamSigns.map((sign, idx) => {
													return (
														<div
															className='badge badge-info text-lowercase p-2 mr-2 mb-2'
															key={'sign' + idx}>
															{sign}
														</div>
													)
											  })
											: ''}
									</div>
								) : (
									''
								)}
								<small>{new Date(entry.entryDate).toLocaleDateString()}</small>
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
						<div className='col-12 col-md-8'>
							<div className='card'>
								<div className='card-header bg-info'>
									<h5 className='card-title text-white mb-0'>Search</h5>
								</div>
								<div className='card-body bg-light p-4'>
									<div className='row align-items-center'>
										<div className='col-auto'>
											<div className='iconSvg size32 search' />
										</div>
										<div className='col-auto'>
											<select
												className='form-control'
												defaultValue={this.state.searchOptMatchType}
												onChange={this.handleTypeChange}>
												{Object.keys(SearchMatchTypes).map(val => {
													return (
														<option value={SearchMatchTypes[val]} key={'enum' + val}>
															{SearchMatchTypes[val]}
														</option>
													)
												})}
											</select>
										</div>
										<div className='col'>
											<input
												type='text'
												value={this.state.searchTerm}
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
											<div
												className={
													this.state.searchTermInvalidMsg
														? 'invalid-feedback d-block'
														: 'invalid-feedback'
												}>
												{this.state.searchTermInvalidMsg}
											</div>
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
						<div className='col-12 col-md-4'>
							<div className='card'>
								<div className='card-header bg-secondary'>
									<h5 className='card-title text-white mb-0'>Options</h5>
								</div>
								<div className='card-body bg-light p-4'>
									<div className='row align-items-center no-gutters'>
										<div className='col-auto'>
											<label className='text-uppercase text-muted mb-0 mr-3'>Search Fields</label>
										</div>
										<div className='col'>
											<select
												className='form-control'
												defaultValue={this.state.searchOptScope}
												onChange={this.handleScopeChange}>
												{Object.keys(SearchScopes).map(val => {
													return (
														<option value={SearchScopes[val]} key={'enum' + val}>
															{SearchScopes[val]}
														</option>
													)
												})}
											</select>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className='container bg-light my-5'>
					{this.state.searchTerm && this.state.searchMatches.length > 0 ? (
						<h5 className='text-info pt-3 ml-3 my-3'>
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
						<h4 className='text-center text-muted mb-0 py-5'>(enter a keyword above to search)</h4>
					)}
				</div>
			</div>
		)
	}
}
