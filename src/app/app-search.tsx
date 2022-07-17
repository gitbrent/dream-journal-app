import React, { useState, useEffect } from 'react'
import { IDriveDataFile, IJournalEntry, ISearchMatch, MetaType, SearchMatchTypes, SearchScopes } from './app.types'
import { Search } from 'react-bootstrap-icons'
import SearchResults from './components/search-results'
import HeaderMetrics from './components/header-metrics'
import AlertGdriveStatus from './components/alert-gstat'
import ModalEntry from './modal-entry'

export interface Props {
	dataFile: IDriveDataFile
	isBusyLoad: boolean
	doSaveSearchState: Function
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

export default function TabSearch(props: Props) {
	const localShowAlert = JSON.parse(localStorage.getItem('show-alert-search'))
	//
	const [showModal, setShowModal] = useState(false)
	const [currEntry, setCurrEntry] = useState<IJournalEntry>(null)
	const [currDreamIdx, setDreamIdx] = useState(0)
	//
	const [showAlert, setShowAlert] = useState(typeof localShowAlert === 'boolean' ? localShowAlert : true)
	const [totalDreams, setTotalDreams] = useState(0)
	const [searchMatches, setSearchMatches] = useState(props.searchState && props.searchState['searchMatches'] ? props.searchState['searchMatches'] : [])
	const [searchOptScope, setSearchOptScope] = useState(props.searchState && props.searchState['searchOptScope'] ? props.searchState['searchOptScope'] : SearchScopes.all)
	const [searchTerm, setSearchTerm] = useState(props.searchState && props.searchState['searchTerm'] ? props.searchState['searchTerm'] : '')
	const [searchTermInvalidMsg, setSearchTermInvalidMsg] = useState(
		props.searchState && props.searchState['searchTermInvalidMsg'] ? props.searchState['searchTermInvalidMsg'] : ''
	)
	const [searchOptMatchType, setSearchOptMatchType] = useState(
		props.searchState && props.searchState['searchOptMatchType'] ? props.searchState['searchOptMatchType'] : SearchMatchTypes.whole
	)

	/** Push state up whenever it changes */
	useEffect(() => {
		props.doSaveSearchState({
			searchMatches: searchMatches,
			searchOptMatchType: searchOptMatchType,
			searchOptScope: searchOptScope,
			searchTerm: searchTerm,
			searchTermInvalidMsg: searchTermInvalidMsg,
			showAlert: false,
		})
	}, [searchMatches, searchOptMatchType, searchOptScope, searchTerm, searchTermInvalidMsg, showAlert])

	// ------------------------------------------------------------------------

	function handleHideAlert() {
		localStorage.setItem('show-alert-search', 'false')
		setShowAlert(false)
	}

	function handleTypeChange(event: React.ChangeEvent<HTMLSelectElement>) {
		if (event.target.value === SearchMatchTypes.contains) setSearchOptMatchType(SearchMatchTypes.contains)
		else if (event.target.value === SearchMatchTypes.starts) setSearchOptMatchType(SearchMatchTypes.starts)
		else if (event.target.value === SearchMatchTypes.whole) setSearchOptMatchType(SearchMatchTypes.whole)
	}

	function handleScopeChange(event: React.ChangeEvent<HTMLSelectElement>) {
		if (event.target.value === SearchScopes.all) setSearchOptScope(SearchScopes.all)
		else if (event.target.value === SearchScopes.notes) setSearchOptScope(SearchScopes.notes)
		else if (event.target.value === SearchScopes.signs) setSearchOptScope(SearchScopes.signs)
		else if (event.target.value === SearchScopes.title) setSearchOptScope(SearchScopes.title)
	}

	// ------------------------------------------------------------------------

	function doKeywordSearch() {
		let arrFound: ISearchMatch[] = []
		let regex = new RegExp(searchTerm, 'gi') // SearchMatchTypes.contains

		if (searchOptMatchType === SearchMatchTypes.whole) regex = new RegExp('\\b' + searchTerm + '\\b', 'gi')
		else if (searchOptMatchType === SearchMatchTypes.starts) regex = new RegExp('\\b' + searchTerm, 'gi')
		if (!props.dataFile || props.dataFile.entries.length <= 0) return

		props.dataFile.entries.forEach((entry) => {
			;(entry.dreams || []).forEach((dream, idx) => {
				if (searchOptScope === SearchScopes.all) {
					if (
						(dream.notes || '').match(regex) ||
						(dream.title || '').match(regex) ||
						(Array.isArray(dream.dreamSigns) && dream.dreamSigns.filter((sign) => sign.match(regex)).length > 0)
					) {
						arrFound.push({
							entry: entry,
							dreamIdx: idx,
						})
					}
				} else if (searchOptScope === SearchScopes.notes) {
					if ((dream.notes || '').match(regex)) {
						arrFound.push({
							entry: entry,
							dreamIdx: idx,
						})
					}
				} else if (searchOptScope === SearchScopes.signs) {
					if (Array.isArray(dream.dreamSigns) && dream.dreamSigns.filter((sign) => sign.match(regex)).length > 0) {
						arrFound.push({
							entry: entry,
							dreamIdx: idx,
						})
					}
				} else if (searchOptScope === SearchScopes.title) {
					if ((dream.title || '').match(regex)) {
						arrFound.push({
							entry: entry,
							dreamIdx: idx,
						})
					}
				}
			})
		})

		setSearchMatches(arrFound)
	}

	function doShowByType(type: SearchScopes) {
		let arrFound = []

		if (!props.dataFile || props.dataFile.entries.length <= 0) return

		if (type === SearchScopes._starred) {
			props.dataFile.entries
				.filter((entry) => entry.dreams.filter((dream) => dream.dreamSigns.some((tag) => tag === MetaType.star)).length > 0)
				.forEach((entry) =>
					entry.dreams.forEach((dream) => {
						arrFound.push({
							entryDate: entry.entryDate,
							starred: true,
							dream: dream,
						})
					})
				)
		} else {
			props.dataFile.entries.forEach((entry) =>
				entry.dreams.forEach((dream) => {
					if (dream.isLucidDream) {
						arrFound.push({
							entryDate: entry.entryDate,
							starred: entry.dreams.filter((dream) => dream.dreamSigns.some((tag) => tag === MetaType.star)).length > 0,
							dream: dream,
						})
					}
				})
			)
		}

		setSearchMatches(arrFound)
	}

	return !props.dataFile || !props.dataFile.entries ? (
		<AlertGdriveStatus isBusyLoad={props.isBusyLoad} />
	) : (
		<div className='container my-auto my-md-5'>
			<header>
				<ModalEntry currEntry={currEntry} currDreamIdx={currDreamIdx} showModal={showModal} setShowModal={setShowModal} />
				<HeaderMetrics dataFile={props.dataFile} isBusyLoad={props.isBusyLoad} showStats={true} />
			</header>

			{showAlert && (
				<div className='alert alert-secondary'>
					<h5>Make good use of your Dream Journal</h5>
					<p>Analyze your journal to learn more about yourself, spot common themes/dreamsigns and improve your lucid dreaming ability.</p>
					<ul>
						<li>How many lucid dreams have you had?</li>
						<li>What are your common dream signs?</li>
						<li>How many times have you dreamed about school?</li>
					</ul>
					<p>Let's find out!</p>
					<hr />
					<div className='d-flex justify-content-end'>
						<button className='btn btn-light' onClick={handleHideAlert}>
							Dismiss
						</button>
					</div>
				</div>
			)}

			<section className='my-5'>
				<div className='card'>
					<div className='card-header bg-secondary text-white'>
						<div className='row'>
							<div className='col'>
								<h5 className='mb-0'>Keyword Search</h5>
							</div>
							<div className='col-auto'>
								<h5 className='mb-0'>
									{searchMatches.length} Dreams ({((searchMatches.length / totalDreams) * 100).toFixed(1)}%)
								</h5>
							</div>
						</div>
					</div>
					<div className='card-body bg-light border-bottom border-secondary' data-desc='commandbar'>
						<div className='row align-items-center'>
							<div className='col-12 col-md-8'>
								<div className='row align-items-center g-0 mb-3 mb-md-0'>
									<div className='col-auto d-none d-md-block pe-3'>
										<Search size={48} className='text-secondary' />
									</div>
									<div className='col pe-2'>
										<label className='text-uppercase text-muted'>Keyword or Phrase</label>
										<input
											type='text'
											value={searchTerm}
											className='form-control'
											onKeyPress={(event) => (event.key === 'Enter' ? doKeywordSearch() : null)}
											onChange={(event) => {
												setSearchTerm(event.target.value)
												if (!event.target.value) setSearchMatches([])
											}}
											disabled={!props.dataFile ? true : false}
										/>
										<div className={searchTermInvalidMsg ? 'invalid-feedback d-block' : 'invalid-feedback'}>{searchTermInvalidMsg}</div>
									</div>
									<div className='col-auto'>
										<label className='text-uppercase text-muted'>&nbsp;</label>
										<button type='button' className='btn btn-outline-secondary w-100' onClick={doKeywordSearch} disabled={!props.dataFile ? true : false}>
											Search
										</button>
									</div>
								</div>
							</div>
							<div className='col-6 col-md'>
								<label className='text-uppercase text-muted'>Fields</label>
								<select className='form-control' defaultValue={searchOptScope} onChange={handleScopeChange}>
									{Object.keys(SearchScopes)
										.filter((key) => key.indexOf('_') === -1)
										.map((val) => (
											<option value={SearchScopes[val]} key={'enum' + val}>
												{SearchScopes[val]}
											</option>
										))}
								</select>
							</div>
							<div className='col-6 col-md'>
								<label className='text-uppercase text-muted'>Type</label>
								<select className='form-control' defaultValue={searchOptMatchType} onChange={handleTypeChange}>
									{Object.keys(SearchMatchTypes).map((val) => (
										<option value={SearchMatchTypes[val]} key={'enum' + val}>
											{SearchMatchTypes[val]}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>
					<div className='card-body bg-light p-4' data-desc='search cards'>
						<div
							className={`row ${
								searchOptScope === SearchScopes.all || searchOptScope === SearchScopes.notes ? 'row-cols-1 row-cols-md-2' : 'row-cols-2 row-cols-md-4'
							} g-4 justify-content-between`}>
							{searchMatches ? (
								searchMatches.map((match, idx) => (
									<SearchResults
										key={`match${idx}`}
										setCurrEntry={(entry: IJournalEntry) => setCurrEntry(entry)}
										setDreamIdx={(index: number) => setDreamIdx(index)}
										setShowModal={(show: boolean) => setShowModal(show)}
										searchMatch={match}
										searchTerm={searchTerm}
										searchOptScope={searchOptScope}
										searchOptMatchType={searchOptMatchType}
									/>
								))
							) : (
								<div className='container'>
									<h4 className='bg-light text-center text-muted mb-0 py-5'>(enter a keyword above to search)</h4>
								</div>
							)}
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}
