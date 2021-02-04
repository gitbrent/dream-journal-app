import React, { useState, useEffect } from 'react'
import { IDriveFile, ISearchMatch, SearchMatchTypes, SearchScopes } from './app.types'
import Alert from 'react-bootstrap/Alert'
import SearchResults from './comp-app/search-results'

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

export default function TabSearch(props: IAppSearchProps) {
	let localShowAlert = JSON.parse(localStorage.getItem('show-alert-search'))

	const [searchMatches, setSearchMatches] = useState(props.searchState && props.searchState['searchMatches'] ? props.searchState['searchMatches'] : [])
	const [searchOptMatchType, setSearchOptMatchType] = useState(
		props.searchState && props.searchState['searchOptMatchType'] ? props.searchState['searchOptMatchType'] : SearchMatchTypes.whole
	)
	const [searchOptScope, setSearchOptScope] = useState(props.searchState && props.searchState['searchOptScope'] ? props.searchState['searchOptScope'] : SearchScopes.all)
	const [searchTerm, setSearchTerm] = useState(props.searchState && props.searchState['searchTerm'] ? props.searchState['searchTerm'] : '')
	const [searchTermInvalidMsg, setSearchTermInvalidMsg] = useState(
		props.searchState && props.searchState['searchTermInvalidMsg'] ? props.searchState['searchTermInvalidMsg'] : ''
	)
	const [showAlert, setShowAlert] = useState(typeof localShowAlert === 'boolean' ? localShowAlert : true)

	// Push state up whenever it changes
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

	function handleHideAlert() {
		localStorage.setItem('show-alert-search', 'false')
		setShowAlert(false)
	}

	function getTotalMonths(): number {
		if (!props.dataFile || (props.dataFile.entries || []).length === 0) return 0

		let d1 = new Date(props.dataFile.entries.sort((a, b) => ((a.entryDate || 'zzz') < (b.entryDate || 'zzz') ? -1 : 1))[0].entryDate)
		let d2 = new Date(props.dataFile.entries.sort((a, b) => ((a.entryDate || '000') > (b.entryDate || '000') ? -1 : 1))[0].entryDate)

		let months: number
		months = (d2.getFullYear() - d1.getFullYear()) * 12
		months -= d1.getMonth() + 1
		months += d2.getMonth()
		months += 2 // include both first and last months

		return months <= 0 ? 0 : months
	}
	function getYearSpan(): number {
		if (!props.dataFile || (props.dataFile.entries || []).length === 0) return 0

		let d1 = new Date(props.dataFile.entries.sort((a, b) => ((a.entryDate || 'zzz') < (b.entryDate || 'zzz') ? -1 : 1))[0].entryDate)
		let d2 = new Date(props.dataFile.entries.sort((a, b) => ((a.entryDate || '000') > (b.entryDate || '000') ? -1 : 1))[0].entryDate)

		return d2.getFullYear() - d1.getFullYear() + 1
	}

	function handleEntryEdit(entryDate: string) {
		props.onShowModal({
			show: true,
			editEntry: props.dataFile.entries.filter(entry => entry.entryDate === entryDate)[0],
		})
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

	function doKeywordSearch() {
		let arrFound = []
		let regex = new RegExp(searchTerm, 'gi') // SearchMatchTypes.contains
		if (searchOptMatchType === SearchMatchTypes.whole) regex = new RegExp('\\b' + searchTerm + '\\b', 'gi')
		else if (searchOptMatchType === SearchMatchTypes.starts) regex = new RegExp('\\b' + searchTerm, 'gi')
		if (!props.dataFile || props.dataFile.entries.length <= 0) return

		props.dataFile.entries.forEach(entry => {
			;(entry.dreams || []).forEach(dream => {
				if (searchOptScope === SearchScopes.all) {
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
				} else if (searchOptScope === SearchScopes.notes) {
					if ((dream.notes || '').match(regex)) {
						arrFound.push({
							entryDate: entry.entryDate,
							starred: entry.starred,
							dream: dream,
						})
					}
				} else if (searchOptScope === SearchScopes.signs) {
					if (Array.isArray(dream.dreamSigns) && dream.dreamSigns.filter(sign => sign.match(regex)).length > 0) {
						arrFound.push({
							entryDate: entry.entryDate,
							starred: entry.starred,
							dream: dream,
						})
					}
				} else if (searchOptScope === SearchScopes.title) {
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

		setSearchMatches(arrFound)
	}

	function doShowByType(type: SearchScopes) {
		let arrFound = []

		if (!props.dataFile || props.dataFile.entries.length <= 0) return

		if (type === SearchScopes._starred) {
			props.dataFile.entries
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
			props.dataFile.entries.forEach(entry => {
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

		setSearchMatches(arrFound)
	}

	let totalDreams = 0
	let totalLucids = 0
	let totalStarred = 0

	if (props.dataFile && props.dataFile.entries) {
		props.dataFile.entries.forEach(entry => {
			if (entry.starred) totalStarred++
			totalDreams += entry.dreams.length
			totalLucids += entry.dreams.filter(dream => dream.isLucidDream).length
		})
	}

	return (
		<div>
			<header className='container my-5'>
				{showAlert && (
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
							<button className='btn btn-light' onClick={handleHideAlert}>
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
								<h1 className='text-primary mb-1 x3'>{getTotalMonths() || '-'}</h1>
								<label className='text-primary text-uppercase'>Months</label>
								<div className='badge badge-pill badge-primary w-100'>{getYearSpan() + ' years'}</div>
							</div>
							<div className='col-auto text-center'>
								<h1 className='text-primary mb-1 x3'>{props.dataFile && props.dataFile.entries ? props.dataFile.entries.length : '-'}</h1>
								<label className='text-primary text-uppercase'>Days</label>
								<div className='badge badge-pill badge-primary w-100'>
									{getTotalMonths() * 30 > 0 && props.dataFile && props.dataFile.entries
										? (props.dataFile.entries.length / getTotalMonths()).toFixed(2) + ' / mon'
										: '-'}
								</div>
							</div>
							<div className='col-auto text-center'>
								<h1 className='text-info mb-1 x3'>{totalDreams || '-'}</h1>
								<label className='text-info text-uppercase d-block'>Dreams</label>
								<div className='badge badge-pill badge-info w-100'>
									{getTotalMonths() * 30 > 0 && props.dataFile && props.dataFile.entries
										? (totalDreams / props.dataFile.entries.length).toFixed(2) + ' / day'
										: '-'}
								</div>
							</div>
							<div className='w-100 mb-3 d-md-none mb-md-0' />
							<div className='col-auto text-center' onClick={() => doShowByType(SearchScopes._starred)}>
								<h1 className='text-warning mb-1 x3'>{totalStarred || '-'}</h1>
								<label className='text-warning text-uppercase d-block'>Starred</label>
								<div className='badge badge-pill badge-warning w-100'>
									{totalDreams && totalStarred ? ((totalStarred / totalDreams) * 100).toFixed(2) + '%' : '-'}
								</div>
							</div>
							<div className='col-auto text-center' onClick={() => doShowByType(SearchScopes._isLucid)}>
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
											value={searchTerm}
											className='form-control'
											onKeyPress={event => (event.key === 'Enter' ? doKeywordSearch() : null)}
											onChange={event => {
												setSearchTerm(event.target.value)
												if (!event.target.value) setSearchMatches([])
											}}
											disabled={!props.dataFile ? true : false}
										/>
										<div className={searchTermInvalidMsg ? 'invalid-feedback d-block' : 'invalid-feedback'}>{searchTermInvalidMsg}</div>
									</div>
									<div className='w-100 mb-3 d-md-none' />
									<div className='col-12 col-md-auto'>
										<button type='button' className='btn btn-outline-primary w-100' onClick={doKeywordSearch} disabled={!props.dataFile ? true : false}>
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
										<select className='form-control' defaultValue={searchOptScope} onChange={handleScopeChange}>
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
										<select className='form-control' defaultValue={searchOptMatchType} onChange={handleTypeChange}>
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

			{searchTerm ? (
				<SearchResults
					handleEntryEdit={handleEntryEdit}
					searchMatches={searchMatches}
					searchOptScope={searchOptScope}
					searchOptMatchType={searchOptMatchType}
					searchTerm={searchTerm}
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
