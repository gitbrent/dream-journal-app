import React, { useState, useEffect } from 'react'
import { CardDreamSignGrpViewType, IDreamSignTagGroup, IDreamTagByCat, IDriveFile, IJournalEntry } from './app.types'
import { InfoCircle, Search } from 'react-bootstrap-icons'
import DreamTagCard from './components/dreamtag-card'
import * as GDrive from './google-oauth'
import AlertGdriveStatus from './components/alert-gstat'
import HeaderMetrics from './components/header-metrics'
import ModalEntry from './modal-entry'

interface IAppTagsProps {
	dataFile: IDriveFile
	isBusyLoad: boolean
	doSaveTagsState: Function
	tagsState: IAppTagsState
}
export interface IAppTagsState {}

enum FilterEntry {
	all = '(Show All)',
	lucid = 'Lucid Dream',
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
	//
	const [filterText, setFilterText] = useState('')
	const [filterEntry, setFilterEntry] = useState<FilterEntry>(FilterEntry.all)
	const [searchTerm, setSearchTerm] = useState('')
	const [filterViewType, setFilterViewType] = useState<CardDreamSignGrpViewType>(CardDreamSignGrpViewType.sm)
	const [filterSortOrder, setFilterSortOrder] = useState<FilterSortOrder>(FilterSortOrder.title)

	useEffect(() => {
		if (!props.dataFile || !props.dataFile.entries) return

		// Tag Groups
		let tagGroups: IDreamSignTagGroup[] = []
		{
			props.dataFile.entries
				.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
				.forEach((entry) => {
					entry.dreams.forEach((dream) =>
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
					)
				})

			// tagGroup
			setDreamTagGroups(tagGroups)
		}

		// TODO: WIP:
		let tagByCats: IDreamTagByCat[] = []
		tagGroups.forEach((tagGrp) => {
			let tagTag = tagGrp.dreamSign
			let tagCat = tagTag.indexOf(':') ? tagTag.split(':')[0] : tagTag

			let cat = tagByCats.filter((item) => item.dreamCat === tagCat)[0]
			if (cat) cat.dreamTagGroups.push(tagGrp)
			else tagByCats.push({ dreamCat: tagCat, dreamTagGroups: [tagGrp] })
		})
		setTagsByCat(tagByCats)
	}, [props.dataFile])

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

		GDrive.doSaveFile()
			.then(() => {
				alert(`Updated ${numUpdated} dreams`)
			})
			.catch((err) => alert(err))
	}

	// -----------------------------------------------------------------------

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
				{/*
				<div className='col-auto' data-desc='entry type'>
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
				*/}
			</div>
		)
	}

	function renderTagGroups(): JSX.Element {
		return (
			<section className='bg-light p-4'>
				<div className='row mb-3'>
					<div className='col'>
						<h5 className='text-primary'>Search Dream Tags</h5>
					</div>
					<div className='col-auto'>
						<h5 className='text-primary'>Unique Tags: {dreamTagGroups.length}</h5>
					</div>
				</div>

				<div className='row align-items-center border-top border-secondary py-3 mb-3' data-desc='commandbar'>
					<div className='col-auto d-none d-md-block'>
						<Search size={48} className='text-secondary' />
					</div>
					<div className='col-12 col-md mb-3 mb-md-0'>
						<label className='text-uppercase text-muted'>DreamSign/Tag</label>
						<input
							type='text'
							value={searchTerm}
							className='form-control'
							onChange={(event) => setSearchTerm(event.target.value)}
							disabled={!props.dataFile ? true : false}
						/>
					</div>
					<div className='col-auto'>
						<label className='text-uppercase text-muted'>Display</label>
						<select
							defaultValue={filterViewType}
							onChange={(ev) => setFilterViewType(ev.currentTarget.value as CardDreamSignGrpViewType)}
							className='form-control'>
							{Object.keys(CardDreamSignGrpViewType).map((val) => (
								<option value={CardDreamSignGrpViewType[val]} key={'viewType' + val}>
									{CardDreamSignGrpViewType[val]}
								</option>
							))}
						</select>
					</div>
					<div className='col-auto'>
						<label className='text-uppercase text-muted'>Sort Order</label>
						<select defaultValue={filterSortOrder} onChange={(ev) => setFilterSortOrder(ev.currentTarget.value as FilterSortOrder)} className='form-control'>
							{Object.keys(FilterSortOrder).map((val) => (
								<option value={FilterSortOrder[val]} key={'sortOrder' + val}>
									{FilterSortOrder[val]}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className='card-deck'>
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

	// WIP:
	function renderTagsByCat(): JSX.Element {
		let filteredEntries = tagsByCat.filter(
			(entry) =>
				!filterText ||
				entry.dreamTagGroups
					.map((item) => item.dreamSign)
					.join()
					.indexOf(filterText.toLowerCase()) > -1 ||
				entry.dreamCat.toLowerCase().indexOf(filterText.toLowerCase()) > -1
			// && (filterEntry === FilterEntry.all ||	(filterEntry === FilterEntry.lucid && entry.dreamTagGroups.map(item => item.dailyEntries).map(items=>items.map(item=>item.dreams)).filter(dream=>dream.)
			// (filterEntry === FilterEntry.lucid && entry.dreams.filter((dream) => dream.isLucidDream).length > 0)
		)

		return (
			<section className='bg-light p-4'>
				<div className='row mb-3'>
					<div className='col'>
						<h5 className='text-primary'>Search Dream Tags</h5>
					</div>
					<div className='col-auto'>
						<h5 className='text-primary'>
							{tagsByCat.length} Categories ({dreamTagGroups.length} Tags)
						</h5>
					</div>
				</div>
				{renderFilters()}

				<div className='row row-cols-auto g-3 justify-content-between'>
					{filteredEntries
						.sort((a, b) => (a.dreamCat < b.dreamCat ? -1 : 1))
						.map((catItem, idx) => (
							<div key={`keyCatItem${idx}`} className='col'>
								<div className='card'>
									<div className='card-header bg-black-70 h6'>{catItem.dreamCat}</div>
									<div className='card-body bg-black-90 p-2'>
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

	return !props.dataFile || !props.dataFile.entries ? (
		<AlertGdriveStatus isBusyLoad={props.isBusyLoad} />
	) : (
		<main className='container my-auto my-md-5'>
			<ModalEntry currEntry={currEntry} showModal={showModal} setShowModal={setShowModal} />

			<HeaderMetrics dataFile={props.dataFile} isBusyLoad={props.isBusyLoad} showStats={true} />

			{renderTagsByCat()}
			{/*renderTagGroups()*/}
		</main>
	)
}
