import React, { useEffect, useMemo, useState } from 'react'
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
	const TOP = 15
	// TAB: Tag Timeline
	const [chartDataTags, setChartDataTags] = useState<IChartData[]>([])
	const [filterTextTags, setFilterTextTags] = useState('')
	const [filterShowAllMons, setFilterShowAllMons] = useState(true)
	const [tagChartClickedIdx, setTagChartClickedIdx] = useState<number>(null)
	const [tagChartClkEntries, setTagChartClkEntries] = useState<IJournalEntry[]>([])

	const dreamTagGroups = useMemo(() => {
		if (!props.dataFile || !props.dataFile.entries) return []
		else return getGroupedTags(props.dataFile.entries)
	}, [props.dataFile])

	const tagsByCat = useMemo(() => {
		let tagByCats: IDreamTagByCat[] = []

		dreamTagGroups.forEach((tagGrp) => {
			let tagTag = tagGrp.dreamSign
			let tagCat = tagTag.indexOf(':') ? tagTag.split(':')[0] : tagTag
			let cat = tagByCats.filter((item) => item.dreamCat === tagCat)[0]

			if (cat) {
				cat.dreamTagGroups.push(tagGrp)
			} else {
				tagByCats.push({ dreamCat: tagCat, dreamTagGroups: [tagGrp] })
			}
		})

		return tagByCats
	}, [dreamTagGroups])

	const tagsByTop = useMemo(() => {
		return dreamTagGroups
	}, [dreamTagGroups])

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

	// ------------------------------------------------------------------------

	function getGroupedTags(entries: IJournalEntry[]): IDreamSignTagGroup[] {
		let tmpOnlyDreams: IOnlyDream[] = []
		let tagGroups: IDreamSignTagGroup[] = []

		entries
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

		return tagGroups
	}

	function getEntriesForLastMonths(months: number) {
		let tmpEntries: IJournalEntry[] = []
		let dateMaxAge = DateTime.now()
			.minus({ months: months - 1 })
			.set({ day: 0, hour: 0, minute: 0, second: 0 })

		if (props.dataFile && props.dataFile.entries && props.dataFile.entries.length > 0) {
			tmpEntries = props.dataFile.entries.filter((entry) => DateTime.fromISO(entry.entryDate) > dateMaxAge)
		}

		return tmpEntries
	}

	// ------------------------------------------------------------------------

	function renderTags(tags: IDreamSignTagGroup[], title: string): JSX.Element {
		return (
			<div className='card h-100'>
				<div className='card-header bg-info h6'>{title}</div>
				<div className='card-body bg-black-90 p-0'>
					{tags.map((tagGrp, idx) => (
						<div key={`topTag${idx}`} className='col text-white user-select-none'>
							<div className='row g-0 flex-nowrap bg-info border-bottom'>
								<div className='col py-1 px-3 text-break bg-trans-50'>{tagGrp.dreamSign}</div>
								<div className='col-auto py-1 px-3 text-white-50 text-monospace text-end bg-trans-75' style={{ minWidth: 55 }}>
									{tagGrp.totalOccurs}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		)
	}

	function renderTopTags(): JSX.Element {
		const TopAllTime = tagsByTop.sort((a, b) => (a.totalOccurs > b.totalOccurs ? -1 : 1)).filter((_item, idx) => idx < TOP)
		const TopMonths72 = getGroupedTags(getEntriesForLastMonths(72))
			.sort((a, b) => (a.totalOccurs > b.totalOccurs ? -1 : 1))
			.filter((_item, idx) => idx < TOP)
		const TopMonths12 = getGroupedTags(getEntriesForLastMonths(12))
			.sort((a, b) => (a.totalOccurs > b.totalOccurs ? -1 : 1))
			.filter((_item, idx) => idx < TOP)
		const TopMonths03 = getGroupedTags(getEntriesForLastMonths(3))
			.sort((a, b) => (a.totalOccurs > b.totalOccurs ? -1 : 1))
			.filter((_item, idx) => idx < TOP)

		return (
			<section className='bg-black p-4 text-sm'>
				<div className='row row-cols justify-content-between g-4'>
					<div className='col'>{renderTags(TopAllTime, `All Time`)}</div>
					<div className='col'>{renderTags(TopMonths72, `Last 72 Months`)}</div>
					<div className='col'>{renderTags(TopMonths12, `Last 12 Months`)}</div>
					<div className='col'>{renderTags(TopMonths03, `Last 3 Months`)}</div>
				</div>
			</section>
		)
	}

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
					<div className='col-auto' style={{ minWidth: '200px' }} data-desc='show all months'>
						<div className='form-floating'>
							<select
								id='floatingFilterView'
								placeholder='view type'
								defaultValue={filterShowAllMons ? '1' : '0'}
								onChange={(ev) => setFilterShowAllMons(ev.currentTarget.value === '1')}
								className='form-select'>
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

	// ------------------------------------------------------------------------

	return !props.dataFile || !props.dataFile.entries ? (
		<AlertGdriveStatus isBusyLoad={props.isBusyLoad} />
	) : (
		<div className='container my-auto my-md-5'>
			<HeaderMetrics dataFile={props.dataFile} isBusyLoad={props.isBusyLoad} showStats={true} />

			<ul className='nav nav-tabs nav-fill' id='tagsTab' role='tablist'>
				<li className='nav-item' role='presentation'>
					<button
						className='nav-link active'
						id='3-tab'
						data-bs-toggle='tab'
						data-bs-target='#tab3'
						type='button'
						role='tab'
						aria-controls='tab3'
						aria-selected='false'>
							{`Top ${TOP} Tags`}
					</button>
				</li>
				<li className='nav-item' role='presentation'>
					<button className='nav-link' id='1-tab' data-bs-toggle='tab' data-bs-target='#tab1' type='button' role='tab' aria-controls='tab1' aria-selected='true'>
						Overview
					</button>
				</li>
				<li className='nav-item' role='presentation'>
					<button className='nav-link' id='2-tab' data-bs-toggle='tab' data-bs-target='#tab2' type='button' role='tab' aria-controls='tab2' aria-selected='false'>
						Timeline
					</button>
				</li>
			</ul>
			<div className='tab-content'>
				<div className='tab-pane bg-light p-4 active' id='tab3' role='tabpanel' aria-labelledby='3-tab'>
					{renderTopTags()}
				</div>
				<div className='tab-pane bg-light p-4' id='tab1' role='tabpanel' aria-labelledby='1-tab'>
					<BadgeEntries dataFile={props.dataFile} isBusyLoad={props.isBusyLoad} />
				</div>
				<div className='tab-pane bg-light p-4' id='tab2' role='tabpanel' aria-labelledby='2-tab'>
					{renderTabTags()}
				</div>
			</div>
		</div>
	)
}
