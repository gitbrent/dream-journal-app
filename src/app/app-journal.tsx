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

import { useState, useMemo } from 'react'
import { IDriveDataFile, IJournalEntry } from './app.types'
import { Braces, CalendarMonth, Calendar3, Tags } from 'react-bootstrap-icons'
import AlertGdriveStatus from './components/alert-gstat'
import HeaderMetrics from './components/header-metrics'
import TableEntries from './components/table-entries'
// FUTURE: https://github.com/hypeserver/react-date-range

export interface Props {
	dataFile: IDriveDataFile
	isBusyLoad: boolean
	setShowModal: (show: boolean) => void
	setCurrEntry: (entry: IJournalEntry) => void
}

enum EntryType {
	all = '(Show All)',
	lucid = 'Lucid Dreams',
	star = 'Starred Dreams',
}

export default function TabJournal(props: Props) {
	const [filterEntryType, setFilterEntryType] = useState<EntryType>(EntryType.all)
	const [filterText, setFilterText] = useState('')
	const [filterYear, setFilterYear] = useState('')
	const [filterMon, setFilterMon] = useState('')

	const filteredEntries = useMemo(() => {
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
		return (props.dataFile && props.dataFile.entries ? props.dataFile.entries : []).filter(
			(entry) =>
				(!filterText ||
					entry.dreams
						.map((item) => item.dreamSigns)
						.join()
						.indexOf(filterText.toLowerCase()) > -1) &&
				(filterEntryType === EntryType.all ||
					(filterEntryType === EntryType.star && entry.dreams.filter((dream) => dream.dreamSigns?.some((tag) => tag === 'meta:star')).length > 0) ||
					(filterEntryType === EntryType.lucid && entry.dreams.filter((dream) => dream.isLucidDream).length > 0)) &&
				(!filterYear || entry.entryDate.substring(0, 4) === filterYear) &&
				(!filterMon || Number(entry.entryDate.substring(5, 7)) === Number(filterMon))
		)
	}, [props.dataFile, filterEntryType, filterText, filterYear, filterMon])

	// ------------------------------------------------------------------------

	function renderFilters(): JSX.Element {
		const ICON_SIZE = 24

		return (
			<div className='row row-cols-2 row-cols-md-4 g-4 mb-4' data-desc='commandbar'>
				<div className='col' data-desc='search tags'>
					<div className='row flex-nowrap g-0'>
						<div className='col-auto px-2 py-1 d-none d-lg-block'>
							<Tags size={ICON_SIZE} className='text-secondary' />
						</div>
						<div className='col'>
							<div className='form-floating'>
								<input
									id='floatingDreamtag'
									type='text'
									value={filterText}
									title='search tags'
									className='form-control'
									onChange={(event) => setFilterText(event.target.value)}
									disabled={!props.dataFile ? true : false}
								/>
								<label htmlFor='floatingDreamtag'>Search Tags</label>
							</div>
						</div>
					</div>
				</div>
				<div className='col d-none d-md-block' data-desc='year'>
					<div className='row flex-nowrap g-0'>
						<div className='col-auto px-2 py-1 d-none d-lg-block'>
							<Calendar3 size={ICON_SIZE} className='text-secondary' />
						</div>
						<div className='col'>
							<div className='form-floating'>
								<input
									id='floatingEntryYear'
									type='text'
									maxLength={4}
									value={filterYear}
									//placeholder='entry year'
									title='entry year (ex: "2022")'
									className='form-control'
									onChange={(event) => setFilterYear(event.target.value)}
									disabled={!props.dataFile ? true : false}
								/>
								<label htmlFor='floatingEntryYear'>Entry Year</label>
							</div>
						</div>
					</div>
				</div>
				<div className='col d-none d-md-block' data-desc='month'>
					<div className='row flex-nowrap g-0'>
						<div className='col-auto px-2 py-1 d-none d-lg-block'>
							<CalendarMonth size={ICON_SIZE} className='text-secondary' />
						</div>
						<div className='col'>
							<div className='form-floating'>
								<input
									id='floatingEntryMon'
									type='text'
									maxLength={2}
									value={filterMon}
									//placeholder='entry month'
									title='entry month (0-11)'
									className='form-control'
									onChange={(event) => setFilterMon(event.target.value)}
									disabled={!props.dataFile ? true : false}
								/>
								<label htmlFor='floatingEntryMon'>Entry Month</label>
							</div>
						</div>
					</div>
				</div>
				<div className='col' data-desc='types'>
					<div className='row flex-nowrap g-0'>
						<div className='col-auto px-2 py-1 d-none d-lg-block'>
							<Braces size={ICON_SIZE} className='text-secondary' />
						</div>
						<div className='col'>
							<div className='form-floating'>
								<select
									id='floatingFilterEntry'
									defaultValue={filterEntryType}
									onChange={(ev) => setFilterEntryType(ev.currentTarget.value as EntryType)}
									className='form-select'>
									{Object.keys(EntryType).map((val) => (
										<option value={EntryType[val as keyof typeof EntryType]} key={`entryType ${val}`}>
											{EntryType[val as keyof typeof EntryType]}
										</option>
									))}
								</select>
								<label htmlFor='floatingFilterEntry' className='text-nowrap'>
									Entry Type
								</label>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	// FUTURE: Flag/highlight days with dreams and/or with Lucid success (also show "starred" days) - maybe green and yellow colors?
	return !props.dataFile || !props.dataFile.entries ? (
		<AlertGdriveStatus isBusyLoad={props.isBusyLoad} />
	) : (
		<main className='m-4'>
			<HeaderMetrics dataFile={props.dataFile} isBusyLoad={props.isBusyLoad} showStats={true} />
			<section className='be-box-dark'>
				{renderFilters()}
				<section className='be-sec-table'>
					<TableEntries entries={filteredEntries} isBusyLoad={props.isBusyLoad} setShowModal={props.setShowModal} setCurrEntry={props.setCurrEntry} />
				</section>
			</section>
		</main>
	)
}
