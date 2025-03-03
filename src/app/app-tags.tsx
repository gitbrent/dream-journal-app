import { useContext, useEffect, useMemo, useState } from 'react'
import { DateTime } from 'luxon'
import { IDreamSignTagGroup, IDreamTagByCat, IJournalDream, IJournalEntry } from './app.types'
import { BarChart, Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Search, Tag, Tags } from 'react-bootstrap-icons'
import { DataContext } from '../api-google/DataContext'
import AlertGdriveStatus from './components/alert-gstat'
import HeaderMetrics from './components/header-metrics'
import BadgeEntries from './components/badge-entries'
import TableEntries from './components/table-entries'

interface IAppTagsProps {
	setShowModal: (show: boolean) => void
	setCurrEntry: (entry: IJournalEntry) => void
}
export interface IAppTagsState {
	thisIsAplaceholder: string
}

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

export default function TabTags(props: IAppTagsProps) {
	const TOP = 20 //15
	const { isLoading, driveDataFile } = useContext(DataContext)
	// TAB: Tag Timeline
	const [chartDataTags, setChartDataTags] = useState<IChartData[]>([])
	const [tagChartClickedIdx, setTagChartClickedIdx] = useState(0)
	const [tagChartClkEntries, setTagChartClkEntries] = useState<IJournalEntry[]>([])
	// FILTERS
	const [textFilter, setTextFilter] = useState('')
	const [showAllMons, setShowAllMons] = useState(true)

	/**
	 * all entries from datafile, sorted old->new
	 * @desc only parse datafile once
	 */
	const datafileEntries = useMemo(() => {
		const tempEntries = driveDataFile?.entries || []
		return tempEntries.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
	}, [driveDataFile])

	const dreamTagGroups = useMemo(() => {
		return getGroupedTags(driveDataFile && driveDataFile.entries ? driveDataFile.entries : [])
	}, [driveDataFile])

	const tagsByCat = useMemo(() => {
		const tagByCats: IDreamTagByCat[] = []

		dreamTagGroups.forEach((tagGrp) => {
			const tagTag = tagGrp.dreamSign
			const tagCat = tagTag.indexOf(':') ? tagTag.split(':')[0] : tagTag
			const cat = tagByCats.filter((item) => item.dreamCat === tagCat)[0]

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
			const tmpChartData: IChartData[] = []

			if (!driveDataFile || !driveDataFile.entries) return

			// PERF: dont chart every dream, it causes super-slow page render
			if (!textFilter || textFilter.length < 3) {
				setChartDataTags([])
				return
			}

			// Tag Groups
			driveDataFile.entries.forEach((entry) => {
				const dateEntry = DateTime.fromISO(entry.entryDate)
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
						.indexOf(textFilter.toLowerCase()) > -1
				) {
					currChartData.totTaged += 1
				}
			})

			setChartDataTags(showAllMons ? tmpChartData : tmpChartData.filter((item) => item.totTaged > 0))
		}, 1000)

		return () => clearTimeout(delayDebounceFn)
	}, [textFilter, showAllMons, driveDataFile])

	/** Handle barchart click: tags */
	useEffect(() => {
		if (driveDataFile && !isNaN(tagChartClickedIdx) && chartDataTags && chartDataTags[tagChartClickedIdx]) {
			const dateEntry = chartDataTags[tagChartClickedIdx].dateTime
			setTagChartClkEntries(
				driveDataFile.entries
					.filter(
						(entry) =>
							!textFilter ||
							entry.dreams
								.map((dream) => dream.dreamSigns)
								.join(',')
								.toLowerCase()
								.indexOf(textFilter.toLowerCase()) > -1
					)
					.filter((entry) => DateTime.fromISO(entry.entryDate).hasSame(dateEntry, 'month') && DateTime.fromISO(entry.entryDate).hasSame(dateEntry, 'year'))
			)
		} else {
			setTagChartClkEntries([])
		}
	}, [chartDataTags, driveDataFile, tagChartClickedIdx, textFilter])

	// ------------------------------------------------------------------------

	function getGroupedTags(entries: IJournalEntry[]): IDreamSignTagGroup[] {
		const tmpOnlyDreams: IOnlyDream[] = []
		const tagGroups: IDreamSignTagGroup[] = []

		entries
			.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
			.forEach((entry) => {
				entry.dreams.forEach((dream) => {
					dream.dreamSigns?.forEach((sign) => {
						const tag = tagGroups.filter((tag) => tag.dreamSign === sign)[0]
						if (tag) {
							const existingEntry = tag.dailyEntries.filter((item) => item.entryDate === entry.entryDate)[0]
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

		return tagGroups
	}

	function getEntriesForLastMonths(months: number) {
		const dateMaxAge = DateTime.now()
			.minus({ months: months - 1 })
			.set({ day: 0, hour: 0, minute: 0, second: 0 })

		return datafileEntries.filter((entry) => DateTime.fromISO(entry.entryDate) > dateMaxAge)
	}

	// ------------------------------------------------------------------------

	function renderTags(tags: IDreamSignTagGroup[], title: string): JSX.Element {
		return (
			<div className='card h-100'>
				<div className='card-header bg-primary h6'>{title}</div>
				<div className='card-body p-0'>
					<ul className="list-group list-group-flush">
						{tags.map((tagGrp, idx) => (
							<li key={`topTag${idx}`} className="list-group-item d-flex justify-content-between align-items-center">
								{tagGrp.dreamSign}
								<span className="badge text-bg-primary rounded-pill">{tagGrp.totalOccurs}</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		)
	}

	function renderTopTags(): JSX.Element {
		const topAllTime = tagsByTop.sort((a, b) => (a.totalOccurs > b.totalOccurs ? -1 : 1)).filter((_item, idx) => idx < TOP)
		const topMonths72 = getGroupedTags(getEntriesForLastMonths(72))
			.sort((a, b) => (a.totalOccurs > b.totalOccurs ? -1 : 1))
			.filter((_item, idx) => idx < TOP)
		const topMonths12 = getGroupedTags(getEntriesForLastMonths(12))
			.sort((a, b) => (a.totalOccurs > b.totalOccurs ? -1 : 1))
			.filter((_item, idx) => idx < TOP)
		const topMonths03 = getGroupedTags(getEntriesForLastMonths(3))
			.sort((a, b) => (a.totalOccurs > b.totalOccurs ? -1 : 1))
			.filter((_item, idx) => idx < TOP)

		return (
			<section className='bg-black p-4 text-sm'>
				<div className='row row-cols justify-content-between g-4'>
					<div className='col'>{renderTags(topAllTime, 'All Time')}</div>
					<div className='col'>{renderTags(topMonths72, 'Last 72 Months')}</div>
					<div className='col'>{renderTags(topMonths12, 'Last 12 Months')}</div>
					<div className='col'>{renderTags(topMonths03, 'Last 3 Months')}</div>
				</div>
			</section>
		)
	}

	function renderTagsByYear(): JSX.Element {
		const YEARS = 4

		// STEP 1:
		const allButThisYear = getGroupedTags(datafileEntries.filter((entry) => !entry.entryDate.startsWith('2022')))
		const tags2022 = getGroupedTags(datafileEntries.filter((entry) => entry.entryDate.startsWith('2022')))
		const tags2021 = getGroupedTags(datafileEntries.filter((entry) => entry.entryDate.startsWith('2021')))
		const diffPrevYear = tags2022.map((item) => item.dreamSign).filter((el) => !tags2021.map((item) => item.dreamSign).includes(el))
		const diffAllTime = tags2022.map((item) => item.dreamSign).filter((el) => !allButThisYear.map((item) => item.dreamSign).includes(el))
		const newPrevYear = tags2022
			.filter((item) => diffPrevYear.includes(item.dreamSign))
			.sort((a, b) => (a.totalOccurs > b.totalOccurs ? -1 : 1))
			.filter((_item, idx) => idx < TOP)
		const newAllTime = tags2022
			.filter((item) => diffAllTime.includes(item.dreamSign))
			.sort((a, b) => (a.totalOccurs > b.totalOccurs ? -1 : 1))
			.filter((_item, idx) => idx < TOP)

		// STEP 2: tags from prev years not present in last 5 years
		const tagsOlder = getGroupedTags(datafileEntries.filter((entry) => DateTime.fromISO(entry.entryDate).diffNow('months').months < -(YEARS * 12)))
		const tagsNewer = getGroupedTags(datafileEntries.filter((entry) => DateTime.fromISO(entry.entryDate).diffNow('months').months > -(YEARS * 12)))
		const diffOldTags = tagsOlder.map((item) => item.dreamSign).filter((el) => !tagsNewer.map((item) => item.dreamSign).includes(el))
		const oldTags = tagsOlder
			.filter((item) => diffOldTags.includes(item.dreamSign))
			.sort((a, b) => (a.totalOccurs > b.totalOccurs ? -1 : 1))
			.filter((_item, idx) => idx < TOP)

		return (
			<section className='bg-black p-4 text-sm'>
				<div className='row row-cols justify-content-between g-4'>
					<div className='col'>{renderTags(newAllTime, 'Brand New This Year')}</div>
					<div className='col'>{renderTags(newPrevYear, 'Not Found Last Year')}</div>
					<div className='col'>{renderTags(oldTags, `Not Seen in Past ${YEARS} Years`)}</div>
				</div>
			</section>
		)
	}

	function renderTabTags(): JSX.Element {
		return (
			<section className='p-4'>
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
										value={textFilter}
										placeholder='search tags'
										className='form-control'
										onChange={(event) => setTextFilter(event.target.value)}
										disabled={!driveDataFile ? true : false}
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
								defaultValue={showAllMons ? '1' : '0'}
								onChange={(ev) => setShowAllMons(ev.currentTarget.value === '1')}
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
								onClick={(data) => setTagChartClickedIdx(data?.activeTooltipIndex || 0)}>
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
				{chartDataTags && chartDataTags.length > 0 && !isNaN(tagChartClickedIdx) && (
					<section className='bg-black p-4'>
						<TableEntries entries={tagChartClkEntries} isBusyLoad={isLoading} setShowModal={props.setShowModal} setCurrEntry={props.setCurrEntry} />
					</section>
				)}
			</section>
		)
	}

	// ------------------------------------------------------------------------

	return !driveDataFile?.entries ? (
		<AlertGdriveStatus isBusyLoad={isLoading} />
	) : (
		<section className='m-2 m-md-4'>
			<HeaderMetrics isBusyLoad={isLoading} showStats={true} />

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
						Top Tags
					</button>
				</li>
				<li className='nav-item' role='presentation'>
					<button className='nav-link' id='4-tab' data-bs-toggle='tab' data-bs-target='#tab4' type='button' role='tab' aria-controls='tab4' aria-selected='true'>
						New Tags
					</button>
				</li>
				<li className='nav-item' role='presentation'>
					<button className='nav-link' id='1-tab' data-bs-toggle='tab' data-bs-target='#tab1' type='button' role='tab' aria-controls='tab1' aria-selected='true'>
						Tag Groups
					</button>
				</li>
				<li className='nav-item' role='presentation'>
					<button className='nav-link' id='2-tab' data-bs-toggle='tab' data-bs-target='#tab2' type='button' role='tab' aria-controls='tab2' aria-selected='false'>
						Tag Timeline
					</button>
				</li>
			</ul>
			<div className='tab-content'>
				<div className='tab-pane active' id='tab3' role='tabpanel' aria-labelledby='3-tab'>
					{renderTopTags()}
				</div>
				<div className='tab-pane' id='tab4' role='tabpanel' aria-labelledby='4-tab'>
					{renderTagsByYear()}
				</div>
				<div className='tab-pane' id='tab1' role='tabpanel' aria-labelledby='1-tab'>
					<BadgeEntries dataFile={driveDataFile} isBusyLoad={isLoading} setShowModal={props.setShowModal} setCurrEntry={props.setCurrEntry} />
				</div>
				<div className='tab-pane' id='tab2' role='tabpanel' aria-labelledby='2-tab'>
					{renderTabTags()}
				</div>
			</div>
		</section>
	)
}
