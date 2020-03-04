import React from 'react'
import { IDriveFile, ISearchMatch, SearchMatchTypes, SearchScopes } from './app.types'
import Alert from 'react-bootstrap/Alert'
import SearchResults from './components/search-results'

export interface IAppSearchProps {
	dataFile: IDriveFile
	doSaveSearchState: Function
	onShowModal: Function
	searchState: IAppSearchState
}
export interface IAppSearchState {
	searchMatches: ISearchMatch[]
	searchOptMatchType: SearchMatchTypes
	searchOptScope: SearchScopes
	searchTerm: string
	searchTermInvalidMsg: string
	showAlert: boolean
}

export default class TabSearch extends React.Component<IAppSearchProps, IAppSearchState> {
	constructor(props: Readonly<IAppSearchProps>) {
		super(props)

		let localShowAlert = JSON.parse(localStorage.getItem('show-alert-search'))

		this.state = {
			searchOptMatchType: this.props.searchState && this.props.searchState['searchOptMatchType'] ? this.props.searchState['searchOptMatchType'] : SearchMatchTypes.whole,
			searchOptScope: this.props.searchState && this.props.searchState['searchOptScope'] ? this.props.searchState['searchOptScope'] : SearchScopes.all,
			searchMatches: this.props.searchState && this.props.searchState['searchMatches'] ? this.props.searchState['searchMatches'] : [],
			searchTerm: this.props.searchState && this.props.searchState['searchTerm'] ? this.props.searchState['searchTerm'] : '',
			searchTermInvalidMsg: this.props.searchState && this.props.searchState['searchTermInvalidMsg'] ? this.props.searchState['searchTermInvalidMsg'] : '',
			showAlert: typeof localShowAlert === 'boolean' ? localShowAlert : true,
		}
	}

	/**
	 * this constructor is called whenever tab is hidden/shown, so state must be preserved by parent (lifting state up)
	 */
	componentWillUnmount = () => {
		this.props.doSaveSearchState(this.state)
	}

	handleHideAlert = () => {
		localStorage.setItem('show-alert-search', 'false')
		this.setState({ showAlert: false })
	}

	getTotalMonths = (): number => {
		if (!this.props.dataFile || (this.props.dataFile.entries || []).length === 0) return 0

		let d1 = new Date(this.props.dataFile.entries.sort((a, b) => ((a.entryDate || 'zzz') < (b.entryDate || 'zzz') ? -1 : 1))[0].entryDate)
		let d2 = new Date(this.props.dataFile.entries.sort((a, b) => ((a.entryDate || '000') > (b.entryDate || '000') ? -1 : 1))[0].entryDate)

		let months: number
		months = (d2.getFullYear() - d1.getFullYear()) * 12
		months -= d1.getMonth() + 1
		months += d2.getMonth()
		months += 2 // include both first and last months

		return months <= 0 ? 0 : months
	}
	getYearSpan = (): number => {
		if (!this.props.dataFile || (this.props.dataFile.entries || []).length === 0) return 0

		let d1 = new Date(this.props.dataFile.entries.sort((a, b) => ((a.entryDate || 'zzz') < (b.entryDate || 'zzz') ? -1 : 1))[0].entryDate)
		let d2 = new Date(this.props.dataFile.entries.sort((a, b) => ((a.entryDate || '000') > (b.entryDate || '000') ? -1 : 1))[0].entryDate)

		return d2.getFullYear() - d1.getFullYear() + 1
	}

	handleEntryEdit = (entryDate: string) => {
		this.props.onShowModal({
			show: true,
			editEntry: this.props.dataFile.entries.filter(entry => entry.entryDate === entryDate)[0],
		})
	}

	handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		let newState = { searchOptMatchType: null }

		if (event.target.value === SearchMatchTypes.contains) newState.searchOptMatchType = SearchMatchTypes.contains
		else if (event.target.value === SearchMatchTypes.starts) newState.searchOptMatchType = SearchMatchTypes.starts
		else if (event.target.value === SearchMatchTypes.whole) newState.searchOptMatchType = SearchMatchTypes.whole
		this.setState(newState)

		setTimeout(this.doKeywordSearch, 100) // TODO: no use, state change
	}
	handleScopeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		let newState = { searchOptScope: null }

		if (event.target.value === SearchScopes.all) newState.searchOptScope = SearchScopes.all
		else if (event.target.value === SearchScopes.notes) newState.searchOptScope = SearchScopes.notes
		else if (event.target.value === SearchScopes.signs) newState.searchOptScope = SearchScopes.signs
		else if (event.target.value === SearchScopes.title) newState.searchOptScope = SearchScopes.title
		this.setState(newState)

		setTimeout(this.doKeywordSearch, 100) // TODO: no use, state change
	}

	doKeywordSearch = () => {
		let arrFound = []
		let regex = new RegExp(this.state.searchTerm, 'gi') // SearchMatchTypes.contains
		if (this.state.searchOptMatchType === SearchMatchTypes.whole) regex = new RegExp('\\b' + this.state.searchTerm + '\\b', 'gi')
		else if (this.state.searchOptMatchType === SearchMatchTypes.starts) regex = new RegExp('\\b' + this.state.searchTerm, 'gi')
		if (!this.props.dataFile || this.props.dataFile.entries.length <= 0) return

		this.props.dataFile.entries.forEach(entry => {
			;(entry.dreams || []).forEach(dream => {
				if (this.state.searchOptScope === SearchScopes.all) {
					if (
						(dream.notes || '').match(regex) ||
						(dream.title || '').match(regex) ||
						(Array.isArray(dream.dreamSigns) && dream.dreamSigns.filter(sign => sign.match(regex)).length > 0)
					) {
						arrFound.push({
							entryDate: entry.entryDate,
							starred: entry.starred,
							dream: dream,
						})
					}
				} else if (this.state.searchOptScope === SearchScopes.notes) {
					if ((dream.notes || '').match(regex)) {
						arrFound.push({
							entryDate: entry.entryDate,
							starred: entry.starred,
							dream: dream,
						})
					}
				} else if (this.state.searchOptScope === SearchScopes.signs) {
					if (Array.isArray(dream.dreamSigns) && dream.dreamSigns.filter(sign => sign.match(regex)).length > 0) {
						arrFound.push({
							entryDate: entry.entryDate,
							starred: entry.starred,
							dream: dream,
						})
					}
				} else if (this.state.searchOptScope === SearchScopes.title) {
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

	doShowByType = (type: SearchScopes) => {
		let arrFound = []

		if (!this.props.dataFile || this.props.dataFile.entries.length <= 0) return

		if (type === SearchScopes._starred) {
			this.props.dataFile.entries
				.filter(entry => entry.starred)
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

	render() {
		let totalDreams = 0
		let totalLucids = 0
		let totalStarred = 0

		if (this.props.dataFile && this.props.dataFile.entries) {
			this.props.dataFile.entries.forEach(entry => {
				if (entry.starred) totalStarred++
				totalDreams += entry.dreams.length
				totalLucids += entry.dreams.filter(dream => dream.isLucidDream).length
			})
		}

		return (
			<div>
				<header className='container my-5'>
					{this.state.showAlert && (
						<Alert variant='secondary'>
							<Alert.Heading>Make good use of your Dream Journal</Alert.Heading>
							<p>Analyze your journal to learn more about yourself, spot common themes/dreamsigns and improve your lucid dreaming ability.</p>
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
					)}
					<div className='card my-5'>
						<div className='card-header bg-primary'>
							<h5 className='card-title text-white mb-0'>Dream Journal Analysis</h5>
						</div>
						<div className='card-body bg-light'>
							<div className='row align-items-start justify-content-around'>
								<div className='col-auto text-center d-none d-md-block'>
									<h1 className='text-primary mb-1 x3'>{this.getTotalMonths() || '-'}</h1>
									<label className='text-primary text-uppercase'>Months</label>
									<div className='badge badge-pill badge-primary w-100'>{this.getYearSpan() + ' years'}</div>
								</div>
								<div className='col-auto text-center'>
									<h1 className='text-primary mb-1 x3'>{this.props.dataFile && this.props.dataFile.entries ? this.props.dataFile.entries.length : '-'}</h1>
									<label className='text-primary text-uppercase'>Days</label>
									<div className='badge badge-pill badge-primary w-100'>
										{this.getTotalMonths() * 30 > 0 && this.props.dataFile && this.props.dataFile.entries
											? (this.props.dataFile.entries.length / this.getTotalMonths()).toFixed(2) + ' / mon'
											: '-'}
									</div>
								</div>
								<div className='col-auto text-center'>
									<h1 className='text-info mb-1 x3'>{totalDreams || '-'}</h1>
									<label className='text-info text-uppercase d-block'>Dreams</label>
									<div className='badge badge-pill badge-info w-100'>
										{this.getTotalMonths() * 30 > 0 && this.props.dataFile && this.props.dataFile.entries
											? (totalDreams / this.props.dataFile.entries.length).toFixed(2) + ' / day'
											: '-'}
									</div>
								</div>
								<div className='w-100 mb-3 d-md-none mb-md-0' />
								<div className='col-auto text-center' onClick={() => this.doShowByType(SearchScopes._starred)}>
									<h1 className='text-warning mb-1 x3'>{totalStarred || '-'}</h1>
									<label className='text-warning text-uppercase d-block'>Starred</label>
									<div className='badge badge-pill badge-warning w-100'>
										{totalDreams && totalStarred ? ((totalStarred / totalDreams) * 100).toFixed(2) + '%' : '-'}
									</div>
								</div>
								<div className='col-auto text-center' onClick={() => this.doShowByType(SearchScopes._isLucid)}>
									<h1 className='text-success mb-1 x3'>{totalLucids || '-'}</h1>
									<label className='text-success text-uppercase d-block'>Lucids</label>
									<div className='badge badge-pill badge-success w-100'>
										{totalDreams && totalLucids ? ((totalLucids / totalDreams) * 100).toFixed(2) + '%' : '-'}
									</div>
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
													if (event.key === 'Enter') this.doKeywordSearch()
												}}
												onChange={event => {
													this.setState({ searchTerm: event.target.value })
													if (!event.target.value) this.setState({ searchMatches: [] })
												}}
												disabled={!this.props.dataFile ? true : false}
											/>
											<div className={this.state.searchTermInvalidMsg ? 'invalid-feedback d-block' : 'invalid-feedback'}>
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
											<select className='form-control' defaultValue={this.state.searchOptScope} onChange={this.handleScopeChange}>
												{Object.keys(SearchScopes)
													.filter(key => key.indexOf('_') === -1)
													.map(val => (
														<option value={SearchScopes[val]} key={'enum' + val}>
															{SearchScopes[val]}
														</option>
													))}
											</select>
										</div>
										<div className='col-12 col-md-6'>
											<label className='text-uppercase text-muted'>Type</label>
											<select className='form-control' defaultValue={this.state.searchOptMatchType} onChange={this.handleTypeChange}>
												{Object.keys(SearchMatchTypes).map(val => (
													<option value={SearchMatchTypes[val]} key={'enum' + val}>
														{SearchMatchTypes[val]}
													</option>
												))}
											</select>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{this.state.searchTerm ? (
					<SearchResults
						handleEntryEdit={this.handleEntryEdit}
						searchMatches={this.state.searchMatches}
						searchOptScope={this.state.searchOptScope}
						searchOptMatchType={this.state.searchOptMatchType}
						searchTerm={this.state.searchTerm}
						totalDreams={totalDreams}
					/>
				) : (
					<div className='container'>
						<h4 className='bg-light text-center text-muted mb-0 py-5'>(enter a keyword above to search)</h4>
					</div>
				)}
			</div>
		)
	}
}
