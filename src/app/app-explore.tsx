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
import { IDriveConfFile, IDriveDataFile, IJournalEntry, MetaType } from './app.types'
import { DateTime } from 'luxon'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import AlertGdriveStatus from './components/alert-gstat'
import HeaderMetrics from './components/header-metrics'
import TableEntries from './components/table-entries'
import { Search } from 'react-bootstrap-icons'

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
	const [filterText, setFilterText] = useState('')
	// TAB: Dream Timeline
	const [chartDataDreams, setChartDataDreams] = useState<IChartData[]>([])
	const [filterDrmChtMonths, setFilterDrmChtMonths] = useState(12)
	const [filterDrmChtShowStard, setFilterDrmChtShowStard] = useState(true)
	const [filterDrmChtShowNotag, setFilterDrmChtShowNotag] = useState(true)
	const [filterDrmChtShowTaged, setFilterDrmChtShowTaged] = useState(true)
	const [drmChartClickedIdx, setDrmChartClickedIdx] = useState<number>(null)
	const [drmChartClkEntries, setDrmChartClkEntries] = useState<IJournalEntry[]>([])

	/** Gather chart data: dreams */
	useEffect(() => {
		let dateMaxAge = DateTime.now()
			.minus({ months: filterDrmChtMonths - 1 })
			.set({ day: 0, hour: 0, minute: 0, second: 0 })
		let tmpChartData: IChartData[] = []

		if (props.dataFile && props.dataFile.entries && props.dataFile.entries.length > 0) {
			props.dataFile.entries.forEach((entry) => {
				let dateEntry = DateTime.fromISO(entry.entryDate)

				if (
					dateEntry > dateMaxAge &&
					(!filterText ||
						entry.dreams
							.map((item) => item.dreamSigns)
							.join()
							.indexOf(filterText.toLowerCase()) > -1)
				) {
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
	}, [props.dataFile, filterDrmChtMonths, filterText])

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

	// -----------------------------------------------------------------------

	function renderFilters(): JSX.Element {
		return (
			<section>
				<div className='row row-cols g-4 align-items-center justify-content-between mb-4' data-desc='commandbar'>
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
					<div className='col'>
						<div className='form-floating'>
							<select
								id='floatingMonthsShown'
								placeholder='months shown'
								defaultValue={filterDrmChtMonths}
								onChange={(ev) => setFilterDrmChtMonths(Number(ev.currentTarget.value))}
								className='form-control'>
								<option value={9999}>(All)</option>
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
					<div className='col'>
						<div className='form-floating'>
							<select
								id='floatingShowStard'
								placeholder='show starred dreams'
								defaultValue={filterDrmChtShowStard ? 'Yes' : 'No'}
								onChange={(ev) => setFilterDrmChtShowStard(ev.currentTarget.value == 'Yes')}
								className='form-control'>
								<option value={'Yes'}>Yes</option>
								<option value={'No'}>No</option>
							</select>
							<label htmlFor='floatingShowStard' className='text-nowrap'>
								Show Starred?
							</label>
						</div>
					</div>
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
								Show Un-Tagged?
							</label>
						</div>
					</div>
					<div className='col'>
						<div className='form-floating'>
							<select
								id='floatingShowTaged'
								placeholder='show untagged dreams'
								defaultValue={filterDrmChtShowTaged ? 'Yes' : 'No'}
								onChange={(ev) => setFilterDrmChtShowTaged(ev.currentTarget.value == 'Yes')}
								className='form-control'>
								<option value={'Yes'}>Yes</option>
								<option value={'No'}>No</option>
							</select>
							<label htmlFor='floatingShowTaged' className='text-nowrap'>
								Show Tagged?
							</label>
						</div>
					</div>
				</div>
			</section>
		)
	}

	function renderChart(): JSX.Element {
		// FUTURE: get fancier fills, not just plain bs-colors (use strips and transparency like sample on desktop shows)
		return (
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
						{filterDrmChtShowStard && <Bar dataKey='totStard' name='Starred' stackId='a' fill='var(--bs-warning)' />}
						<Bar dataKey='totLucid' name='Lucid Dream' stackId='a' fill='var(--bs-success)' />
					</BarChart>
				</ResponsiveContainer>
			</div>
		)
	}

	function renderChartTable(): JSX.Element {
		return typeof drmChartClickedIdx !== null ? (
			<section className='bg-black p-4'>
				<TableEntries entries={drmChartClkEntries} isBusyLoad={props.isBusyLoad} />
			</section>
		) : (
			<div />
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
			<section className='bg-light p-4'>
				{renderFilters()}
				{renderChart()}
				{renderChartTable()}
			</section>
		</section>
	)
}
