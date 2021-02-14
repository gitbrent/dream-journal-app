import React, { useState, useEffect } from 'react'
import { CardDreamSignGrpViewType, IDreamSignTagGroup, IDriveFile, IJournalEntry } from './app.types'
import { InfoCircle, Search } from 'react-bootstrap-icons'
import * as GDrive from './google-oauth'
import DreamSignTag from './comp-app/dreamsign-tag'
import AlertGdriveStatus from './comp-app/alert-gstat'

export interface IAppAdminProps {
	dataFile: IDriveFile
	onShowModal: Function
	doSaveAdminState: Function
	adminState: IAppAdminState
}
export interface IAppAdminState {
	searchDone: boolean
	/*
	searchMatches: ISearchMatch[]
	searchOptMatchType: SearchMatchTypes
	searchOptScope: SearchScopes
	searchTerm: string
	searchTermInvalidMsg: string
	showAlert: boolean
	*/
}

enum FilterSortOrder {
	title = 'Title',
	highlow = 'High → Low',
	lowhigh = 'Low → High',
}

export default function TabAdmin(props: IAppAdminProps) {
	const [totalMonths, setTotalMonths] = useState(0)
	const [totalYears, setTotalYears] = useState(0)
	const [totalEntries, setTotalEntries] = useState(0)
	const [totalDreams, setTotalDreams] = useState(0)
	const [totalStars, setTotalStars] = useState(0)
	const [totalLucid, setTotalLucid] = useState(0)
	const [totalUntagged, setTotalUntagged] = useState(0)
	const [totalDreamSigns, setTotalDreamSigns] = useState(0)
	//
	const [dreamTagGroups, setDreamTagGroups] = useState<IDreamSignTagGroup[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [filterViewType, setFilterViewType] = useState<CardDreamSignGrpViewType>(CardDreamSignGrpViewType.md)
	const [filterSortOrder, setFilterSortOrder] = useState<FilterSortOrder>(FilterSortOrder.title)
	//
	const [dupeDreamSigns, setDupeDreamSigns] = useState<IJournalEntry[]>([])
	const [badBedTimes, setBadBedTimes] = useState<IJournalEntry[]>([])

	useEffect(() => {
		if (!props.dataFile || !props.dataFile.entries) return

		// Total: Months
		{
			let d1 = new Date(props.dataFile.entries.sort((a, b) => ((a.entryDate || 'zzz') < (b.entryDate || 'zzz') ? -1 : 1))[0].entryDate)
			let d2 = new Date(props.dataFile.entries.sort((a, b) => ((a.entryDate || '000') > (b.entryDate || '000') ? -1 : 1))[0].entryDate)
			let months: number
			months = (d2.getFullYear() - d1.getFullYear()) * 12
			months -= d1.getMonth() + 1
			months += d2.getMonth()
			months += 2 // include both first and last months
			setTotalMonths(months <= 0 ? 0 : months)
		}

		// Total: Years
		{
			let d1 = new Date(props.dataFile.entries.sort((a, b) => ((a.entryDate || 'zzz') < (b.entryDate || 'zzz') ? -1 : 1))[0].entryDate)
			let d2 = new Date(props.dataFile.entries.sort((a, b) => ((a.entryDate || '000') > (b.entryDate || '000') ? -1 : 1))[0].entryDate)
			setTotalYears(d2.getFullYear() - d1.getFullYear() + 1)
		}

		// Total: all metrics
		{
			setTotalEntries(props.dataFile.entries.length)
			setTotalDreams(props.dataFile.entries.map((entry) => entry.dreams.length).reduce((a, b) => a + b))
			setTotalStars(props.dataFile.entries.filter((entry) => entry.starred).length)
			setTotalLucid(props.dataFile.entries.map((entry) => entry.dreams.filter((dream) => dream.isLucidDream).length).reduce((a, b) => a + b))
			setTotalUntagged(props.dataFile.entries.map((entry) => entry.dreams.filter((dream) => dream.dreamSigns.length === 0).length).reduce((a, b) => a + b))
		}

		// Tag Groups /&/ dupe tags /&/ bad bedTime
		{
			let tagGroups: IDreamSignTagGroup[] = []
			let dupeSigns: IJournalEntry[] = []
			let bedTimes: IJournalEntry[] = []

			props.dataFile.entries
				.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
				.forEach((entry) => {
					entry.dreams.forEach((dream) =>
						dream.dreamSigns.forEach((sign) => {
							let tag = tagGroups.filter((tag) => tag.dreamSign === sign)[0]
							if (tag) {
								let existingEntry = tag.dailyEntries.filter((item) => item.entryDate == entry.entryDate)[0]
								if (!existingEntry) tag.dailyEntries.push(entry)
								tag.totalOccurs++
							} else {
								tagGroups.push({ dreamSign: sign, dailyEntries: [entry], totalOccurs: 1 })
							}
						})
					)

					// Find dupes
					if (
						entry.dreams &&
						entry.dreams[0] &&
						entry.dreams[0].dreamSigns.length > 0 &&
						entry.dreams[1] &&
						entry.dreams[0].dreamSigns.toString() == entry.dreams[1].dreamSigns.toString()
					) {
						dupeSigns.push(entry)
					}

					// Bad `bedTime` items
					if (!entry.bedTime || entry.bedTime.length != 5) {
						bedTimes.push(entry)
					}
				})

			// tagGroup
			setDreamTagGroups(tagGroups)
			setTotalDreamSigns(tagGroups.length)
			// dupe
			setDupeDreamSigns(dupeSigns)
			// bedtime
			setBadBedTimes(bedTimes)
		}
	}, [props.dataFile])

	// -----------------------------------------------------------------------

	function doMassUpdateTag(oldName: string, newName: string) {
		let numUpdated = 0

		props.dataFile.entries.forEach((entry) => {
			let entryCopy = JSON.parse(JSON.stringify(entry)) as IJournalEntry
			entryCopy.dreams.forEach((dream) =>
				dream.dreamSigns.forEach((sign, idx, arr) => {
					if (sign === oldName) {
						arr[idx] = newName.toLowerCase().trim()
						GDrive.doEntryEdit(entryCopy)
						numUpdated++
					}
				})
			)
		})

		GDrive.doSaveFile()
			.then(() => {
				alert(`Updated ${numUpdated} dreams`)
			})
			.catch((err) => alert(err))
	}

	function doMassUpdateBedtime() {
		badBedTimes.forEach((entry) => {
			entry.bedTime = '00:00'
			GDrive.doEntryEdit(entry, entry.entryDate)
		})

		GDrive.doSaveFile()
			.then(() => {
				alert(`Updated ${badBedTimes.length} items`)
			})
			.catch((err) => alert(err))
	}

	// -----------------------------------------------------------------------

	function renderHeader(): JSX.Element {
		return (
			<header className='my-5'>
				<div className='card'>
					<div className='card-header bg-primary'>
						<h5 className='card-title text-white mb-0'>Dream Journal Analysis</h5>
					</div>
					<div className='card-body bg-light'>
						<div className='row align-items-start justify-content-around'>
							<div className='col-auto text-center d-none d-md-block'>
								<h1 className='text-primary mb-1 x3'>{totalMonths}</h1>
								<label className='text-primary text-uppercase'>Months</label>
								<div className='badge badge-pill badge-primary w-100'>{`${totalYears} years`}</div>
							</div>
							<div className='col-auto text-center'>
								<h1 className='text-primary mb-1 x3'>{totalEntries}</h1>
								<label className='text-primary text-uppercase'>Days</label>
								<div className='badge badge-pill badge-primary w-100'>{totalMonths * 30 > 0 ? (totalEntries / totalMonths).toFixed(2) + ' / mon' : '-'}</div>
							</div>
							<div className='col-auto text-center'>
								<h1 className='text-info mb-1 x3'>{totalDreams}</h1>
								<label className='text-info text-uppercase d-block'>Dreams</label>
								<div className='badge badge-pill badge-info w-100'>{totalMonths * 30 > 0 ? (totalDreams / totalEntries).toFixed(2) + ' / day' : '-'}</div>
							</div>
							<div className='w-100 mb-3 d-md-none mb-md-0' />
							<div className='col-auto text-center'>
								<h1 className='text-warning mb-1 x3'>{totalStars}</h1>
								<label className='text-warning text-uppercase d-block'>Starred</label>
								<div className='badge badge-pill badge-warning w-100'>
									{totalDreams && totalStars ? ((totalStars / totalDreams) * 100).toFixed(2) + '%' : '-'}
								</div>
							</div>
							<div className='col-auto text-center'>
								<h1 className='text-success mb-1 x3'>{totalLucid}</h1>
								<label className='text-success text-uppercase d-block'>Lucids</label>
								<div className='badge badge-pill badge-success w-100'>
									{totalDreams && totalLucid ? ((totalLucid / totalDreams) * 100).toFixed(2) + '%' : '-'}
								</div>
							</div>
							<div className='col-auto text-center'>
								<h1 className='text-primary mb-1 x3'>{totalDreamSigns}</h1>
								<label className='text-primary text-uppercase d-block'>DreamSigns</label>
								<div className='badge badge-pill badge-primary w-100'>-</div>
							</div>
							<div className='col-auto text-center'>
								<h1 className='text-info mb-1 x3'>{totalDreams - totalUntagged}</h1>
								<label className='text-info text-uppercase d-block'>Tagged</label>
								<div className='badge badge-pill badge-info w-100'>
									{totalDreams ? (((totalDreams - totalUntagged) / totalDreams) * 100).toFixed(2) + '%' : '0%'}
								</div>
							</div>
							<div className='col-auto text-center'>
								<h1 className='text-warning mb-1 x3'>{totalUntagged || '0'}</h1>
								<label className='text-warning text-uppercase d-block'>Untagged</label>
								<div className='badge badge-pill badge-warning w-100'>{totalDreams ? ((totalUntagged / totalDreams) * 100).toFixed(2) + '%' : '0%'}</div>
							</div>
						</div>
					</div>
				</div>
			</header>
		)
	}

	function renderTagGroups(): JSX.Element {
		return (
			<section>
				<div className='row mb-3'>
					<div className='col'>
						<h5 className='text-primary'>Search DreamSigns/Tags</h5>
					</div>
					<div className='col-auto'>
						<h5 className='text-primary'>Unique Tags: {dreamTagGroups.length}</h5>
					</div>
				</div>

				<div className='row align-items-center border-top border-secondary py-3 mb-3' data-desc='commandbar'>
					<div className='col-auto d-none d-md-block'>
						<Search size={48} className='text-secondary' />
					</div>
					<div className='col-12 col-md mb-3 mb-md-0'>
						<label className='text-uppercase text-muted'>DreamSign/Tag</label>
						<input
							type='text'
							value={searchTerm}
							className='form-control'
							onChange={(event) => setSearchTerm(event.target.value)}
							disabled={!props.dataFile ? true : false}
						/>
					</div>
					<div className='col-auto'>
						<label className='text-uppercase text-muted'>Display</label>
						<select
							defaultValue={filterViewType}
							onChange={(ev) => setFilterViewType(ev.currentTarget.value as CardDreamSignGrpViewType)}
							className='form-control'>
							{Object.keys(CardDreamSignGrpViewType).map((val) => (
								<option value={CardDreamSignGrpViewType[val]} key={'viewType' + val}>
									{CardDreamSignGrpViewType[val]}
								</option>
							))}
						</select>
					</div>
					<div className='col-auto'>
						<label className='text-uppercase text-muted'>Sort Order</label>
						<select defaultValue={filterSortOrder} onChange={(ev) => setFilterSortOrder(ev.currentTarget.value as FilterSortOrder)} className='form-control'>
							{Object.keys(FilterSortOrder).map((val) => (
								<option value={FilterSortOrder[val]} key={'sortOrder' + val}>
									{FilterSortOrder[val]}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className='card-deck'>
					{dreamTagGroups
						.filter((tagGrp) => !searchTerm || tagGrp.dreamSign.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 || searchTerm.indexOf(tagGrp.dreamSign) > -1)
						.sort((a, b) => {
							if (filterSortOrder === FilterSortOrder.title) return a.dreamSign.toLowerCase() < b.dreamSign.toLowerCase() ? -1 : 1
							else if (filterSortOrder === FilterSortOrder.highlow)
								return a.totalOccurs > b.totalOccurs ? -1 : a.totalOccurs < b.totalOccurs ? 1 : a.dreamSign.toLowerCase() < b.dreamSign.toLowerCase() ? -1 : 1
							else if (filterSortOrder === FilterSortOrder.lowhigh)
								return a.totalOccurs < b.totalOccurs ? -1 : a.totalOccurs > b.totalOccurs ? 1 : a.dreamSign.toLowerCase() < b.dreamSign.toLowerCase() ? -1 : 1
						})
						.map((tagGrp, idx) => (
							<DreamSignTag key={`keyTagGrp${idx}`} tagGrp={tagGrp} viewType={filterViewType} doMassUpdateTag={doMassUpdateTag} />
						))}
				</div>
			</section>
		)
	}

	function renderDupeTags(): JSX.Element {
		return (
			<section>
				<h5 className='text-primary'>Dupe Entries (same Dream Signs across multiple dreams)</h5>

				<div className='mt-4'>
					{dupeDreamSigns.map((entry, idx) => (
						<button key={`tagDupe${idx}`} onClick={() => props.onShowModal({ show: true, editEntry: entry })} className='btn btn-sm btn-secondary mb-2 mr-2'>
							{entry.entryDate}
						</button>
					))}
				</div>
			</section>
		)
	}

	function renderBadDates(): JSX.Element {
		return (
			<section>
				<h5 className='text-primary'>
					Bad Bed Times (<code>bedTime</code> is not standard '00:00' format)
				</h5>

				<div className='mt-4'>
					{badBedTimes.map((entry, idx) => (
						<button key={`badTime${idx}`} onClick={() => props.onShowModal({ show: true, editEntry: entry })} className='btn btn-sm btn-secondary mb-2 mr-2'>
							{entry.bedTime || '(empty)'}
						</button>
					))}
					{badBedTimes.length === 0 && (
						<div className='alert alert-secondary' role='alert'>
							<InfoCircle size='16' className='mr-2' />
							No results
						</div>
					)}
				</div>

				<div className='mt-4 text-center'>
					<button className='btn btn-danger' onClick={() => doMassUpdateBedtime()} disabled={badBedTimes.length === 0}>
						Mass Update All
					</button>
				</div>
			</section>
		)
	}

	return !props.dataFile || !props.dataFile.entries ? (
		<AlertGdriveStatus />
	) : (
		<main className='container mb-5'>
			{renderHeader()}

			<ul className='nav nav-tabs nav-fill' id='adminTab' role='tablist'>
				<li className='nav-item' role='presentation'>
					<a className='nav-link active' id='search-tab' data-toggle='tab' href='#search' role='tab' aria-controls='search' aria-selected='true'>
						Rename DreamSign/Tags
					</a>
				</li>
				<li className='nav-item' role='presentation'>
					<a className='nav-link' id='dupe-tab' data-toggle='tab' href='#dupe' role='tab' aria-controls='dupe' aria-selected='false'>
						Fix Dupe Tags
					</a>
				</li>
				<li className='nav-item' role='presentation'>
					<a className='nav-link' id='bedtime-tab' data-toggle='tab' href='#bedtime' role='tab' aria-controls='bedtime' aria-selected='false'>
						Fix Bed Time
					</a>
				</li>
			</ul>
			<div className='tab-content' id='adminTabContent'>
				<div className='tab-pane show active bg-light p-4' id='search' role='tabpanel' aria-labelledby='search-tab'>
					{renderTagGroups()}
				</div>
				<div className='tab-pane bg-light p-4' id='dupe' role='tabpanel' aria-labelledby='dupe-tab'>
					{renderDupeTags()}
				</div>
				<div className='tab-pane bg-light p-4' id='bedtime' role='tabpanel' aria-labelledby='bedtime-tab'>
					{renderBadDates()}
				</div>
			</div>
		</main>
	)
}
