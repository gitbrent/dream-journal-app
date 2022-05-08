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
import { IDreamSignTagGroup, IDreamTagByCat, IDriveConfFile, IDriveDataFile, IJournalEntry, MetaType } from './app.types'
import { DateTime } from 'luxon'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Search, Tag, Tags } from 'react-bootstrap-icons'
import AlertGdriveStatus from './components/alert-gstat'
import HeaderMetrics from './components/header-metrics'
import TableEntries from './components/table-entries'

/**
 * TODO:
 * - ability to take a tag and chart it over years
 * CHART
 * | ---- | ---- | ---- |
 * | 2010 | 2011 | 2012 |
 * | ---- | ---- | ---- |
 * | Drm1 | drm6 | drm8 |
 * | Drm1 | drm6 | drm8 |
 * | Drm1 |      |      |
 */

export interface ITabStateExplore {}
export interface Props {
	confFile: IDriveConfFile
	dataFile: IDriveDataFile
	isBusyLoad: boolean
	setTabState: Function
	tabState: ITabStateExplore
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

export default function TabExplore(props: Props) {
	// TAB: Dream Timeline
	const [chartDataDreams, setChartDataDreams] = useState<IChartData[]>([])
	const [filterDrmChtMonths, setFilterDrmChtMonths] = useState(12)
	const [filterDrmChtShowNotag, setFilterDrmChtShowNotag] = useState(true)
	const [filterDrmChtShowTaged, setFilterDrmChtShowTaged] = useState(true)
	const [drmChartClickedIdx, setDrmChartClickedIdx] = useState<number>(null)
	const [drmChartClkEntries, setDrmChartClkEntries] = useState<IJournalEntry[]>([])
	// TAB: Tag Timeline
	const [dreamTagGroups, setDreamTagGroups] = useState<IDreamSignTagGroup[]>([])
	const [tagsByCat, setTagsByCat] = useState<IDreamTagByCat[]>([])
	const [chartDataTags, setChartDataTags] = useState<IChartData[]>([])
	const [filterTextTags, setFilterTextTags] = useState('')
	const [filterShowAllMons, setFilterShowAllMons] = useState(true)
	const [tagChartClickedIdx, setTagChartClickedIdx] = useState<number>(null)
	const [tagChartClkEntries, setTagChartClkEntries] = useState<IJournalEntry[]>([])

	/** Gather chart data: dreams */
	useEffect(() => {
		let dateMaxAge = DateTime.now()
			.minus({ months: filterDrmChtMonths - 1 })
			.set({ day: 0, hour: 0, minute: 0, second: 0 })
		let tmpChartData: IChartData[] = []

		if (props.dataFile && props.dataFile.entries && props.dataFile.entries.length > 0) {
			props.dataFile.entries.forEach((entry) => {
				let dateEntry = DateTime.fromISO(entry.entryDate)

				if (dateEntry > dateMaxAge) {
					let currChartData = tmpChartData.filter((data) => data.dateTime.hasSame(dateEntry, 'month') && data.dateTime.hasSame(dateEntry, 'year'))[0]
					if (!currChartData) {
						currChartData = {
							name: dateEntry.toFormat('LLL-yy'),
							dateTime: dateEntry,
							totLucid: 0,
							totStard: 0,
							totTaged: 0,
							totNotag: 0,
						}
						tmpChartData.push(currChartData)
					}

					entry.dreams.forEach((dream) => {
						currChartData.totTaged += dream.dreamSigns.length > 0 ? 1 : 0
						currChartData.totNotag += dream.dreamSigns.length > 0 ? 0 : 1
						currChartData.totLucid += dream.isLucidDream ? 1 : 0
						currChartData.totStard += dream.dreamSigns.filter((tag) => tag === MetaType.star).length > 0 ? 1 : 0
					})
				}
			})
		}

		setChartDataDreams(tmpChartData)
	}, [props.dataFile, filterDrmChtMonths])

	/** Handle barchart click: dreams  */
	useEffect(() => {
		if (typeof drmChartClickedIdx !== null && chartDataDreams && chartDataDreams[drmChartClickedIdx]) {
			let dateEntry = chartDataDreams[drmChartClickedIdx].dateTime
			setDrmChartClkEntries(
				props.dataFile.entries.filter(
					(entry) => DateTime.fromISO(entry.entryDate).hasSame(dateEntry, 'month') && DateTime.fromISO(entry.entryDate).hasSame(dateEntry, 'year')
				)
			)
		} else {
			setDrmChartClkEntries([])
		}
	}, [props.dataFile, drmChartClickedIdx])

	/** Gather tag groups */
	useEffect(() => {
		if (!props.dataFile || !props.dataFile.entries) return

		// Tag Groups
		let tagGroups: IDreamSignTagGroup[] = []
		{
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
	}, [props.dataFile, filterTextTags])

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

	// -----------------------------------------------------------------------

	// FUTURE: get fancier fills, not just plain bs-colors (use strips and transparency like sample on desktop shows)
	function renderTabDreams(): JSX.Element {
		return (
			<section>
				<div className='row row-cols g-4 align-items-center justify-content-between mb-4' data-desc='commandbar'>
					<div className='col'>
						<div className='form-floating'>
							<select
								id='floatingShowUntag'
								placeholder='show untagged dreams'
								defaultValue={filterDrmChtShowNotag ? 'Yes' : 'No'}
								onChange={(ev) => setFilterDrmChtShowNotag(ev.currentTarget.value == 'Yes')}
								className='form-control'>
								<option value={'Yes'}>Yes</option>
								<option value={'No'}>No</option>
							</select>
							<label htmlFor='floatingShowUntag' className='text-nowrap'>
								Show Un-Tagged Dreams?
							</label>
						</div>
					</div>
					<div className='col'>
						<div className='form-floating'>
							<select
								id='floatingShowTaged'
								placeholder='show untagged dreams'
								defaultValue={filterDrmChtShowNotag ? 'Yes' : 'No'}
								onChange={(ev) => setFilterDrmChtShowTaged(ev.currentTarget.value == 'Yes')}
								className='form-control'>
								<option value={'Yes'}>Yes</option>
								<option value={'No'}>No</option>
							</select>
							<label htmlFor='floatingShowTaged' className='text-nowrap'>
								Show Tagged Dreams?
							</label>
						</div>
					</div>
					<div className='col'>
						<div className='form-floating'>
							<select
								id='floatingMonthsShown'
								placeholder='months shown'
								defaultValue={filterDrmChtMonths}
								onChange={(ev) => setFilterDrmChtMonths(Number(ev.currentTarget.value))}
								className='form-control'>
								<option value={6}>6</option>
								<option value={12}>12</option>
								<option value={18}>18</option>
								<option value={24}>24</option>
								<option value={36}>36</option>
								<option value={48}>48</option>
							</select>
							<label htmlFor='floatingMonthsShown' className='text-nowrap'>
								Month Range
							</label>
						</div>
					</div>
				</div>
				<div className='bg-black p-4 mb-4' style={{ width: '100%', height: 400 }}>
					<ResponsiveContainer width='100%' height='100%'>
						<BarChart data={chartDataDreams} onClick={(data) => setDrmChartClickedIdx(data && data.activeTooltipIndex !== null ? data.activeTooltipIndex : null)}>
							<XAxis dataKey='name' fontSize={'0.75rem'} />
							<YAxis type='number' fontSize={'0.75rem'} /*domain={[0, (dataMax: number) => Math.round(dataMax * 1.1)]}*/ />
							<CartesianGrid stroke='#555555' strokeDasharray='6 2' vertical={false} />
							<Tooltip cursor={false} />
							<Legend verticalAlign='bottom' align='center' iconSize={20} />
							{/*<Legend layout='horizontal' verticalAlign='bottom' align='center' wrapperStyle={{ position: 'relative' }} />*/}
							{filterDrmChtShowNotag && <Bar dataKey='totNotag' name='Untagged' stackId='a' fill='var(--bs-primary)' />}
							{filterDrmChtShowTaged && <Bar dataKey='totTaged' name='Tagged' stackId='a' fill='var(--bs-info)' />}
							<Bar dataKey='totLucid' name='Lucid Dream' stackId='a' fill='var(--bs-success)' />
							<Bar dataKey='totStard' name='Starred' stackId='a' fill='var(--bs-warning)' />
						</BarChart>
					</ResponsiveContainer>
				</div>
				{typeof drmChartClickedIdx !== null && (
					<section className='bg-black p-4'>
						<TableEntries entries={drmChartClkEntries} isBusyLoad={props.isBusyLoad} />
					</section>
				)}
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

	// -----------------------------------------------------------------------

	return !props.dataFile || !props.dataFile.entries ? (
		<AlertGdriveStatus isBusyLoad={props.isBusyLoad} />
	) : (
		<section className='container my-auto my-md-5'>
			<header>
				<HeaderMetrics dataFile={props.dataFile} isBusyLoad={props.isBusyLoad} showStats={true} />
			</header>

			<ul className='nav nav-tabs nav-fill' role='tablist'>
				<li className='nav-item' role='presentation'>
					<a className='nav-link active' id='1-tab' data-toggle='tab' href='#tab1' role='tab' aria-controls='tab1' aria-selected='true'>
						Dream Timeline
					</a>
				</li>
				<li className='nav-item' role='presentation'>
					<a className='nav-link' id='2-tab' data-toggle='tab' href='#tab2' role='tab' aria-controls='tab2' aria-selected='false'>
						Tag Timeline
					</a>
				</li>
				{/*
					<li className='nav-item' role='presentation'>
						<a className='nav-link' id='3-tab' data-toggle='tab' href='#tab3' role='tab' aria-controls='tab3' aria-selected='false'>
							???
						</a>
					</li>
				*/}
			</ul>
			<div className='tab-content' id='bsTabContent'>
				<div className='tab-pane bg-light p-4 show active' id='tab1' role='tabpanel' aria-labelledby='1-tab'>
					{renderTabDreams()}
				</div>
				<div className='tab-pane bg-light p-4' id='tab2' role='tabpanel' aria-labelledby='2-tab'>
					{renderTabTags()}
				</div>
				{/*
					<div className='tab-pane bg-light p-4' id='tab3' role='tabpanel' aria-labelledby='3-tab'>
						{renderTabChart()}
					</div>
				*/}
			</div>
		</section>
	)
}
