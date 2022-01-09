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
import { IJournalEntry, IDriveDataFile } from './app.types'
import { Search } from 'react-bootstrap-icons'
import AlertGdriveStatus from './components/alert-gstat'
import HeaderMetrics from './components/header-metrics'
import TableEntries from './components/table-entries'
// FUTURE: https://github.com/hypeserver/react-date-range

export interface Props {
	dataFile: IDriveDataFile
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

export default function TabJournal(props: Props) {
	const [filterText, setFilterText] = useState('')
	const [filterEntry, setFilterEntry] = useState<FilterEntry>(FilterEntry.all)
	const [filteredEntries, setFilteredEntries] = useState<IJournalEntry[]>([])

	useEffect(() => {
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
		setFilteredEntries(
			(props.dataFile && props.dataFile.entries ? props.dataFile.entries : []).filter(
				(entry) =>
					(!filterText ||
						entry.dreams
							.map((item) => item.dreamSigns)
							.join()
							.indexOf(filterText.toLowerCase()) > -1) &&
					(filterEntry === FilterEntry.all ||
						(filterEntry === FilterEntry.star &&
							(entry.starred || entry.dreams.filter((dream) => dream.dreamSigns.some((tag) => tag === 'meta:star')).length > 0)) ||
						(filterEntry === FilterEntry.lucid && entry.dreams.filter((dream) => dream.isLucidDream).length > 0))
			)
		)
	}, [props.dataFile, filterText, filterEntry])

	// TODO: useEffect: return props.doSaveViewState(this.state)

	// ------------------------------------------------------------------------

	function renderFilters(): JSX.Element {
		return (
			<div className='row row-cols g-4 align-items-center justify-content-between mb-4' data-desc='commandbar'>
				<div className='col-auto d-none d-md-block' data-desc='icon'>
					<Search size={40} className='text-secondary' />
				</div>
				<div className='col' data-desc='search tags'>
					<div className='form-floating'>
						<input
							id='floatingDreamtag'
							type='text'
							value={filterText}
							placeholder='search tags'
							className='form-control'
							onChange={(event) => setFilterText(event.target.value)}
							disabled={!props.dataFile ? true : false}
						/>
						<label htmlFor='floatingDreamtag'>Search Tags</label>
					</div>
				</div>
				<div className='col-auto' data-desc='entry type'>
					<div className='form-floating'>
						<select
							id='floatingFilterEntry'
							defaultValue={filterEntry}
							onChange={(ev) => setFilterEntry(ev.currentTarget.value as FilterEntry)}
							className='form-select'>
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

	// FUTURE: Flag/highlight days with dreams and/or with Lucid success (also show "starred" days) - maybe green and yellow colors?
	return !props.dataFile || !props.dataFile.entries ? (
		<AlertGdriveStatus isBusyLoad={props.isBusyLoad} />
	) : (
		<div className='container my-auto my-md-5'>
			<HeaderMetrics dataFile={props.dataFile} isBusyLoad={props.isBusyLoad} showStats={true} />
			<section className='bg-light p-4'>
				{renderFilters()}
				<div className='bg-black p-3'>
					<TableEntries entries={filteredEntries} isBusyLoad={props.isBusyLoad} />
				</div>
			</section>
		</div>
	)
}
