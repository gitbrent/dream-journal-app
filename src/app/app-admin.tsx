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
import { CardDreamSignGrpViewType, IDreamSignTagGroup, IDriveDataFile, IJournalEntry } from './app.types'
import { InfoCircle, Search } from 'react-bootstrap-icons'
import * as GDrive from './google-oauth'
import DreamTagCard from './components/dreamtag-card'
import AlertGdriveStatus from './components/alert-gstat'
import ModalEntry from './modal-entry'
import HeaderMetrics from './components/header-metrics'

interface Props {
	dataFile: IDriveDataFile
	isBusyLoad: boolean
	doSaveAdminState: (state) => void
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

export default function TabAdmin(props: Props) {
	const [showModal, setShowModal] = useState(false)
	const [currEntry, setCurrEntry] = useState<IJournalEntry>(null)
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

		const tagGroups: IDreamSignTagGroup[] = []
		const dupeSigns: IJournalEntry[] = []
		const bedTimes: IJournalEntry[] = []

		props.dataFile.entries
			.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
			.forEach((entry) => {
				entry.dreams.forEach((dream) =>
					dream.dreamSigns.forEach((sign) => {
						const tag = tagGroups.filter((tag) => tag.dreamSign === sign)[0]
						if (tag) {
							const existingEntry = tag.dailyEntries.filter((item) => item.entryDate == entry.entryDate)[0]
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
		// dupe
		setDupeDreamSigns(dupeSigns)
		// bedtime
		setBadBedTimes(bedTimes)
	}, [props.dataFile])

	// -----------------------------------------------------------------------

	function doMassUpdateTag(oldName: string, newName: string) {
		let numUpdated = 0

		props.dataFile.entries.forEach((entry) => {
			const entryCopy = JSON.parse(JSON.stringify(entry)) as IJournalEntry
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

		GDrive.doSaveDataFile()
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

		GDrive.doSaveDataFile()
			.then(() => {
				alert(`Updated ${badBedTimes.length} items`)
			})
			.catch((err) => alert(err))
	}

	// -----------------------------------------------------------------------

	function renderTagGroups(): JSX.Element {
		return (
			<section>
				<div className='row row-cols g-4 align-items-center justify-content-between mb-4' data-desc='commandbar'>
					<div className='col-auto'>
						<Search size={40} className='text-secondary' />
					</div>
					<div className='col'>
						<div className='form-floating'>
							<input
								id='floatingDreamtag'
								type='text'
								placeholder='search tags'
								value={searchTerm}
								className='form-control'
								onChange={(event) => setSearchTerm(event.target.value)}
								disabled={!props.dataFile ? true : false}
							/>
							<label htmlFor='floatingDreamtag'>search {dreamTagGroups.length} unique tags</label>
						</div>
					</div>
					<div className='col-auto' style={{ minWidth: '130px' }}>
						<div className='form-floating'>
							<select
								id='floatingDisplay'
								placeholder='card size'
								defaultValue={filterViewType}
								disabled={!props.dataFile ? true : false}
								onChange={(ev) => setFilterViewType(ev.currentTarget.value as CardDreamSignGrpViewType)}
								className='form-select'>
								{Object.keys(CardDreamSignGrpViewType).map((val) => (
									<option value={CardDreamSignGrpViewType[val]} key={'viewType' + val}>
										{CardDreamSignGrpViewType[val]}
									</option>
								))}
							</select>
							<label htmlFor='floatingDisplay' className='text-nowrap'>
								Card Size
							</label>
						</div>
					</div>
					<div className='col-auto' style={{ minWidth: '150px' }}>
						<div className='form-floating'>
							<select
								id='floatingSortOrder'
								placeholder='sort order'
								defaultValue={filterSortOrder}
								onChange={(ev) => setFilterSortOrder(ev.currentTarget.value as FilterSortOrder)}
								className='form-select'>
								{Object.keys(FilterSortOrder).map((val) => (
									<option value={FilterSortOrder[val]} key={'sortOrder' + val}>
										{FilterSortOrder[val]}
									</option>
								))}
							</select>
							<label htmlFor='floatingSortOrder' className='text-nowrap'>
								Sort Order
							</label>
						</div>
					</div>
				</div>

				<div className='bg-black p-4'>
					<div className='row row-cols-auto g-3 justify-content-between'>
						{dreamTagGroups
							.filter(
								(tagGrp) => !searchTerm || tagGrp.dreamSign.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 || searchTerm.indexOf(tagGrp.dreamSign) > -1
							)
							.sort((a, b) => {
								if (filterSortOrder === FilterSortOrder.title) return a.dreamSign.toLowerCase() < b.dreamSign.toLowerCase() ? -1 : 1
								else if (filterSortOrder === FilterSortOrder.highlow)
									return a.totalOccurs > b.totalOccurs
										? -1
										: a.totalOccurs < b.totalOccurs
											? 1
											: a.dreamSign.toLowerCase() < b.dreamSign.toLowerCase()
												? -1
												: 1
								else if (filterSortOrder === FilterSortOrder.lowhigh)
									return a.totalOccurs < b.totalOccurs
										? -1
										: a.totalOccurs > b.totalOccurs
											? 1
											: a.dreamSign.toLowerCase() < b.dreamSign.toLowerCase()
												? -1
												: 1
							})
							.map((tagGrp, idx) => (
								<div className='col' key={`keyTagGrp${idx}`}>
									<DreamTagCard
										setCurrEntry={(entry: IJournalEntry) => setCurrEntry(entry)}
										setShowModal={(show: boolean) => setShowModal(show)}
										tagGrp={tagGrp}
										viewType={filterViewType}
										doMassUpdateTag={doMassUpdateTag}
									/>
								</div>
							))}
					</div>
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
						<button
							key={`tagDupe${idx}`}
							onClick={() => {
								setCurrEntry(entry)
								setShowModal(true)
							}}
							className='btn btn-sm btn-secondary mb-2 me-2'>
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
					Bad Bed Times (<code>bedTime</code> is not standard &apos;00:00&apos; format)
				</h5>

				<div className='mt-4'>
					{badBedTimes.map((entry, idx) => (
						<button
							key={`badTime${idx}`}
							onClick={() => {
								const chgEntry = { ...entry }
								chgEntry.notesPrep += `\n[BEDTIME-FIX]='${chgEntry.bedTime}'`
								setCurrEntry(chgEntry)
								setShowModal(true)
							}}
							className='btn btn-sm btn-secondary mb-2 me-2'>
							{entry.bedTime || '(empty)'}
						</button>
					))}
					{badBedTimes.length === 0 && (
						<div className='alert alert-secondary' role='alert'>
							<InfoCircle size='16' className='me-2' />
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
		<AlertGdriveStatus isBusyLoad={props.isBusyLoad} />
	) : (
		<main className='container my-auto my-md-5'>
			<ModalEntry currEntry={currEntry} showModal={showModal} setShowModal={setShowModal} />
			<HeaderMetrics dataFile={props.dataFile} isBusyLoad={props.isBusyLoad} showStats={true} />

			<ul className='nav nav-tabs nav-fill' id='adminTab' role='tablist'>
				<li className='nav-item' role='presentation'>
					<button
						className='nav-link active'
						id='search-tab'
						data-bs-toggle='tab'
						data-bs-target='#search'
						type='button'
						role='tab'
						aria-controls='search'
						aria-selected='true'>
						Rename DreamSign/Tags
					</button>
				</li>
				<li className='nav-item' role='presentation'>
					<button className='nav-link' id='dupe-tab' data-bs-toggle='tab' data-bs-target='#dupe' type='button' role='tab' aria-controls='dupe' aria-selected='false'>
						Fix Dupe Tags
					</button>
				</li>
				<li className='nav-item' role='presentation'>
					<button
						className='nav-link'
						id='bedtime-tab'
						data-bs-toggle='tab'
						data-bs-target='#bedtime'
						type='button'
						role='tab'
						aria-controls='bedtime'
						aria-selected='false'>
						Fix Bed Time
					</button>
				</li>
			</ul>
			<div className='tab-content'>
				<div className='tab-pane bg-light p-4 active' id='search' role='tabpanel' aria-labelledby='search-tab'>
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
