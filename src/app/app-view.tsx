/*
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
import { IJournalEntry, IDriveFile, IDreamSignTag } from './app.types'
import { CheckCircleFill, StarFill, SortDownAlt } from 'react-bootstrap-icons'
import DateRangePicker from './comp-other/date-range-picker'
import Pagination from './comp-other/pagination'
import AlertGdriveStatus from './comp-app/alert-gstat'
import ModalEntry from './modal-entry'

export interface Props {
	dataFile: IDriveFile
	dreamSignTags: IDreamSignTag[]
	onShowModal: Function
	doSaveViewState: Function
	viewState: IAppViewState
}

export interface IAppViewState {
	dateRangeFrom: Date
	dateRangeTo: Date
	pagingCurrIdx: number
	pagingPageSize: number
}

export default function TabView(props: Props) {
	const [showModal, setShowModal] = useState(false)
	const [currEntry, setCurrEntry] = useState<IJournalEntry>(null)
	//
	const [pagingCurrIdx, setPagingCurrIdx] = useState(1)
	const [pagingPageSize, setPagingPageSize] = useState(10)
	const [dateRangeFrom, setDateRangeFrom] = useState(null)
	const [dateRangeTo, setDateRangeTo] = useState(null)

	useEffect(() => {
		// TODO: return props.doSaveViewState(this.state)
	}, [])

	useEffect(() => {
		if (currEntry) setShowModal(true)
	}, [currEntry])

	function onDateRangeChange(opts: { dateFrom: Date; dateTo: Date }) {
		setDateRangeFrom(opts.dateFrom || null)
		setDateRangeTo(opts.dateTo || null)
	}

	function renderTabFileList(): JSX.Element {
		// A: filter entries
		let arrEntries = (props.dataFile && props.dataFile.entries ? props.dataFile.entries : []).filter((entry) => {
			let dateEntry = new Date(entry.entryDate + ' 00:00:00')
			// FIXME: doesnt work if you select the day of an entry (eg: jan1 - jan3 works, nut select jan 2 and nothing)
			if (dateRangeFrom && dateRangeTo && dateEntry >= dateRangeFrom && dateEntry <= dateRangeTo) return true
			else if (dateRangeFrom && !dateRangeTo && dateEntry === dateRangeFrom) return true
			else if (!dateRangeFrom && !dateRangeTo) return true
			else return false
		})

		return props.dataFile && props.dataFile._isLoading ? (
			<div className='align-middle text-center text-warning mb-4'>
				<div className='spinner-border spinner-border-sm mr-2' role='status'>
					<span className='sr-only' />
				</div>
				Saving/Loading...
			</div>
		) : (
			<section>
				<table className='table'>
					<thead className='thead'>
						<tr>
							<th>
								Date
								<SortDownAlt size='16' className='ml-1' />
							</th>
							<th className='text-center d-none d-lg-table-cell'>Bed</th>
							<th className='text-center'>Dreams</th>
							<th className='text-center d-none d-md-table-cell'>Dream Signs</th>
							<th className='text-center d-none d-md-table-cell'>Starred?</th>
							<th className='text-center'>Lucid?</th>
							<th className='text-center'>&nbsp;</th>
						</tr>
					</thead>
					<tbody>
						{arrEntries
							.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
							.filter((_entry, idx) => idx >= pagingPageSize * (pagingCurrIdx - 1) && idx < pagingPageSize * pagingCurrIdx)
							.map((entry: IJournalEntry, idx) => {
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
									<tr key={'journalrow' + idx}>
										<td className='align-middle text-nowrap'>{entry.entryDate}</td>
										<td className='align-middle text-center d-none d-lg-table-cell'>{entry.bedTime}</td>
										<td className='align-middle text-center'>{entry.dreams.length}</td>
										<td className='align-middle text-left d-none d-md-table-cell'>
											{dreamSignsUnq.sort().map((sign, idy) => (
												<div key={`${idx}-${idy}`} className='badge badge-info p-2 mr-2 mb-2'>
													{sign}
												</div>
											))}
										</td>
										<td className='align-middle text-center d-none d-md-table-cell'>{entry.starred && <StarFill size='24' className='text-warning' />}</td>
										<td className='align-middle text-center'>
											{entry.dreams.filter((dream) => dream.isLucidDream === true).length > 0 && <CheckCircleFill size='24' className='text-success' />}
										</td>
										<td className='text-center'>
											<button onClick={(_ev) => setCurrEntry(entry)} className='btn btn-sm btn-outline-primary px-4'>
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

				<div className='text-center d-block d-sm-none'>
					<Pagination
						totalRecords={arrEntries.length}
						pageLimit={pagingPageSize}
						pageNeighbours={1}
						currentPage={pagingCurrIdx}
						onPageChanged={(event: any) => setPagingCurrIdx(event.currentPage)}
					/>
				</div>
				<div className='text-center d-none d-sm-block'>
					<Pagination
						totalRecords={arrEntries.length}
						pageLimit={pagingPageSize}
						pageNeighbours={4}
						currentPage={pagingCurrIdx}
						onPageChanged={(event: any) => setPagingCurrIdx(event.currentPage)}
					/>
				</div>
			</section>
		)
	}

	// TODO: Flag/highlight days with dreams and/or with Lucid success (also show "starred" days) - maybe green and yellow colors?
	// @see: http://react-day-picker.js.org/examples/elements-cell
	// TODO: DateRangePicker: add prop for (earliest month of journal) `fromMonth={new Date(2018, 8)}`
	/* TODO: circle days on cal where LUCID==true!! (soln: add prop for Array<Date>)
	<DayPicker
		  initialMonth={new Date(2017, 3)}
		  selectedDays={[ new Date(2017, 3, 12), ])
	*/
	return !props.dataFile || !props.dataFile.entries ? (
		<AlertGdriveStatus />
	) : (
		<div className='container my-5'>
			<ModalEntry currEntry={currEntry} showModal={showModal} setShowModal={setShowModal} />

			<div className='row justify-content-between'>
				<div className='col-12'>
					<div className='card'>
						<div className='card-header bg-primary'>
							<h5 className='card-title text-white mb-0'>View Dream Journal</h5>
						</div>
						<div className='card-body bg-light'>
							<p className='lead'>All of your journal entries are shown by default. Use the date range search to find specific entries.</p>
							<div className='text-center d-block d-sm-none'>
								<DateRangePicker
									numberOfMonths={1}
									dateRangeFrom={dateRangeFrom}
									dateRangeTo={dateRangeTo}
									onChange={(opts: any) => {
										onDateRangeChange(opts)
									}}
								/>
							</div>
							<div className='text-center d-none d-sm-block d-md-none'>
								<DateRangePicker
									numberOfMonths={2}
									dateRangeFrom={dateRangeFrom}
									dateRangeTo={dateRangeTo}
									onChange={(opts: any) => {
										onDateRangeChange(opts)
									}}
								/>
							</div>
							<div className='text-center d-none d-md-block d-lg-none'>
								<DateRangePicker
									numberOfMonths={2}
									dateRangeFrom={dateRangeFrom}
									dateRangeTo={dateRangeTo}
									onChange={(opts: any) => {
										onDateRangeChange(opts)
									}}
								/>
							</div>
							<div className='text-center d-none d-lg-block d-xl-none'>
								<DateRangePicker
									numberOfMonths={3}
									dateRangeFrom={dateRangeFrom}
									dateRangeTo={dateRangeTo}
									onChange={(opts: any) => {
										onDateRangeChange(opts)
									}}
								/>
							</div>
							<div className='text-center d-none d-xl-block'>
								<DateRangePicker
									numberOfMonths={4}
									dateRangeFrom={dateRangeFrom}
									dateRangeTo={dateRangeTo}
									onChange={(opts: any) => {
										onDateRangeChange(opts)
									}}
								/>
							</div>

							{renderTabFileList()}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
