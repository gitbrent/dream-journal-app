import React from 'react'
import Alert from 'react-bootstrap/Alert'
//import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import { IDriveFile, IJournalDream, IJournalEntry } from './app'

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
	_starred = 'starred',
	_isLucid = 'isLucidDream',
}

interface ISearchMatch {
	entryDate: IJournalEntry['entryDate']
	starred: IJournalEntry['starred']
	dream: IJournalDream
}

export default class TabSearch extends React.Component<
	{
		dataFile: IDriveFile
		doSaveSearchState: Function
		onShowModal: Function
		searchState: object
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
			dataFile: IDriveFile
			doSaveSearchState: Function
			onShowModal: Function
			searchState: object
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

	handleHideAlert = _event => {
		localStorage.setItem('show-alert-search', 'false')
		this.setState({ showAlert: false })
	}

	getTotalMonths = () => {
		if (!this.props.dataFile || (this.props.dataFile.entries || []).length == 0) return 0

		let d1 = new Date(this.props.dataFile.entries[0].entryDate)
		let d2 = new Date(this.props.dataFile.entries[this.props.dataFile.entries.length - 1].entryDate)
		let months
		months = (d2.getFullYear() - d1.getFullYear()) * 12
		months -= d1.getMonth() + 1
		months += d2.getMonth()
		months += 2 // include both first and last months

		return months <= 0 ? 0 : months
	}

	monthDiff = (d1, d2) => {
		let months
		months = (d2.getFullYear() - d1.getFullYear()) * 12
		months -= d1.getMonth() + 1
		months += d2.getMonth()
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
		if (!this.props.dataFile || this.props.dataFile.entries.length <= 0) return

		this.props.dataFile.entries.forEach(entry => {
			;(entry.dreams || []).forEach(dream => {
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
							starred: entry.starred,
							dream: dream,
						})
					}
				} else if (this.state.searchOptScope == SearchScopes.notes) {
					if ((dream.notes || '').match(regex)) {
						arrFound.push({
							entryDate: entry.entryDate,
							starred: entry.starred,
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
							starred: entry.starred,
							dream: dream,
						})
					}
				} else if (this.state.searchOptScope == SearchScopes.title) {
					if ((dream.title || '').match(regex)) {
						arrFound.push({
							entryDate: entry.entryDate,
							starred: entry.starred,
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

	doShowByType = type => {
		let arrFound = []

		if (!this.props.dataFile || this.props.dataFile.entries.length <= 0) return

		if (type == SearchScopes._starred) {
			this.props.dataFile.entries
				.filter(entry => {
					return entry.starred
				})
				.forEach(entry => {
					;(entry.dreams || []).forEach(dream => {
						arrFound.push({
							entryDate: entry.entryDate,
							starred: entry.starred,
							dream: dream,
						})
					})
				})
		} else {
			this.props.dataFile.entries.forEach(entry => {
				;(entry.dreams || []).forEach(dream => {
					if (dream.isLucidDream) {
						arrFound.push({
							entryDate: entry.entryDate,
							starred: entry.starred,
							dream: dream,
						})
					}
				})
			})
		}

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
			editEntry: this.props.dataFile.entries.filter(entry => {
				return entry.entryDate == e.target.getAttribute('data-entry-key')
			})[0],
		})
	}

	render() {
		let totalDreams = 0
		let totalLucids = 0
		let totalStarred = 0

		if (this.props.dataFile && this.props.dataFile.entries) {
			this.props.dataFile.entries.forEach(entry => {
				totalDreams += entry.dreams.length

				if (entry.starred) totalStarred++

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
							<div className='row'>
								<div className='col'>
									<h5 className='card-header'>
										<a
											href='javascript:void(0)'
											title='View Entry'
											className={'card-link' + (entry.dream.isLucidDream ? ' text-success' : '')}
											data-entry-key={entry.entryDate}
											onClick={this.handleEntryEdit}>
											{entry.dream.title}
										</a>
									</h5>
								</div>
								<div className='col-auto'>
									{entry.starred ? <div className='iconSvg size16 star-on mt-2 mx-2' /> : ''}
									{entry.dream.isLucidDream ? (
										<div className='iconSvg size24 circle check mt-2 mx-2' />
									) : (
										''
									)}
								</div>
							</div>
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
							<div className='card-footer text-info'>
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
								<small>
									{new Date(entry.entryDate).toLocaleDateString()}
									<span className='ml-2'>
										({this.monthDiff(new Date(entry.entryDate), new Date())} months ago)
									</span>
								</small>
							</div>
						</div>
					)
				})}
			</div>
		)

		return (
			<div>
				<header className='container my-5'>
					{this.state.showAlert ? (
						<Alert variant='secondary'>
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
							<h5 className='card-title text-white mb-0'>Dream Journal Analysis</h5>
						</div>
						<div className='card-body bg-light'>
							<div className='row align-items-center p-2'>
								<div className='col text-center d-none d-md-block'>
									<label className='text-primary text-uppercase'>Months</label>
									<h1 className='text-primary mb-0'>{this.getTotalMonths() || '-'}</h1>
									<small className='text-50-white text-uppercase'>&nbsp;</small>
								</div>
								<div className='col text-center'>
									<label className='text-primary text-uppercase'>Days</label>
									<h1 className='text-primary mb-1'>
										{this.props.dataFile && this.props.dataFile.entries
											? this.props.dataFile.entries.length
											: '-'}
									</h1>
									<small className='text-50-white text-uppercase d-none d-md-block'>
										{this.getTotalMonths() * 30 > 0 &&
										this.props.dataFile &&
										this.props.dataFile.entries
											? (this.props.dataFile.entries.length / this.getTotalMonths()).toFixed(2) +
											  ' / month'
											: '-'}
									</small>
								</div>
								<div className='col text-center'>
									<label className='text-info text-uppercase'>Dreams</label>
									<h1 className='text-info mb-1'>{totalDreams || '-'}</h1>
									<small className='text-50-white text-uppercase d-none d-md-block'>
										{this.getTotalMonths() * 30 > 0 &&
										this.props.dataFile &&
										this.props.dataFile.entries
											? (totalDreams / this.props.dataFile.entries.length).toFixed(2) + ' / day'
											: '-'}
									</small>
								</div>
								<div className='w-100 d-md-none' />
								<div
									className='col text-center'
									onClick={() => this.doShowByType(SearchScopes._starred)}>
									<label className='text-warning text-uppercase'>Starred</label>
									<h1 className='text-warning mb-1'>{totalStarred || '-'}</h1>
									<small className='text-50-white text-uppercase d-none d-md-block'>
										{totalDreams && totalStarred
											? ((totalStarred / totalDreams) * 100).toFixed(2) + '% Starred'
											: '-'}
									</small>
								</div>
								<div
									className='col text-center'
									onClick={() => this.doShowByType(SearchScopes._isLucid)}>
									<label className='text-success text-uppercase'>Lucids</label>
									<h1 className='text-success mb-1'>{totalLucids || '-'}</h1>
									<small className='text-50-white text-uppercase d-none d-md-block'>
										{totalDreams && totalLucids
											? ((totalLucids / totalDreams) * 100).toFixed(2) + '% Success'
											: '-'}
									</small>
								</div>
							</div>
						</div>
					</div>
				</header>

				<section className='container my-5'>
					<div className='row'>
						<div className='col-12 col-lg-8'>
							<div className='card mb-5 mb-lg-0'>
								<div className='card-header bg-info'>
									<h5 className='card-title text-white mb-0'>Keyword Search</h5>
								</div>
								<div className='card-body bg-light p-4'>
									<div className='row align-items-end'>
										<div className='col-auto d-none d-md-block'>
											<div className='iconSvg size48 search' />
										</div>
										<div className='col'>
											<label className='text-uppercase text-muted'>Keyword or Phrase</label>
											<input
												type='text'
												value={this.state.searchTerm}
												className='form-control'
												onKeyPress={event => {
													if (event.key == 'Enter') this.doKeywordSearch()
												}}
												onChange={event => {
													this.setState({ searchTerm: event.target.value })
													if (!event.target.value) this.setState({ searchMatches: [] })
												}}
												disabled={!this.props.dataFile ? true : false}
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
										<div className='w-100 mb-3 d-md-none' />
										<div className='col-12 col-md-auto'>
											<button
												type='button'
												className='btn btn-outline-primary w-100'
												onClick={this.doKeywordSearch}
												disabled={!this.props.dataFile ? true : false}>
												Search
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className='col-12 col-lg-4'>
							<div className='card'>
								<div className='card-header bg-secondary'>
									<h5 className='card-title text-white mb-0'>Search Options</h5>
								</div>
								<div className='card-body bg-light p-4'>
									<div className='row align-items-center'>
										<div className='col-12 col-md-6'>
											<label className='text-uppercase text-muted'>Fields</label>
											<select
												className='form-control'
												defaultValue={this.state.searchOptScope}
												onChange={this.handleScopeChange}>
												{Object.keys(SearchScopes)
													.filter(key => {
														return key.indexOf('_') == -1
													})
													.map(val => {
														return (
															<option value={SearchScopes[val]} key={'enum' + val}>
																{SearchScopes[val]}
															</option>
														)
													})}
											</select>
										</div>
										<div className='col-12 col-md-6'>
											<label className='text-uppercase text-muted'>Type</label>
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
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<main className='container my-5'>
					{this.state.searchTerm && this.state.searchMatches.length > 0 ? (
						<h3 className='text-center text-primary pt-0 pb-3 mb-3'>
							Search Results: {this.state.searchMatches.length} Dreams (
							{Math.round((this.state.searchMatches.length / totalDreams) * 100)}
							%)
						</h3>
					) : (
						''
					)}
					{this.state.searchTerm ? (
						<div className='card-columns'>{searchMatches}</div>
					) : (
						<h4 className='bg-light text-center text-muted mb-0 py-5'>(enter a keyword above to search)</h4>
					)}
				</main>
			</div>
		)
	}
}
