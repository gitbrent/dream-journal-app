/*\
|*|  :: Brain Cloud Dream Journal ::
|*|
|*|  Dream Journal App - Record and Search Daily Dream Entries
|*|  https://github.com/gitbrent/dream-journal-app
|*|
|*|  This library is released under the MIT Public License (MIT)
|*|
|*|  Dream Journal App (C) 2019-present Brent Ely (https://github.com/gitbrent)
|*|
|*|  Permission is hereby granted, free of charge, to any person obtaining a copy
|*|  of this software and associated documentation files (the "Software"), to deal
|*|  in the Software without restriction, including without limitation the rights
|*|  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
|*|  copies of the Software, and to permit persons to whom the Software is
|*|  furnished to do so, subject to the following conditions:
|*|
|*|  The above copyright notice and this permission notice shall be included in all
|*|  copies or substantial portions of the Software.
|*|
|*|  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
|*|  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
|*|  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
|*|  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
|*|  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
|*|  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
|*|  SOFTWARE.
\*/

import * as React from 'react'
import DateRangePicker from '../app/date-range-picker'
import Pagination from '../app/pagination'
import { IJournalEntry, IDriveFile, IDreamSignTag } from './app'

export interface IAppViewProps {
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

export default class TabView extends React.Component<IAppViewProps, IAppViewState> {
	constructor(props: Readonly<IAppViewProps>) {
		super(props)

		this.state = {
			dateRangeFrom: props.viewState && props.viewState.dateRangeFrom ? props.viewState.dateRangeFrom : null,
			dateRangeTo: props.viewState && props.viewState.dateRangeTo ? props.viewState.dateRangeTo : null,
			pagingCurrIdx: props.viewState && props.viewState.pagingCurrIdx ? props.viewState.pagingCurrIdx : 1,
			pagingPageSize: props.viewState && props.viewState.pagingPageSize ? props.viewState.pagingPageSize : 10,
		}
	}

	/**
	 * this constructor is called whenever tab is hidden/shown, so state must be preserved by parent (lifting state up)
	 */
	componentWillUnmount = () => {
		this.props.doSaveViewState(this.state)
	}

	handleNewModal = (_event: React.MouseEvent<HTMLInputElement>) => {
		this.props.onShowModal({
			show: true,
			tags: this.props.dreamSignTags
		})
	}

	handleEntryEdit = (_event: React.MouseEvent<HTMLButtonElement>, editEntryDate: IJournalEntry['entryDate']) => {
		this.props.onShowModal({
			show: true,
			tags: this.props.dreamSignTags,
			editEntry: this.props.dataFile.entries.filter(entry => {
				return entry.entryDate === editEntryDate
			})[0],
		})
	}

	onDateRangeChange = (opts: any) => {
		this.setState({
			dateRangeFrom: opts && opts.from ? opts.from : null,
			dateRangeTo: opts && opts.to ? opts.to : null,
		})
	}

	// TODO: Flag/highlight days with dreams and/or with Lucid success (also show "starred" days) - maybe green and yellow colors?
	// @see: http://react-day-picker.js.org/examples/elements-cell
	render() {
		// A: filter entries
		let arrEntries = (this.props.dataFile && this.props.dataFile.entries ? this.props.dataFile.entries : []).filter(
			entry => {
				let dateEntry = new Date(entry.entryDate + ' 00:00:00')
				// FIXME: doesnt work if you select the day of an entry (eg: jan1 - jan3 works, nut select jan 2 and nothing)
				if (
					this.state.dateRangeFrom &&
					this.state.dateRangeTo &&
					dateEntry >= this.state.dateRangeFrom &&
					dateEntry <= this.state.dateRangeTo
				)
					return true
				else if (this.state.dateRangeFrom && !this.state.dateRangeTo && dateEntry === this.state.dateRangeFrom)
					return true
				else if (!this.state.dateRangeFrom && !this.state.dateRangeTo) return true
				else return false
			}
		)

		let tableFileList: JSX.Element =
			this.props.dataFile && this.props.dataFile._isLoading ? (
				<div className='align-middle text-center text-warning mb-4'>
					<div className='spinner-border spinner-border-sm mr-2' role='status'>
						<span className='sr-only' />
					</div>
					Saving/Loading...
				</div>
			) : (
				<table className='table'>
					<thead className='thead'>
						<tr>
							<th>Date</th>
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
							.sort((a, b) => {
								if (a.entryDate < b.entryDate) return -1
								if (a.entryDate > b.entryDate) return 1
								return 0
							})
							.filter((_entry, idx) => {
								return (
									idx >= this.state.pagingPageSize * (this.state.pagingCurrIdx - 1) &&
									idx < this.state.pagingPageSize * this.state.pagingCurrIdx
								)
							})
							.map((entry: IJournalEntry, idx) => {
								// This is a harsh thing to compile inline below, so do it here
								let dreamSignsUnq: Array<string> = []
								entry.dreams.forEach(dream =>
									Array.isArray(dream.dreamSigns)
										? (dreamSignsUnq = [...new Set(dream.dreamSigns.concat(dreamSignsUnq))])
										: dream.dreamSigns
										? dreamSignsUnq.push(dream.dreamSigns + ' (FIXME)')
										: ''
								)

								return (
									<tr key={'journalrow' + idx}>
										<td className='text-nowrap'>{entry.entryDate}</td>
										<td className='text-center d-none d-lg-table-cell'>{entry.bedTime}</td>
										<td className='text-center'>{entry.dreams.length}</td>
										<td className='text-left d-none d-md-table-cell'>
											{dreamSignsUnq.map((sign, idy) => {
												return (
													<div
														className='badge badge-info text-lowercase p-2 mr-2 mb-1'
														key={idx + '-' + idy}>
														{sign}
													</div>
												)
											})}
										</td>
										<td className='text-center d-none d-md-table-cell'>
											{entry.starred ? <div className='iconSvg star-on size16' /> : ''}
										</td>
										<td className='text-center'>
											{entry.dreams.filter(dream => {
												return dream.isLucidDream === true
											}).length > 0 ? (
												<div
													className='iconSvg size24 circle check'
													title='Lucid Dream Success!'
												/>
											) : (
												''
											)}
										</td>
										<td className='text-center'>
											<button
												className='btn btn-sm btn-outline-primary px-4'
												onClick={event => this.handleEntryEdit(event, entry.entryDate)}>
												Edit
											</button>
										</td>
									</tr>
								)
							})}
					</tbody>
					<tfoot>
						{this.props.dataFile && this.props.dataFile.entries && this.props.dataFile.entries.length === 0 && (
							<tr>
								<td colSpan={6} className='text-center p-3 text-muted'>
									(No Dream Journal entries found - select "Add Journal Entry" above to create a new
									one)
								</td>
							</tr>
						)}
						{!this.props.dataFile && (
							<tr>
								<td colSpan={6} className='text-center p-3'>
									<h5 className='text-secondary'>(no Dream Journal is currently selected)</h5>
								</td>
							</tr>
						)}
					</tfoot>
				</table>
			)

		// TODO: DateRangePicker: add prop for (earliest month of journal) `fromMonth={new Date(2018, 8)}`
		/* TODO: circle days on cal where LUCID==true!! (soln: add prop for Array<Date>)
		<DayPicker
			  initialMonth={new Date(2017, 3)}
			  selectedDays={[ new Date(2017, 3, 12), ])
		*/
		return (
			<div className='container mt-5'>
				<div className='row justify-content-between'>
					<div className='col-12'>
						<div className='card'>
							<div className='card-header bg-primary'>
								<h5 className='card-title text-white mb-0'>View Dream Journal</h5>
							</div>
							<div className='card-body bg-light'>
								<p className='lead'>
									All of your journal entries are shown by default. Use the date range search to find
									specific entries.
								</p>
								<div className='text-center d-block d-sm-none'>
									<DateRangePicker
										numberOfMonths={1}
										dateRangeFrom={this.state.dateRangeFrom}
										dateRangeTo={this.state.dateRangeTo}
										onChange={(opts: any) => {
											this.onDateRangeChange(opts)
										}}
									/>
								</div>
								<div className='text-center d-none d-sm-block d-md-none'>
									<DateRangePicker
										numberOfMonths={2}
										dateRangeFrom={this.state.dateRangeFrom}
										dateRangeTo={this.state.dateRangeTo}
										onChange={(opts: any) => {
											this.onDateRangeChange(opts)
										}}
									/>
								</div>
								<div className='text-center d-none d-md-block d-lg-none'>
									<DateRangePicker
										numberOfMonths={2}
										dateRangeFrom={this.state.dateRangeFrom}
										dateRangeTo={this.state.dateRangeTo}
										onChange={(opts: any) => {
											this.onDateRangeChange(opts)
										}}
									/>
								</div>
								<div className='text-center d-none d-lg-block d-xl-none'>
									<DateRangePicker
										numberOfMonths={3}
										dateRangeFrom={this.state.dateRangeFrom}
										dateRangeTo={this.state.dateRangeTo}
										onChange={(opts: any) => {
											this.onDateRangeChange(opts)
										}}
									/>
								</div>
								<div className='text-center d-none d-xl-block'>
									<DateRangePicker
										numberOfMonths={4}
										dateRangeFrom={this.state.dateRangeFrom}
										dateRangeTo={this.state.dateRangeTo}
										onChange={(opts: any) => {
											this.onDateRangeChange(opts)
										}}
									/>
								</div>

								{tableFileList}

								<div className='text-center d-block d-sm-none'>
									<Pagination
										totalRecords={arrEntries.length}
										pageLimit={this.state.pagingPageSize}
										pageNeighbours={2}
										currentPage={this.state.pagingCurrIdx}
										onPageChanged={(event: any) =>
											this.setState({ pagingCurrIdx: event.currentPage })
										}
									/>
								</div>
								<div className='text-center d-none d-sm-block'>
									<Pagination
										totalRecords={arrEntries.length}
										pageLimit={this.state.pagingPageSize}
										pageNeighbours={4}
										currentPage={this.state.pagingCurrIdx}
										onPageChanged={(event: any) =>
											this.setState({ pagingCurrIdx: event.currentPage })
										}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}
