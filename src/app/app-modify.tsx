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
import { IJournalEntry, IDriveFile } from './app'

class TabView extends React.Component<{ onShowModal: Function; selDataFile: IDriveFile }> {
	constructor(props: Readonly<{ onShowModal: Function; selDataFile: IDriveFile }>) {
		super(props)
	}

	handleNewModal = e => {
		this.props.onShowModal({
			show: true,
		})
	}

	handleEditEntryModal = e => {
		this.props.onShowModal({
			show: true,
			editEntry: this.props.selDataFile.entries.filter(entry => {
				return entry.entryDate == e.target.getAttribute('data-entry-key')
			})[0],
		})
	}

	// TODO: Show days with dreams and/or with Lucid success:
	// @see: http://react-day-picker.js.org/examples/elements-cell

	render() {
		let tableFileList: JSX.Element = (
			<table className='table'>
				<thead className='thead'>
					<tr>
						<th>Entry Date</th>
						<th className='text-center d-none d-md-table-cell'>Bed Time</th>
						<th className='text-center d-none d-md-table-cell'>Dream Count</th>
						<th className='text-center d-none d-md-table-cell'>Lucid Dream?</th>
						<th className='text-center'>Action</th>
					</tr>
				</thead>
				<tbody>
					{(this.props.selDataFile && this.props.selDataFile.entries
						? this.props.selDataFile.entries
						: []
					).map((entry: IJournalEntry, idx) => {
						return (
							<tr key={'journalrow' + idx}>
								<td>{entry.entryDate}</td>
								<td className='text-center d-none d-md-table-cell'>{entry.bedTime}</td>
								<td className='text-center d-none d-md-table-cell'>{entry.dreams.length}</td>
								<td className='text-center d-none d-md-table-cell'>
									{entry.dreams.filter(dream => {
										return dream.isLucidDream == true
									}).length > 0 ? (
										<div className='iconSvg size24 circle check' title='Lucid Dream Success!'></div>
									) : (
										''
									)}
								</td>
								<td className='text-center'>
									<button
										className='btn btn-sm btn-primary px-4'
										data-entry-key={entry.entryDate}
										onClick={this.handleEditEntryModal}>
										Edit
									</button>
								</td>
							</tr>
						)
					})}
				</tbody>
				<tfoot>
					{this.props.selDataFile &&
						this.props.selDataFile.entries &&
						this.props.selDataFile.entries.length == 0 && (
							<tr>
								<td colSpan={3} className='text-center p-3 text-muted'>
									(No Dream Journal entries found - select "Add Journal Entry" above to create a new
									one)
								</td>
							</tr>
						)}
					{!this.props.selDataFile && (
						<tr>
							<td colSpan={5} className='text-center p-3 text-muted'>
								(Select a Dream Journal to see entries)
							</td>
						</tr>
					)}
				</tfoot>
			</table>
		)

		return (
			<div className='container mt-5'>
				<div className='row justify-content-between'>
					<div className='col-12'>
						<div className='card'>
							<div className='card-header bg-primary'>
								<h5 className='card-title text-white mb-0'>Modify Journal</h5>
							</div>
							<div className='card-body bg-light'>
								<div className='row mb-4 align-items-center'>
									<div className='col'>
										Your latest journal entries are shown by default. Use the date range search to
										find specific entries.
									</div>
									<div className='col-auto'>
										<button
											type='button'
											className='btn btn-success'
											disabled={!this.props.selDataFile}
											onClick={this.handleNewModal}>
											Create Day
										</button>
									</div>
								</div>
								<div className='text-center d-block d-sm-none'>
									<DateRangePicker numberOfMonths={1} />
								</div>
								<div className='text-center d-none d-sm-block d-md-none'>
									<DateRangePicker numberOfMonths={2} />
								</div>
								<div className='text-center d-none d-md-block d-lg-none'>
									<DateRangePicker numberOfMonths={2} />
								</div>
								<div className='text-center d-none d-lg-block d-xl-none'>
									<DateRangePicker numberOfMonths={3} />
								</div>
								<div className='text-center d-none d-xl-block'>
									<DateRangePicker numberOfMonths={4} />
								</div>
								{tableFileList}
							</div>
						</div>
					</div>
				</div>

				<div className='row'>
					<div className='col-12' />
				</div>
			</div>
		)
	}
}

export default TabView
