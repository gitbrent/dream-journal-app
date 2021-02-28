/**
 *  :: Brain Cloud Dream Journal ::
 *
 *  Dream Journal App - Record and Search Daily Dream Entries
 *  https://github.com/gitbrent/dream-journal-app
 *
 *  This library is released under the MIT Public License (MIT)
 *
 *  Dream Journal App (C) 2019-present Brent Ely (https://github.com/gitbrent)
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

import React, { useState, useEffect } from 'react'
import { IJournalEntry, IDriveFile } from './app.types'
import { CheckCircleFill, Diagram3Fill, Search, StarFill, SortDownAlt } from 'react-bootstrap-icons'
import ReactPaginate from 'react-paginate'
import AlertGdriveStatus from './components/alert-gstat'
import ModalEntry from './modal-entry'
import HeaderMetrics from './components/header-metrics'
// FUTURE: https://github.com/hypeserver/react-date-range

export interface Props {
	dataFile: IDriveFile
	isBusyLoad: boolean
	doSaveViewState: Function
	viewState: IAppViewState
}
export interface IAppViewState {
	//dateRangeFrom: Date
	//dateRangeTo: Date
	pagingCurrIdx: number
	pagingPageSize: number
}

enum FilterEntry {
	all = '(Show All)',
	lucid = 'Lucid Dreams',
	star = 'Starred',
}

export default function TabView(props: Props) {
	const [showModal, setShowModal] = useState(false)
	const [currEntry, setCurrEntry] = useState<IJournalEntry>(null)
	//
	const [totalDreams, setTotalDreams] = useState(0)
	const [totalLucids, setTotalLucids] = useState(0)
	const [totalStarred, setTotalStarred] = useState(0)
	const [totalMonths, setTotalMonths] = useState(0)
	const [totalYears, setTotalYears] = useState(0)
	//
	const [searchTerm, setSearchTerm] = useState('')
	const [filterEntry, setFilterEntry] = useState<FilterEntry>(FilterEntry.all)
	//
	const [pagingCurrIdx, setPagingCurrIdx] = useState(0)
	const [pagingPageSize, setPagingPageSize] = useState(10)
	//const [dateRangeFrom, setDateRangeFrom] = useState(null)
	//const [dateRangeTo, setDateRangeTo] = useState(null)

	/** Gather all metrics */
	useEffect(() => {
		if (props.dataFile && props.dataFile.entries) {
			// Total: dreams, stars, lucids
			{
				let tmpTotalStarred = 0
				let tmpTotalDreams = 0
				let tmpTotalLucids = 0

				props.dataFile.entries.forEach((entry) => {
					if (entry.starred) tmpTotalStarred++
					tmpTotalDreams += entry.dreams.length
					tmpTotalLucids += entry.dreams.filter((dream) => dream.isLucidDream).length
				})

				setTotalStarred(tmpTotalStarred)
				setTotalDreams(tmpTotalDreams)
				setTotalLucids(tmpTotalLucids)
			}

			// Total Months
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

			// Total Years
			{
				let d1 = new Date(props.dataFile.entries.sort((a, b) => ((a.entryDate || 'zzz') < (b.entryDate || 'zzz') ? -1 : 1))[0].entryDate)
				let d2 = new Date(props.dataFile.entries.sort((a, b) => ((a.entryDate || '000') > (b.entryDate || '000') ? -1 : 1))[0].entryDate)

				setTotalYears(d2.getFullYear() - d1.getFullYear() + 1)
			}
		}
	}, [props.dataFile])

	useEffect(() => setPagingCurrIdx(0), [filterEntry])

	// TODO: useEffect: return props.doSaveViewState(this.state)

	// ------------------------------------------------------------------------

	function renderFilters(): JSX.Element {
		return (
			<div className='row align-items-center mb-3' data-desc='commandbar'>
				<div className='col-auto d-none d-md-block'>
					<Search size={48} className='text-secondary' />
				</div>
				<div className='col-12 col-md mb-3 mb-md-0'>
					<div className='form-floating'>
						<input
							id='floatingDreamtag'
							type='text'
							placeholder='search dream tags'
							value={searchTerm}
							className='form-control'
							onChange={(event) => setSearchTerm(event.target.value)}
							disabled={!props.dataFile ? true : false}
						/>
						<label htmlFor='floatingDreamtag'>Search Dream Tags</label>
					</div>
				</div>
				<div className='col-auto'>
					<div className='form-floating'>
						<select
							id='floatingFilterEntry'
							placeholder='entry type'
							defaultValue={filterEntry}
							onChange={(ev) => setFilterEntry(ev.currentTarget.value as FilterEntry)}
							className='form-control'>
							{Object.keys(FilterEntry).map((val) => (
								<option value={FilterEntry[val]} key={'entryType' + val}>
									{FilterEntry[val]}
								</option>
							))}
						</select>
						<label htmlFor='floatingFilterEntry' className='text-nowrap'>
							Entry Type
						</label>
					</div>
				</div>
			</div>
		)
	}

	function renderTabFileList(): JSX.Element {
		// A: filter entries
		/*
		let arrEntries = (props.dataFile && props.dataFile.entries ? props.dataFile.entries : []).filter((entry) => {
			let dateEntry = new Date(entry.entryDate + ' 00:00:00')
			// FIXME: doesnt work if you select the day of an entry (eg: jan1 - jan3 works, nut select jan 2 and nothing)
			if (dateRangeFrom && dateRangeTo && dateEntry >= dateRangeFrom && dateEntry <= dateRangeTo) return true
			else if (dateRangeFrom && !dateRangeTo && dateEntry === dateRangeFrom) return true
			else if (!dateRangeFrom && !dateRangeTo) return true
			else return false
		})
		*/
		let filteredEntries = (props.dataFile && props.dataFile.entries ? props.dataFile.entries : []).filter((entry) => {
			if (filterEntry === FilterEntry.star) return entry.starred
			else if (filterEntry === FilterEntry.lucid) return entry.dreams.filter((dream) => dream.isLucidDream).length > 0
			else return true
		})

		return (
			<section className="bg-black p-3">
				<table className='table table-sm mb-4'>
					<thead className='thead'>
						<tr>
							<th style={{ width: '1%' }}>
								Date
								<SortDownAlt size='16' className='ms-1' />
							</th>
							<th className='text-center d-none d-lg-table-cell'>Bed</th>
							<th className='text-center'>
								<span className='d-block d-md-none'>
									<Diagram3Fill />
								</span>
								<span className='d-none d-md-inline-block'>Dreams</span>
							</th>
							<th className='text-left d-none d-md-table-cell'>Tags</th>
							<th className='text-center'>
								<span className='d-block d-md-none'>
									<StarFill />
								</span>
								<span className='d-none d-md-inline-block'>Starred?</span>
							</th>
							<th className='text-center'>
								<span className='d-block d-md-none'>
									<CheckCircleFill />
								</span>
								<span className='d-none d-md-inline-block'>Lucid?</span>
							</th>
							<th style={{ width: '1%' }}>&nbsp;</th>
						</tr>
					</thead>
					<tbody>
						{filteredEntries
							.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
							.filter((_entry, idx) => idx >= pagingPageSize * pagingCurrIdx && idx < pagingPageSize * (pagingCurrIdx + 1))
							.map((entry, idx) => {
								// This is a harsh thing to compile inline below, so do it here
								let dreamSignsUnq: string[] = []
								entry.dreams.forEach((dream) =>
									Array.isArray(dream.dreamSigns)
										? (dreamSignsUnq = [...new Set(dream.dreamSigns.concat(dreamSignsUnq))])
										: dream.dreamSigns
										? dreamSignsUnq.push(dream.dreamSigns + ' (FIXME)')
										: ''
								)

								return (
									<tr key={`journalrow${idx}`}>
										<td className='align-middle text-nowrap'>{entry.entryDate}</td>
										<td className='align-middle text-center d-none d-lg-table-cell'>{entry.bedTime}</td>
										<td className='align-middle text-center'>{entry.dreams.length}</td>
										<td className='align-middle text-left d-none d-md-table-cell'>
											<div className='row row-cols-auto g-2'>
												{dreamSignsUnq.sort().map((sign, idy) => (
													<div key={`${idx}-${idy}`} className='col'>
														<div className='badge bg-info p-2'>{sign}</div>
													</div>
												))}
											</div>
										</td>
										<td className='align-middle text-center'>{entry.starred && <StarFill size='24' className='text-warning' />}</td>
										<td className='align-middle text-center'>
											{entry.dreams.filter((dream) => dream.isLucidDream === true).length > 0 && <CheckCircleFill size='24' className='text-success' />}
										</td>
										<td className='text-center'>
											<button
												onClick={(_ev) => {
													setCurrEntry(entry)
													setShowModal(true)
												}}
												className='btn btn-sm btn-outline-primary px-4'>
												Edit
											</button>
										</td>
									</tr>
								)
							})}
					</tbody>
					<tfoot>
						{props.dataFile && props.dataFile.entries && props.dataFile.entries.length === 0 && (
							<tr>
								<td colSpan={6} className='text-center p-3 text-muted'>
									(No Dream Journal entries found - select "Add Journal Entry" above to create a new one)
								</td>
							</tr>
						)}
						{!props.dataFile && (
							<tr>
								<td colSpan={6} className='text-center p-3'>
									<h5 className='text-secondary'>(no Dream Journal is currently selected)</h5>
								</td>
							</tr>
						)}
					</tfoot>
				</table>

				<div className='align-items-center d-block d-sm-none'>
					<ReactPaginate
						pageCount={Math.ceil(filteredEntries.length / pagingPageSize)}
						pageRangeDisplayed={1}
						marginPagesDisplayed={1}
						previousLabel={'←'}
						nextLabel={'→'}
						breakLabel={'...'}
						onPageChange={(data: { selected: number }) => setPagingCurrIdx(data.selected)}
						containerClassName={'pagination justify-content-center mb-0 user-select-none'}
						activeClassName={'active'}
						breakClassName={'page-item'}
						breakLinkClassName={'page-link'}
						pageClassName={'page-item'}
						pageLinkClassName={'page-link'}
						previousClassName={'page-item'}
						previousLinkClassName={'page-link'}
						nextClassName={'page-item'}
						nextLinkClassName={'page-link'}
					/>
				</div>
				<div className='align-items-center d-none d-sm-block'>
					<ReactPaginate
						pageCount={Math.ceil(filteredEntries.length / pagingPageSize)}
						pageRangeDisplayed={5}
						marginPagesDisplayed={2}
						previousLabel={'← Prev'}
						nextLabel={'Next →'}
						breakLabel={'...'}
						onPageChange={(data: { selected: number }) => setPagingCurrIdx(data.selected)}
						containerClassName={'pagination justify-content-center mb-0 user-select-none'}
						activeClassName={'active'}
						breakClassName={'page-item'}
						breakLinkClassName={'page-link'}
						pageClassName={'page-item'}
						pageLinkClassName={'page-link'}
						previousClassName={'page-item'}
						previousLinkClassName={'page-link'}
						nextClassName={'page-item'}
						nextLinkClassName={'page-link'}
					/>
				</div>
			</section>
		)
	}

	// FUTURE: Flag/highlight days with dreams and/or with Lucid success (also show "starred" days) - maybe green and yellow colors?
	return !props.dataFile || !props.dataFile.entries ? (
		<AlertGdriveStatus isBusyLoad={props.isBusyLoad} />
	) : (
		<div className='container my-auto my-md-5'>
			<ModalEntry currEntry={currEntry} showModal={showModal} setShowModal={setShowModal} />
			<HeaderMetrics dataFile={props.dataFile} isBusyLoad={props.isBusyLoad} showStats={true} />
			<section className='bg-light p-3'>
				{renderFilters()}
				{renderTabFileList()}
			</section>
		</div>
	)
}
