import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { CardDreamSignGrpViewType, IDreamSignTagGroup, IDreamTagByCat, IDriveDataFile, IJournalDream, IJournalEntry, MONTHS } from './app.types'
import { Search, Tag, Tags } from 'react-bootstrap-icons'
import DreamTagCard from './components/dreamtag-card'
import * as GDrive from './google-oauth'
import AlertGdriveStatus from './components/alert-gstat'
import HeaderMetrics from './components/header-metrics'
import ModalEntry from './modal-entry'

interface IAppTagsProps {
	dataFile: IDriveDataFile
	isBusyLoad: boolean
	doSaveTagsState: Function
	tagsState: IAppTagsState
}
export interface IAppTagsState {}

interface IOnlyDream {
	entryDate: string
	dreams: IJournalDream[]
	tags: string[]
}

enum FilterDate {
	all = '(All)',
	last10 = 'Last 10 Days',
	last30 = 'Last 30 Days',
	last90 = 'Last 90 Days',
	last180 = 'Last 180 Days',
	last360 = 'Last 360 Days',
}
enum FilterView {
	group = 'Grouped',
	ungrp = 'Un-Grouped',
	dates = 'Timeline',
}
enum FilterSortOrder {
	title = 'Title',
	highlow = 'High → Low',
	lowhigh = 'Low → High',
}

export default function TabAdmin(props: IAppTagsProps) {
	const [showModal, setShowModal] = useState(false)
	const [currEntry, setCurrEntry] = useState<IJournalEntry>(null)
	//
	const [dreamTagGroups, setDreamTagGroups] = useState<IDreamSignTagGroup[]>([])
	const [tagsByCat, setTagsByCat] = useState<IDreamTagByCat[]>([])
	const [onlyDreams, setOnlyDreams] = useState<IOnlyDream[]>([])
	//
	const [filterText, setFilterText] = useState('')
	const [filterView, setFilterView] = useState(FilterView.group)
	const [filterDate, setFilterDate] = useState(FilterDate.last30)
	//
	const [searchTerm, setSearchTerm] = useState('')
	const [filterViewType, setFilterViewType] = useState<CardDreamSignGrpViewType>(CardDreamSignGrpViewType.sm)
	const [filterSortOrder, setFilterSortOrder] = useState<FilterSortOrder>(FilterSortOrder.title)

	useEffect(() => {
		if (!props.dataFile || !props.dataFile.entries) return

		let tmpOnlyDreams: IOnlyDream[] = []

		let filterDays =
			filterDate === FilterDate.last10
				? 10
				: filterDate === FilterDate.last30
				? 30
				: filterDate === FilterDate.last90
				? 90
				: filterDate === FilterDate.last180
				? 180
				: filterDate === FilterDate.last360
				? 360
				: 0

		// Tag Groups
		let tagGroups: IDreamSignTagGroup[] = []
		{
			props.dataFile.entries
				.filter((entry) => filterDate === FilterDate.all || moment(entry.entryDate).isAfter(moment().subtract(filterDays, 'days')))
				.filter(
					(entry) =>
						!filterText ||
						entry.dreams
							.map((dream) => dream.dreamSigns)
							.join(',')
							.toLowerCase()
							.indexOf(filterText.toLowerCase()) > -1
				)
				.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
				.forEach((entry) => {
					entry.dreams.forEach((dream) => {
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
						let currEntry = tmpOnlyDreams.filter((item) => item.entryDate === entry.entryDate)[0]
						if (currEntry) {
							currEntry.dreams.push(dream)
							currEntry.tags = [...currEntry.tags, ...dream.dreamSigns]
						} else {
							tmpOnlyDreams.push({ entryDate: entry.entryDate, dreams: [dream], tags: dream.dreamSigns })
						}
					})
				})

			// tagGroup
			setDreamTagGroups(tagGroups)
		}
		setOnlyDreams(tmpOnlyDreams)

		let tagByCats: IDreamTagByCat[] = []
		tagGroups.forEach((tagGrp) => {
			let tagTag = tagGrp.dreamSign
			let tagCat = tagTag.indexOf(':') ? tagTag.split(':')[0] : tagTag

			let cat = tagByCats.filter((item) => item.dreamCat === tagCat)[0]
			if (cat) cat.dreamTagGroups.push(tagGrp)
			else tagByCats.push({ dreamCat: tagCat, dreamTagGroups: [tagGrp] })
		})
		setTagsByCat(tagByCats)
	}, [props.dataFile, filterText, filterDate])

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

		GDrive.doSaveDataFile()
			.then(() => {
				alert(`Updated ${numUpdated} dreams`)
			})
			.catch((err) => alert(err))
	}

	// -----------------------------------------------------------------------

	function renderFilters(): JSX.Element {
		return (
			<div className='row row-cols g-4 align-items-center justify-content-between mb-4' data-desc='commandbar'>
				<div className='col-12 col-md' data-desc='search tags'>
					<div className='row flex-nowrap align-items-center g-0 bg-black'>
						<div className='col-auto px-2'>
							<Search size={40} className='text-secondary' />
						</div>
						<div className='col'>
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
								<label htmlFor='floatingDreamtag'>
									<Tags /> {tagsByCat.length} cats / <Tag /> {dreamTagGroups.length} tags
								</label>
							</div>
						</div>
					</div>
				</div>
				<div className='col-auto' data-desc='date range'>
					<div className='form-floating'>
						<select
							id='floatingFilterDates'
							placeholder='date range'
							defaultValue={filterDate}
							onChange={(ev) => setFilterDate(ev.currentTarget.value as FilterDate)}
							className='form-control'>
							{Object.keys(FilterDate).map((val) => (
								<option value={FilterDate[val]} key={'entryType' + val}>
									{FilterDate[val]}
								</option>
							))}
						</select>
						<label htmlFor='floatingFilterDates' className='text-nowrap'>
							Date Range
						</label>
					</div>
				</div>
				<div className='col-auto' data-desc='view type'>
					<div className='form-floating'>
						<select
							id='floatingFilterView'
							placeholder='view type'
							defaultValue={filterView}
							onChange={(ev) => setFilterView(ev.currentTarget.value as FilterView)}
							className='form-control'>
							{Object.keys(FilterView).map((val) => (
								<option value={FilterView[val]} key={'filterView' + val}>
									{FilterView[val]}
								</option>
							))}
						</select>
						<label htmlFor='floatingFilterView' className='text-nowrap'>
							View Type
						</label>
					</div>
				</div>
			</div>
		)
	}

	function renderTagUnGrp(): JSX.Element {
		return (
			<section className='bg-black p-4'>
				<div className='row row-cols-auto g-4 justify-content-between'>
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
							<DreamTagCard
								key={`keyTagGrp${idx}`}
								setCurrEntry={(entry: IJournalEntry) => setCurrEntry(entry)}
								setShowModal={(show: boolean) => setShowModal(show)}
								tagGrp={tagGrp}
								viewType={filterViewType}
								doMassUpdateTag={doMassUpdateTag}
							/>
						))}
				</div>
			</section>
		)
	}

	function renderGroupByCat(): JSX.Element {
		return (
			<section className='bg-black p-4'>
				<div className='row row-cols-auto g-4 justify-content-between'>
					{tagsByCat
						.sort((a, b) => (a.dreamCat < b.dreamCat ? -1 : 1))
						.map((catItem, idx) => (
							<div key={`keyCatItem${idx}`} className='col'>
								<div className='card'>
									<div className='card-header bg-black-70 h6'>{catItem.dreamCat}</div>
									<div className='card-body bg-black-90 p-3'>
										{catItem.dreamTagGroups
											.filter(
												(tagGrp) =>
													!searchTerm ||
													tagGrp.dreamSign.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 ||
													searchTerm.indexOf(tagGrp.dreamSign) > -1
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
												<DreamTagCard
													key={`keyTagGrp${idx}`}
													setCurrEntry={(entry: IJournalEntry) => setCurrEntry(entry)}
													setShowModal={(show: boolean) => setShowModal(show)}
													tagGrp={tagGrp}
													viewType={filterViewType}
													doMassUpdateTag={doMassUpdateTag}
												/>
											))}
									</div>
								</div>
							</div>
						))}
				</div>
			</section>
		)
	}

	function renderByDate(): JSX.Element {
		return (
			<section className='bg-black p-4'>
				<div className='row row-cols-auto row-cols-md-4 g-4 justify-content-between'>
					{onlyDreams
						.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
						.map((item, idx) => (
							<div
								key={`byDateKey${idx}`}
								title={Math.abs(Math.round(moment(item.entryDate).diff(moment(new Date()), 'months', true))) + ' months ago'}
								onClick={(_ev) => {
									setCurrEntry(props.dataFile.entries.filter((entry) => entry.entryDate == item.entryDate)[0])
									setShowModal(true)
								}}
								className='col cursor-link user-select-none'
								style={{ minWidth: '65px' }}>
								<div className='bg-danger p-2 text-white align-text-middle rounded-top'>
									<h6 className='mb-0'>
										{MONTHS[Number(moment(item.entryDate).format('M')) - 1]} {moment(item.entryDate).format('DD')}
									</h6>
								</div>
								<div className='bg-black-90 px-2 py-3 rounded-bottom'>
									<div className='row row-cols-1 g-2'>
										{item.tags.sort().map((tag, idy) => (
											<div key={`tagKey${idy}`} className='col'>
												<Tag /> {tag}
											</div>
										))}
										{item.dreams.length === 0 && <Tag />}
									</div>
								</div>
							</div>
						))}
				</div>
			</section>
		)
	}

	return !props.dataFile || !props.dataFile.entries ? (
		<AlertGdriveStatus isBusyLoad={props.isBusyLoad} />
	) : (
		<div className='container my-auto my-md-5'>
			<header>
				<ModalEntry currEntry={currEntry} showModal={showModal} setShowModal={setShowModal} />
				<HeaderMetrics dataFile={props.dataFile} isBusyLoad={props.isBusyLoad} showStats={true} />
			</header>

			<main className='bg-light p-4'>
				{renderFilters()}
				{filterView === FilterView.group && renderGroupByCat()}
				{filterView === FilterView.ungrp && renderTagUnGrp()}
				{filterView === FilterView.dates && renderByDate()}
			</main>
		</div>
	)
}
