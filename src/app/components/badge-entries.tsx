import React, { useState, useEffect } from 'react'
import { DateTime } from 'luxon'
import { CardDreamSignGrpViewType, IDreamSignTagGroup, IDreamTagByCat, IDriveDataFile, IJournalDream, IJournalEntry } from '../app.types'
import { Search, Tag, Tags } from 'react-bootstrap-icons'
import DreamTagCard from './dreamtag-card'

interface Props {
	dataFile: IDriveDataFile
	isBusyLoad: boolean
	setShowModal: (show: boolean) => void
	setCurrEntry: (entry: IJournalEntry) => void
}

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

export default function BadgeEntries(props: Props) {
	const [dreamTagGroups, setDreamTagGroups] = useState<IDreamSignTagGroup[]>([])
	const [tagsByCat, setTagsByCat] = useState<IDreamTagByCat[]>([])
	const [onlyDreams, setOnlyDreams] = useState<IOnlyDream[]>([])
	const [filterText, setFilterText] = useState('')
	const [filterView, setFilterView] = useState(FilterView.group)
	const [filterDate, setFilterDate] = useState(FilterDate.last30)
	const [searchTerm, setSearchTerm] = useState('')
	const [filterViewType, setFilterViewType] = useState<CardDreamSignGrpViewType>(CardDreamSignGrpViewType.sm)
	const [filterSortOrder, setFilterSortOrder] = useState<FilterSortOrder>(FilterSortOrder.title)

	useEffect(() => {
		if (!props.dataFile || !props.dataFile.entries) return

		const tmpOnlyDreams: IOnlyDream[] = []

		const filterDays =
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
		const tagGroups: IDreamSignTagGroup[] = []
		{
			props.dataFile.entries
				.filter((entry) => filterDate === FilterDate.all || DateTime.fromISO(entry.entryDate).startOf('day') >= DateTime.now().minus({ days: filterDays }))
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
						dream.dreamSigns?.forEach((sign) => {
							const tag = tagGroups.filter((tag) => tag.dreamSign === sign)[0]
							if (tag) {
								const existingEntry = tag.dailyEntries.filter((item) => item.entryDate == entry.entryDate)[0]
								if (!existingEntry) tag.dailyEntries.push(entry)
								tag.totalOccurs++
							} else {
								tagGroups.push({ dreamSign: sign, dailyEntries: [entry], totalOccurs: 1 })
							}
						})
						const currEntry = tmpOnlyDreams.filter((item) => item.entryDate === entry.entryDate)[0]
						if (currEntry) {
							const dsigns = dream.dreamSigns ? dream.dreamSigns : []
							currEntry.dreams.push(dream)
							currEntry.tags = [...currEntry.tags, ...dsigns]
						} else {
							tmpOnlyDreams.push({ entryDate: entry.entryDate, dreams: [dream], tags: dream.dreamSigns || [] })
						}
					})
				})

			// tagGroup
			setDreamTagGroups(tagGroups)
		}
		setOnlyDreams(tmpOnlyDreams)

		const tagByCats: IDreamTagByCat[] = []
		tagGroups.forEach((tagGrp) => {
			const tagTag = tagGrp.dreamSign
			const tagCat = tagTag.indexOf(':') ? tagTag.split(':')[0] : tagTag

			const cat = tagByCats.filter((item) => item.dreamCat === tagCat)[0]
			if (cat) cat.dreamTagGroups.push(tagGrp)
			else tagByCats.push({ dreamCat: tagCat, dreamTagGroups: [tagGrp] })
		})
		setTagsByCat(tagByCats)
	}, [props.dataFile, filterText, filterDate])

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
							className='form-select'>
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
							className='form-select'>
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
							else return 0
						})
						.map((tagGrp, idx) => (
							<DreamTagCard
								key={`keyTagGrp${idx}`}
								setCurrEntry={(entry: IJournalEntry) => props.setCurrEntry(entry)}
								setShowModal={(show: boolean) => props.setShowModal(show)}
								tagGrp={tagGrp}
								viewType={filterViewType}
								doMassUpdateTag={(oldTag: string, newTag: string) => true}
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
												else return 0
											})
											.map((tagGrp, idx) => (
												<DreamTagCard
													key={`keyTagGrp${idx}`}
													setCurrEntry={(entry: IJournalEntry) => props.setCurrEntry(entry)}
													setShowModal={(show: boolean) => props.setShowModal(show)}
													tagGrp={tagGrp}
													viewType={filterViewType}
													doMassUpdateTag={(oldTag: string, newTag: string) => true}
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
						.map((item, idx) => {
							const dateEntry = DateTime.fromISO(item.entryDate)
							return (
								<div
									key={`byDateKey${idx}`}
									title={Math.abs(Math.round(dateEntry.diff(DateTime.now(), 'months').months)) + ' months ago'}
									onClick={() => {
										props.setCurrEntry(props.dataFile.entries.filter((entry) => entry.entryDate == item.entryDate)[0])
										props.setShowModal(true)
									}}
									className='col cursor-link user-select-none'
									style={{ minWidth: '65px' }}>
									<div className='bg-danger p-2 text-white align-text-middle rounded-top'>
										<h6 className='mb-0'>{dateEntry.toFormat('LLL dd')}</h6>
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
							)
						})}
				</div>
			</section>
		)
	}

	return (
		<section>
			{renderFilters()}
			{filterView === FilterView.group && renderGroupByCat()}
			{filterView === FilterView.ungrp && renderTagUnGrp()}
			{filterView === FilterView.dates && renderByDate()}
		</section>
	)
}
