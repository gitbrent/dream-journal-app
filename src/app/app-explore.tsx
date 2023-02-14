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

import React, { useState, useEffect, useMemo } from 'react'
import { IDriveConfFile, IDriveDataFile, IJournalEntry, MetaType } from './app.types'
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DateTime } from 'luxon'
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

export interface Props {
	confFile?: IDriveConfFile
	dataFile?: IDriveDataFile
	isBusyLoad?: boolean
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
	avgTotal: number
}
type AvgDreamsPerMonth = {
	/** @example `2010-04`=199 */
	[key: string]: number
}

export default function TabExplore(props: Props) {
	const [filterDrmChtMonths, setFilterDrmChtMonths] = useState(18)
	const [filterDrmChtShowStard, setFilterDrmChtShowStard] = useState(true)
	const [filterDrmChtShowNotag, setFilterDrmChtShowNotag] = useState(true)
	const [filterDrmChtShowTaged, setFilterDrmChtShowTaged] = useState(true)
	//
	const [filterText, setFilterText] = useState('')
	const [debouncedValue, setDebouncedValue] = useState('')

	const allTimeMonths = useMemo(() => {
		let months = 1
		if (props.dataFile) {
			const ad1 = DateTime.fromISO(props.dataFile.entries.sort((a, b) => ((a.entryDate || 'zzz') < (b.entryDate || 'zzz') ? -1 : 1))[0].entryDate)
			const ad2 = DateTime.fromISO(props.dataFile.entries.sort((a, b) => ((a.entryDate || '000') > (b.entryDate || '000') ? -1 : 1))[0].entryDate)
			months = Math.round(ad2.diff(ad1, 'months').months) + 1
		}
		return months
	}, [props.dataFile])

	const avgDreamsPerMonth = useMemo(() => {
		interface SumByYear {
			year: number
			month: number
			total: number
		}
		const sumByYear: SumByYear[] = []
		const avgData: AvgDreamsPerMonth = {}

		if (props.dataFile) {
			props.dataFile.entries
				.sort((a, b) => ((a.entryDate || 'zzz') < (b.entryDate || 'zzz') ? -1 : 1))
				.forEach((entry) => {
					const entryDate = DateTime.fromISO(entry.entryDate)
					let currItem = sumByYear.filter((item) => item.year === entryDate.year && item.month === entryDate.month)[0]
					if (!currItem) {
						currItem = { year: entryDate.year, month: entryDate.month, total: 0 }
						sumByYear.push(currItem)
					}
					currItem.total += 1
				})

			sumByYear.forEach((item) => {
				const entryKey = `${item.year}-${item.month <= 9 ? '0' + item.month : item.month}`
				const totalMon = sumByYear.filter((sum) => sum.year === item.year).length
				const divByMon = item.month < totalMon ? item.month : totalMon
				const totalSoFar = sumByYear
					.filter((sum) => sum.year === item.year && sum.month <= item.month)
					.map((sum) => sum.total)
					.reduce((p, n) => p + n)
				if (!avgData[entryKey]) avgData[entryKey] = 0
				avgData[entryKey] = Math.round(totalSoFar / divByMon)
			})
		}
		return avgData
	}, [props.dataFile])

	useEffect(() => {
		const handler = setTimeout(() => setDebouncedValue(filterText), 500)
		return () => clearTimeout(handler)
	}, [filterText, 500])

	const filteredEntries = useMemo(() => {
		let tmpEntries: IJournalEntry[] = []
		const dateMaxAge = DateTime.now()
			.minus({ months: filterDrmChtMonths - 1 })
			.set({ day: 0, hour: 0, minute: 0, second: 0 })

		if (props.dataFile && props.dataFile.entries && props.dataFile.entries.length > 0) {
			tmpEntries = props.dataFile.entries.filter(
				(entry) =>
					DateTime.fromISO(entry.entryDate) > dateMaxAge &&
					(!debouncedValue ||
						entry.dreams
							.map((item) => item.dreamSigns)
							.join()
							.indexOf(debouncedValue.toLowerCase()) > -1)
			)
		}

		return tmpEntries
	}, [props.dataFile, filterDrmChtMonths, debouncedValue])

	const chartDataDreams = useMemo(() => {
		const tmpChartData: IChartData[] = []
		const dateMaxAge = DateTime.now().minus({ months: filterDrmChtMonths - 1 })
		const diffMonths = DateTime.now().diff(dateMaxAge, 'months')

		// Pre-populate all months so empty months are always shown (eg: user search for term with 1 hit, we still show all months)
		for (let idx = 0; idx <= diffMonths.months; idx++) {
			const dateLoop = dateMaxAge.plus({ months: idx })
			tmpChartData.push({
				name: dateLoop.toFormat('LLL-yy'),
				dateTime: dateLoop,
				totLucid: 0,
				totStard: 0,
				totTaged: 0,
				totNotag: 0,
				avgTotal: 0,
			})
		}

		filteredEntries.forEach((entry) => {
			const dateEntry = DateTime.fromISO(entry.entryDate)
			const currEntry = tmpChartData.filter((data) => data.dateTime.hasSame(dateEntry, 'month') && data.dateTime.hasSame(dateEntry, 'year'))[0]

			entry.dreams.forEach((dream) => {
				currEntry.totTaged += dream.dreamSigns.length > 0 ? 1 : 0
				currEntry.totNotag += dream.dreamSigns.length > 0 ? 0 : 1
				currEntry.totLucid += dream.isLucidDream ? 1 : 0
				currEntry.totStard += dream.dreamSigns.filter((tag) => tag === MetaType.star).length > 0 ? 1 : 0
				currEntry.avgTotal = avgDreamsPerMonth[currEntry.dateTime.toFormat('yyyy-MM')]
			})
		})

		return tmpChartData
	}, [filteredEntries])

	// -----------------------------------------------------------------------

	function renderFilters(): JSX.Element {
		return (
			<section className='mb-4'>
				<div className='row row-cols-2 row-cols-md-5 g-4 align-items-center justify-content-between mb-4' data-desc='commandbar'>
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
							<label htmlFor='floatingDreamtag' className='text-nowrap'>
								Search Tags
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
								className='form-select'>
								<option value={allTimeMonths}>(All)</option>
								<option value={6 * 1}>{6 * 1}</option>
								<option value={6 * 2}>{6 * 2}</option>
								<option value={6 * 3}>{6 * 3}</option>
								<option value={6 * 4}>{6 * 4}</option>
								<option value={6 * 8}>{6 * 8}</option>
								<option value={6 * 12}>{6 * 12}</option>
							</select>
							<label htmlFor='floatingMonthsShown' className='text-nowrap'>
								Month Range
							</label>
						</div>
					</div>
					<div className='col d-none d-md-block'>
						<div className='form-floating'>
							<select
								id='floatingShowStard'
								placeholder='show starred dreams'
								defaultValue={filterDrmChtShowStard ? 'Yes' : 'No'}
								onChange={(ev) => setFilterDrmChtShowStard(ev.currentTarget.value == 'Yes')}
								className='form-select'>
								<option value={'Yes'}>Yes</option>
								<option value={'No'}>No</option>
							</select>
							<label htmlFor='floatingShowStard' className='text-nowrap'>
								Show Starred?
							</label>
						</div>
					</div>
					<div className='col d-none d-md-block'>
						<div className='form-floating'>
							<select
								id='floatingShowUntag'
								placeholder='show untagged dreams'
								defaultValue={filterDrmChtShowNotag ? 'Yes' : 'No'}
								onChange={(ev) => setFilterDrmChtShowNotag(ev.currentTarget.value == 'Yes')}
								className='form-select'>
								<option value={'Yes'}>Yes</option>
								<option value={'No'}>No</option>
							</select>
							<label htmlFor='floatingShowUntag' className='text-nowrap'>
								Show Un-Tagged?
							</label>
						</div>
					</div>
					<div className='col d-none d-md-block'>
						<div className='form-floating'>
							<select
								id='floatingShowTaged'
								placeholder='show untagged dreams'
								defaultValue={filterDrmChtShowTaged ? 'Yes' : 'No'}
								onChange={(ev) => setFilterDrmChtShowTaged(ev.currentTarget.value == 'Yes')}
								className='form-select'>
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

	function renderMetrics(): JSX.Element {
		return (
			<section className='bg-black p-4 mb-4'>
				<HeaderMetrics entries={filteredEntries} isBusyLoad={props.isBusyLoad} showStats={true} onlyMetrics={true} />
			</section>
		)
	}

	function renderChart(): JSX.Element {
		// FUTURE: get fancier fills, not just plain bs-colors (use strips and transparency like sample on desktop shows)
		// CODE: https://codepen.io/LeanyLabs/pen/jOWYpJx
		return (
			<section className='bg-black p-4 mb-4' style={{ width: '100%', height: 400 }}>
				<ResponsiveContainer width='100%' height='100%'>
					<ComposedChart data={chartDataDreams}>
						<XAxis dataKey='name' fontSize={'0.75rem'} />
						<YAxis yAxisId={0} fontSize={'0.75rem'} width={60 - 40} /*domain={[0, (dataMax: number) => Math.round(dataMax * 1.1)]}*/ />
						<YAxis yAxisId={1} fontSize={'0.75rem'} width={60 - 40} orientation={'right'} />
						<CartesianGrid stroke='#555555' strokeDasharray='6 2' vertical={false} />
						<Legend verticalAlign={'bottom'} align={'center'} iconSize={20} />
						<Tooltip cursor={false} />
						{filterDrmChtShowNotag && <Bar dataKey='totNotag' name='Untagged' stackId='a' fill='var(--bs-primary)' />}
						{filterDrmChtShowTaged && <Bar dataKey='totTaged' name='Tagged' stackId='a' fill='var(--bs-info)' />}
						{filterDrmChtShowStard && <Bar dataKey='totStard' name='Starred' stackId='a' fill='var(--bs-warning)' />}
						<Bar yAxisId={0} dataKey='totLucid' name='Lucid Dream' stackId='a' fill='var(--bs-success)' />
						{!debouncedValue && <Line yAxisId={1} dataKey='avgTotal' name='Dreams/Month' dot={false} stroke='var(--bs-danger)' strokeWidth={2} />}
						{/*<Legend layout='horizontal' verticalAlign='bottom' align='center' wrapperStyle={{ position: 'relative' }} />*/}
					</ComposedChart>
				</ResponsiveContainer>
			</section>
		)
	}

	function renderTable(): JSX.Element {
		return (
			<section className='bg-black p-4'>
				<TableEntries entries={filteredEntries} isBusyLoad={props.isBusyLoad} />
			</section>
		)
	}

	// -----------------------------------------------------------------------

	return !props.dataFile || !props.dataFile.entries ? (
		<AlertGdriveStatus isBusyLoad={props.isBusyLoad} />
	) : (
		<section className='container my-auto my-md-5'>
			<div className='card mb-2 mb-md-5'>
				<div className='card-header bg-primary'>
					<h5 className='card-title text-white mb-0'>Dream Journal Exploration</h5>
				</div>
				<section className='bg-light p-4'>
					{renderFilters()}
					{renderMetrics()}
					{renderChart()}
					{renderTable()}
				</section>
			</div>
		</section>
	)
}
