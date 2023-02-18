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

import React, { useState } from 'react'
import { IJournalEntry, MetaType } from '../app.types'
import { CheckCircleFill, Diagram3Fill, SortDownAlt, SortUpAlt, StarFill } from 'react-bootstrap-icons'
import ModalEntry from '../modal-entry'
import ReactPaginate from 'react-paginate'
import { appdata } from '../appdata'

interface Props {
	appdataSvc: appdata
	entries: IJournalEntry[]
	isBusyLoad: boolean
}

export default function TableEntries(props: Props) {
	const [showModal, setShowModal] = useState(false)
	const [currEntry, setCurrEntry] = useState<IJournalEntry>()
	//
	const [pagingCurrIdx, setPagingCurrIdx] = useState(0)
	const [pagingPageSize, setPagingPageSize] = useState(10)
	const [sortAsc, setSortAsc] = useState(false)
	//const [dateRangeFrom, setDateRangeFrom] = useState(null)
	//const [dateRangeTo, setDateRangeTo] = useState(null)

	//useEffect(() => setPagingCurrIdx(0), [filterEntry]) // FIXME: Doesnt work, need to use `forcePage` (https://www.npmjs.com/package/react-paginate)

	return (
		<section>
			<ModalEntry currEntry={currEntry} showModal={showModal} setShowModal={setShowModal} appdataSvc={props.appdataSvc} />

			<table className='table table-sm mb-4'>
				<thead className='thead'>
					<tr>
						<th style={{ width: '1%', userSelect: 'none' }} title='Sort Asc/Desc' onClick={() => setSortAsc(!sortAsc)} className='text-nowrap cursor-link'>
							Date
							{sortAsc ? <SortUpAlt size='16' className='ms-1' /> : <SortDownAlt size='16' className='ms-1' />}
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
					{props.entries
						.sort((a, b) => (a.entryDate > b.entryDate ? (sortAsc ? 1 : -1) : sortAsc ? -1 : 1))
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
									<td className='align-middle text-center'>
										{entry.dreams.filter((dream) => dream.dreamSigns?.some((tag) => tag === MetaType.star)).length > 0 && (
											<StarFill size='24' className='text-warning' />
										)}
									</td>
									<td className='align-middle text-center'>
										{entry.dreams.filter((dream) => dream.isLucidDream === true).length > 0 && <CheckCircleFill size='24' className='text-success' />}
									</td>
									<td className='align-middle text-center'>
										<button
											onClick={() => {
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
					{(!props.entries || props.entries.length === 0) && (
						<tr>
							<td colSpan={7} className='text-center text-muted p-3'>
								<div>(no dream journal entries found)</div>
							</td>
						</tr>
					)}
				</tfoot>
			</table>

			<div className='align-items-center d-block d-sm-none'>
				<ReactPaginate
					pageCount={Math.ceil(props.entries.length / pagingPageSize)}
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
					pageCount={Math.ceil(props.entries.length / pagingPageSize)}
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
