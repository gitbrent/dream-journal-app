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
import { IDriveConfFile, IDriveDataFile, IJournalDream, IJournalEntry, MetaType } from './app.types'
import { DateTime } from 'luxon'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import HeaderMetrics from './components/header-metrics'
import AlertGdriveStatus from './components/alert-gstat'
import TableEntries from './components/table-entries'
//import ModalEntry from './modal-entry'

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

interface LucidDream {
	entry: IJournalEntry
	lucidDream: IJournalDream
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
	totNotag: number
}

export default function TabExplore(props: Props) {
	const [isBusySave, setIsBusySave] = useState(false)
	const [showModal, setShowModal] = useState(false)
	//const [currEntry, setCurrEntry] = useState<IJournalEntry>(null)
	const [chartData, setChartData] = useState<IChartData[]>([])
	//
	const [filterDrmChtMonths, setFilterDrmChtMonths] = useState(12)
	const [filterDrmChtShowNotag, setFilterDrmChtShowNotag] = useState(true)
	const [filterDrmChtShowTaged, setFilterDrmChtShowTaged] = useState(true)
	//
	const [drmChartClickedIdx, setDrmChartClickedIdx] = useState<number>(null)
	const [drmChartClkEntries, setDrmChartClkEntries] = useState<IJournalEntry[]>([])

	/** Gather dream chart data */
	useEffect(() => {
		let dateMaxAge = DateTime.now()
			.minus({ months: filterDrmChtMonths - 1 })
			.set({ day: 1 })
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

					let dreamMap = entry.dreams.map((dream) => dream.dreamSigns.length)
					let isDreamTagged = dreamMap.length > 0 ? dreamMap.reduce((prev, next) => prev + next) > 0 : false

					currChartData.totLucid += entry.dreams.filter((dream) => dream.isLucidDream).length
					currChartData.totStard += entry.starred ? 1 : 0
					//currChartData.totStard += entry.dreams.filter((dream) => dream.dreamSigns.filter((tag) => tag === MetaType.star)).length // FIXME:
					currChartData.totTaged += isDreamTagged ? entry.dreams.length : 0
					currChartData.totNotag += !isDreamTagged ? entry.dreams.length : 0
				}
			})
		}

		setChartData(tmpChartData)
	}, [props.dataFile, filterDrmChtMonths])

	/** Handle click on dreams barchart */
	useEffect(() => {
		if (typeof drmChartClickedIdx !== null && chartData && chartData[drmChartClickedIdx]) {
			let dateEntry = chartData[drmChartClickedIdx].dateTime
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

	// TODO: get fancier fills, not just plain bs-colors (use strips and transparency like sample on desktop shows)
	function renderTabChart(): JSX.Element {
		return (
			<section>
				<div className='row row-cols g-4 align-items-center justify-content-between mb-4' data-desc='commandbar'>
					<div className='col'>
						<div className='form-control' style={{ height: '3.5rem', paddingTop: '1.625rem', paddingBottom: '0.625rem' }}>
							<div className='form-check'>
								<input
									className='form-check-input'
									id='flexCheckDefault'
									type='checkbox'
									checked={filterDrmChtShowNotag}
									onChange={(ev) => setFilterDrmChtShowNotag(ev.currentTarget.checked)}
								/>
								<label className='form-check-label' htmlFor='flexCheckDefault'>
									Untagged Dreams
								</label>
							</div>
						</div>
					</div>
					<div className='col'>
						<div className='form-control' style={{ height: '3.5rem', paddingTop: '1.625rem', paddingBottom: '0.625rem' }}>
							<div className='form-check'>
								<input
									className='form-check-input'
									id='flexCheckTaged'
									type='checkbox'
									checked={filterDrmChtShowTaged}
									onChange={(ev) => setFilterDrmChtShowTaged(ev.currentTarget.checked)}
								/>
								<label className='form-check-label' htmlFor='flexCheckTaged'>
									Tagged Dreams
								</label>
							</div>
						</div>
					</div>
					<div className='col'>
						<div className='form-floating'>
							<select
								id='floatingSortOrder'
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
							<label htmlFor='floatingSortOrder' className='text-nowrap'>
								Months Shown
							</label>
						</div>
					</div>
				</div>

				<div className='bg-black p-4 mb-4' style={{ width: '100%', height: 400 }}>
					<ResponsiveContainer width='100%' height='100%'>
						<BarChart data={chartData} onClick={(data) => setDrmChartClickedIdx(data && data.activeTooltipIndex ? data.activeTooltipIndex : null)}>
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

	// -----------------------------------------------------------------------

	return !props.dataFile || !props.dataFile.entries ? (
		<AlertGdriveStatus isBusyLoad={props.isBusyLoad} />
	) : (
		<div className='container my-auto my-md-5'>
			{/* We have one in table-entires!! <ModalEntry currEntry={currEntry} showModal={showModal} setShowModal={setShowModal} />*/}
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
						Tag Timeine
					</a>
				</li>
				<li className='nav-item' role='presentation'>
					<a className='nav-link' id='3-tab' data-toggle='tab' href='#tab3' role='tab' aria-controls='tab3' aria-selected='false'>
						???
					</a>
				</li>
			</ul>
			<div className='tab-content' id='bsTabContent'>
				<div className='tab-pane bg-light p-4 show active' id='tab1' role='tabpanel' aria-labelledby='1-tab'>
					{renderTabChart()}
				</div>
				<div className='tab-pane bg-light p-4' id='tab2' role='tabpanel' aria-labelledby='2-tab'>
					{renderTabChart()}
				</div>
				<div className='tab-pane bg-light p-4' id='tab3' role='tabpanel' aria-labelledby='3-tab'>
					{renderTabChart()}
				</div>
			</div>
		</div>
	)
}
