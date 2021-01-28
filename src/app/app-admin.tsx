import React, { useState, useEffect } from 'react'
import { IDriveFile, IJournalEntry } from './app.types'
import { Search } from 'react-bootstrap-icons'
import EntryModal from './modals/daily-entry-modal'

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

export interface IDreamSignTagGroup {
	dreamSign: string
	/** every journal entry this dreamSign appears in */
	dailyEntries: IJournalEntry[]
	/** sums the dreams under `entries` (save us time!) */
	totalOccurs: number
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
	const [dreamTagGroups, setDreamTagGroups] = useState<IDreamSignTagGroup[]>([])
	const [dupeDreamSigns, setDupeDreamSigns] = useState<IJournalEntry[]>([])

	const [searchTerm, setSearchTerm] = useState('')

	useEffect(() => {
		if (!props.dataFile || !props.dataFile.entries) return

		// METRICS
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
		{
			let d1 = new Date(props.dataFile.entries.sort((a, b) => ((a.entryDate || 'zzz') < (b.entryDate || 'zzz') ? -1 : 1))[0].entryDate)
			let d2 = new Date(props.dataFile.entries.sort((a, b) => ((a.entryDate || '000') > (b.entryDate || '000') ? -1 : 1))[0].entryDate)
			setTotalYears(d2.getFullYear() - d1.getFullYear() + 1)
		}

		setTotalEntries(props.dataFile.entries.length)
		setTotalDreams(props.dataFile.entries.map((entry) => entry.dreams.length).reduce((a, b) => a + b))
		setTotalStars(props.dataFile.entries.filter((entry) => entry.starred).length)
		setTotalLucid(props.dataFile.entries.map((entry) => entry.dreams.filter((dream) => dream.isLucidDream).length).reduce((a, b) => a + b))
		setTotalUntagged(props.dataFile.entries.map((entry) => entry.dreams.filter((dream) => dream.dreamSigns.length === 0).length).reduce((a, b) => a + b))

		// tags grouped
		let tagGroups: IDreamSignTagGroup[] = []
		let dupeSigns: IJournalEntry[] = []
		props.dataFile.entries.forEach((entry) => {
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
			)
				dupeSigns.push(entry)
		})
		setDreamTagGroups(tagGroups)
		setTotalDreamSigns(tagGroups.length)
		setDupeDreamSigns(dupeSigns)
	}, [props.dataFile])

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

	function renderFilters(): JSX.Element {
		return (
			<section className='my-5'>
				<div className='row'>
					<div className='col-12 col-lg-8'>
						<div className='card mb-5 mb-lg-0'>
							<div className='card-header bg-secondary'>
								<h5 className='card-title text-white mb-0'>Keyword Search</h5>
							</div>
							<div className='card-body bg-light p-4'>
								<div className='row align-items-center'>
									<div className='col-auto d-none d-md-block'>
										<Search size={48} className='text-secondary' />
									</div>
									<div className='col'>
										<label className='text-uppercase text-muted'>Dream Sign</label>
										<input
											type='text'
											value={searchTerm}
											className='form-control'
											onChange={(event) => setSearchTerm(event.target.value)}
											disabled={!props.dataFile ? true : false}
										/>
									</div>
									<div className='w-100 mb-3 d-md-none' />
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
										<label className='text-uppercase text-muted text-sm'>Fields</label>
										{/*
										<select className='form-control' defaultValue={searchOptScope} onChange={handleScopeChange}>
											{Object.keys(SearchScopes)
												.filter((key) => key.indexOf('_') === -1)
												.map((val) => (
													<option value={SearchScopes[val]} key={'enum' + val}>
														{SearchScopes[val]}
													</option>
												))}
										</select>
										*/}
									</div>
									<div className='col-12 col-md-6'>
										<label className='text-uppercase text-muted'>Type</label>
										{/*
										<select className='form-control' defaultValue={searchOptMatchType} onChange={handleTypeChange}>
											{Object.keys(SearchMatchTypes).map((val) => (
												<option value={SearchMatchTypes[val]} key={'enum' + val}>
													{SearchMatchTypes[val]}
												</option>
											))}
										</select>
										*/}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		)
	}

	function renderDreamSignTags(): JSX.Element {
		return (
			<div className='card my-5'>
				<div className='card-header bg-info text-white'>
					<div className='row'>
						<div className='col'>
							<h5 className='mb-0'>Dream Signs/Tags</h5>
						</div>
						<div className='col-auto'>
							<h5 className='mb-0'>{dreamTagGroups.length}</h5>
						</div>
					</div>
				</div>
				<div className='card-body bg-light'>
					<table className='table table-sm'>
						<thead>
							<tr>
								<th>DreamSign/Tag</th>
								<th>Entries</th>
								<th className='text-nowrap' style={{ width: '5%' }}>
									Total Dreams
								</th>
							</tr>
						</thead>
						<tbody>
							{dreamTagGroups
								.filter((tagGrp) => !searchTerm || tagGrp.dreamSign.indexOf(searchTerm) > -1 || searchTerm.indexOf(tagGrp.dreamSign) > -1)
								.sort((a, b) => (a.dreamSign.toLowerCase() < b.dreamSign.toLowerCase() ? -1 : 1))
								.map((tagGrp, idx) => (
									<tr key={`trTag${idx}`}>
										<td className='align-middle'>{tagGrp.dreamSign}</td>
										<td>
											{tagGrp.totalOccurs < 10 ? (
												tagGrp.dailyEntries.map((entry, idy) => (
													<button
														key={`tagLink${idy}`}
														onClick={() => props.onShowModal({ show: true, editEntry: entry })}
														className='btn btn-sm btn-dark mr-2'>
														{entry.entryDate}
													</button>
												))
											) : (
												<div>
													{tagGrp.dailyEntries
														.filter((_entry, idz) => idz < 5)
														.map((entry, idy) => (
															<button
																key={`tagLink${idy}`}
																onClick={() => props.onShowModal({ show: true, editEntry: entry })}
																className='btn btn-sm btn-dark mr-2'>
																{entry.entryDate}
															</button>
														))}
													<span className='ml-2'>(only first 5 shown)</span>
												</div>
											)}
										</td>
										<td className='text-right'>{tagGrp.totalOccurs}</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			</div>
		)
	}

	function renderDupeTags(): JSX.Element {
		return (
			<div className='card my-5'>
				<div className='card-header bg-warning text-white'>
					<h5 className='mb-0'>Dupe Entries (same Dream Signs across multiple dreams)</h5>
				</div>
				<div className='card-body bg-light'>
					{dupeDreamSigns.map((entry, idx) => (
						<button key={`tagDupe${idx}`} onClick={() => props.onShowModal({ show: true, editEntry: entry })} className='btn btn-sm btn-secondary mb-2 mr-2'>
							{entry.entryDate}
						</button>
					))}
				</div>
			</div>
		)
	}

	if (!props.dataFile || !props.dataFile.entries) return <div />
	else
		return (
			<main className='container'>
				{renderHeader()}
				{renderFilters()}
				{renderDreamSignTags()}
				{renderDupeTags()}
			</main>
		)
}
