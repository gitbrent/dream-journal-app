import React, { useState, useEffect } from 'react'
import { DateTime } from 'luxon'
import { IDreamSignTagGroup, IDreamTagByCat, IDriveDataFile, IJournalDream, IJournalEntry } from './app.types'
import { BarChart, Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Search, Tag, Tags } from 'react-bootstrap-icons'
import AlertGdriveStatus from './components/alert-gstat'
import HeaderMetrics from './components/header-metrics'
import BadgeEntries from './components/badge-entries'
import TableEntries from './components/table-entries'

interface IAppTagsProps {
	dataFile: IDriveDataFile
	isBusyLoad: boolean
	doSaveTagsState: Function
	tagsState: IAppTagsState
}
export interface IAppTagsState {}

interface IChartData {
	/**
	 * Rechart data name
	 * - **REQUIRED**
	 * @example 'Jan-2021`
	 */
	name: string
	/**
	 * `entryDate`
	 * - as an actual date
	 * - for DateTime ops to use
	 */
	dateTime: DateTime
	totLucid: number
	totStard: number
	totTaged: number
	totNotag?: number
}

interface IOnlyDream {
	entryDate: string
	dreams: IJournalDream[]
	tags: string[]
}

export default function TabAdmin(props: IAppTagsProps) {
	const [dreamTagGroups, setDreamTagGroups] = useState<IDreamSignTagGroup[]>([])
	const [tagsByCat, setTagsByCat] = useState<IDreamTagByCat[]>([])
	// TAB: Tag Timeline
	const [chartDataTags, setChartDataTags] = useState<IChartData[]>([])
	const [filterTextTags, setFilterTextTags] = useState('')
	const [filterShowAllMons, setFilterShowAllMons] = useState(true)
	const [tagChartClickedIdx, setTagChartClickedIdx] = useState<number>(null)
	const [tagChartClkEntries, setTagChartClkEntries] = useState<IJournalEntry[]>([])

	useEffect(() => {
		if (!props.dataFile || !props.dataFile.entries) return

		// Tag Groups
		let tmpOnlyDreams: IOnlyDream[] = []
		let tagGroups: IDreamSignTagGroup[] = []
		{
			props.dataFile.entries
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

	/** Gather chart data: tags */
	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			let tmpChartData: IChartData[] = []

			if (!props.dataFile || !props.dataFile.entries) return

			// PERF: dont chart every dream, it causes super-slow page render
			if (!filterTextTags || filterTextTags.length < 3) {
				setChartDataTags([])
				return
			}

			// Tag Groups
			props.dataFile.entries.forEach((entry) => {
				let dateEntry = DateTime.fromISO(entry.entryDate)
				let currChartData = tmpChartData.filter((data) => data.dateTime.hasSame(dateEntry, 'month') && data.dateTime.hasSame(dateEntry, 'year'))[0]
				if (!currChartData) {
					currChartData = {
						name: dateEntry.toFormat('LLL-yy'),
						dateTime: dateEntry,
						totLucid: 0,
						totStard: 0,
						totTaged: 0,
					}
					tmpChartData.push(currChartData)
				}

				if (
					entry.dreams
						.map((dream) => dream.dreamSigns)
						.join(',')
						.toLowerCase()
						.indexOf(filterTextTags.toLowerCase()) > -1
				) {
					currChartData.totTaged += 1
				}
			})

			setChartDataTags(filterShowAllMons ? tmpChartData : tmpChartData.filter((item) => item.totTaged > 0))
		}, 1000)

		return () => clearTimeout(delayDebounceFn)
	}, [filterTextTags, filterShowAllMons])

	/** Handle barchart click: tags  */
	useEffect(() => {
		if (typeof tagChartClickedIdx !== null && chartDataTags && chartDataTags[tagChartClickedIdx]) {
			let dateEntry = chartDataTags[tagChartClickedIdx].dateTime
			setTagChartClkEntries(
				props.dataFile.entries
					.filter(
						(entry) =>
							!filterTextTags ||
							entry.dreams
								.map((dream) => dream.dreamSigns)
								.join(',')
								.toLowerCase()
								.indexOf(filterTextTags.toLowerCase()) > -1
					)
					.filter((entry) => DateTime.fromISO(entry.entryDate).hasSame(dateEntry, 'month') && DateTime.fromISO(entry.entryDate).hasSame(dateEntry, 'year'))
			)
		} else {
			setTagChartClkEntries([])
		}
	}, [props.dataFile, tagChartClickedIdx])

	function renderTabTags(): JSX.Element {
		return (
			<section>
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
										value={filterTextTags}
										placeholder='search tags'
										className='form-control'
										onChange={(event) => setFilterTextTags(event.target.value)}
										disabled={!props.dataFile ? true : false}
									/>
									<label htmlFor='floatingDreamtag'>
										<Tags /> {tagsByCat.length} cats / <Tag /> {dreamTagGroups.length} tags
									</label>
								</div>
							</div>
						</div>
					</div>
					<div className='col-auto' style={{ minWidth: '185px' }} data-desc='show all months'>
						<div className='form-floating'>
							<select
								id='floatingFilterView'
								placeholder='view type'
								defaultValue={filterShowAllMons ? '1' : '0'}
								onChange={(ev) => setFilterShowAllMons(ev.currentTarget.value === '1')}
								className='form-control'>
								<option value='0' key={'showAllMonN'}>
									No
								</option>
								<option value='1' key={'showAllMonY'}>
									Yes
								</option>
							</select>
							<label htmlFor='floatingFilterView' className='text-nowrap'>
								Show All Months
							</label>
						</div>
					</div>
				</div>
				{!chartDataTags || chartDataTags.length === 0 ? (
					<div className='alert alert-secondary'>(no data - enter at least 3 characters above to view chart)</div>
				) : (
					<div className='bg-black p-4 mb-4' style={{ width: '100%', height: 400 }}>
						<ResponsiveContainer width='100%' height='100%'>
							<BarChart
								data={chartDataTags}
								onClick={(data) => setTagChartClickedIdx(data && data.activeTooltipIndex !== null ? data.activeTooltipIndex : null)}>
								<XAxis dataKey='name' fontSize={'0.75rem'} interval='preserveStartEnd' />
								<YAxis type='number' fontSize={'0.75rem'} />
								<CartesianGrid stroke='#5c5c5c' strokeDasharray='6 2' vertical={false} />
								<Tooltip cursor={false} />
								<Legend verticalAlign='bottom' align='center' iconSize={20} />
								<Bar dataKey='totTaged' name='Journal Entries' stackId='a' fill='var(--bs-teal)' />
							</BarChart>
						</ResponsiveContainer>
					</div>
				)}
				{chartDataTags && chartDataTags.length > 0 && typeof tagChartClickedIdx !== null && (
					<section className='bg-black p-4'>
						<TableEntries entries={tagChartClkEntries} isBusyLoad={props.isBusyLoad} />
					</section>
				)}
			</section>
		)
	}

	return !props.dataFile || !props.dataFile.entries ? (
		<AlertGdriveStatus isBusyLoad={props.isBusyLoad} />
	) : (
		<div className='container my-auto my-md-5'>
			<header>
				<HeaderMetrics dataFile={props.dataFile} isBusyLoad={props.isBusyLoad} showStats={true} />
			</header>

			<ul className='nav nav-tabs nav-fill' role='tablist'>
				<li className='nav-item' role='presentation'>
					<a className='nav-link active' id='1-tab' data-toggle='tab' href='#tab1' role='tab' aria-controls='tab1' aria-selected='true'>
						Overview
					</a>
				</li>
				<li className='nav-item' role='presentation'>
					<a className='nav-link' id='2-tab' data-toggle='tab' href='#tab2' role='tab' aria-controls='tab2' aria-selected='false'>
						Timeline
					</a>
				</li>
			</ul>
			<div className='tab-content' id='bsTabContent'>
				<div className='tab-pane bg-light p-4 show active' id='tab1' role='tabpanel' aria-labelledby='1-tab'>
					<BadgeEntries dataFile={props.dataFile} isBusyLoad={props.isBusyLoad} />
				</div>
				<div className='tab-pane bg-light p-4' id='tab2' role='tabpanel' aria-labelledby='2-tab'>
					{renderTabTags()}
				</div>
			</div>
		</div>
	)
}
