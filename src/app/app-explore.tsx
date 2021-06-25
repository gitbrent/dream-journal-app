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
import ModalEntry from './modal-entry'

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
	 * @example 'January-2021`
	 */
	name: string
	dateTime: DateTime
	totLucid: number
	totStard: number
	totTaged: number
	totNotag: number
}

export default function TabExplore(props: Props) {
	const [isBusySave, setIsBusySave] = useState(false)
	const [showModal, setShowModal] = useState(false)
	const [currEntry, setCurrEntry] = useState<IJournalEntry>(null)
	const [chartData, setChartData] = useState<IChartData[]>([])

	useEffect(() => {
		let date12MonAgo = DateTime.now().minus({ months: 11 }).set({ day: 1 })
		let tmpChartData: IChartData[] = []

		if (props.dataFile && props.dataFile.entries && props.dataFile.entries.length > 0) {
			props.dataFile.entries.forEach((entry) => {
				let dateEntry = DateTime.fromISO(entry.entryDate)

				// WIP: Show last 12 months (TODO: add filter)
				if (dateEntry > date12MonAgo) {
					let currChartData = tmpChartData.filter((data) => data.dateTime.hasSame(dateEntry, 'month') && data.dateTime.hasSame(dateEntry, 'year'))[0]
					if (!currChartData) {
						currChartData = {
							name: dateEntry.toFormat('LLL'),
							dateTime: dateEntry,
							totLucid: 0,
							totStard: 0,
							totTaged: 0,
							totNotag: 0,
						}
						tmpChartData.push(currChartData)
					}

					let isDreamTagged = entry.dreams.map((dream) => dream.dreamSigns.length).reduce((prev, next) => prev + next) > 0

					currChartData.totLucid += entry.dreams.filter((dream) => dream.isLucidDream).length
					currChartData.totStard += entry.starred ? 1 : 0
					//currChartData.totStard += entry.dreams.filter((dream) => dream.dreamSigns.filter((tag) => tag === MetaType.star)).length // FIXME:
					currChartData.totTaged += isDreamTagged ? entry.dreams.length : 0
					currChartData.totNotag += !isDreamTagged ? entry.dreams.length : 0
				}
			})
		}

		setChartData(tmpChartData)
	}, [props.dataFile])

	// -----------------------------------------------------------------------

	// TODO: get fancier fills, not just plain bs-colors (use strips and transparency like sample on desktop shows)
	function renderChart(): JSX.Element {
		return (
			<section style={{ width: '100%', height: 400 }}>
				<ResponsiveContainer width='100%' height='96%'>
					<BarChart data={chartData}>
						<XAxis dataKey='name' />
						<YAxis type='number' /*domain={[0, (dataMax: number) => Math.round(dataMax * 1.1)]}*/ />
						<CartesianGrid stroke='#555555' strokeDasharray='6 2' vertical={false} />
						<Tooltip cursor={false} />
						<Legend layout='horizontal' verticalAlign='bottom' align='center' wrapperStyle={{ position: 'relative' }} />
						<Bar dataKey='totNotag' name='Untagged' stackId='a' fill='var(--bs-primary)' />
						<Bar dataKey='totTaged' name='Tagged' stackId='a' fill='var(--bs-info)' />
						<Bar dataKey='totLucid' name='Lucid Dream' stackId='a' fill='var(--bs-success)' />
						<Bar dataKey='totStard' name='Starred' stackId='a' fill='var(--bs-warning)' />
					</BarChart>
				</ResponsiveContainer>
			</section>
		)
	}

	// -----------------------------------------------------------------------

	return !props.dataFile || !props.dataFile.entries ? (
		<AlertGdriveStatus isBusyLoad={props.isBusyLoad} />
	) : (
		<div className='container my-auto my-md-5'>
			<ModalEntry currEntry={currEntry} showModal={showModal} setShowModal={setShowModal} />
			<header>
				<HeaderMetrics dataFile={props.dataFile} isBusyLoad={props.isBusyLoad} showStats={true} />
			</header>
			<main className='bg-light p-4'>{renderChart()}</main>
		</div>
	)
}
