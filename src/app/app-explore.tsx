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
//import moment from 'moment'
import { IDriveConfFile, IDriveDataFile, IJournalDream, IJournalEntry } from './app.types'
import HeaderMetrics from './components/header-metrics'
import AlertGdriveStatus from './components/alert-gstat'
import ModalEntry from './modal-entry'
//import * as GDrive from './google-oauth'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PolarGrid } from 'recharts'

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

export default function TabExplore(props: Props) {
	const [isBusySave, setIsBusySave] = useState(false)
	const [showModal, setShowModal] = useState(false)
	const [currEntry, setCurrEntry] = useState<IJournalEntry>(null)
	const [allLucids, setAllLucids] = useState<LucidDream[]>([])
	const [randLucids, setRandLucids] = useState<LucidDream[]>([]) // TODO: remove

	useEffect(() => {
		let allLucids: LucidDream[] = []

		if (props.dataFile && props.dataFile.entries && props.dataFile.entries.length > 0) {
			props.dataFile.entries.forEach((entry) => {
				let succDreams = [...entry.dreams.filter((dream) => dream.isLucidDream)]
				succDreams.forEach((dream) => allLucids.push({ entry: entry, lucidDream: dream }))
			})
		}

		setAllLucids(allLucids)
	}, [props.dataFile])

	useEffect(() => {
		if (allLucids && allLucids.length > 0) {
			let randLucids: LucidDream[] = []

			for (let idx = 0; idx < 3; idx++) {
				randLucids.push(allLucids[Math.round(Math.random() * allLucids.length)])
			}

			setRandLucids(randLucids)
		}
	}, [allLucids])

	// -----------------------------------------------------------------------

	function renderChart(): JSX.Element {
		const data = [
			{
				name: 'January',
				nonLd: 400,
				yesLd: 20,
				stars: 25,
			},
			{
				name: 'February',
				nonLd: 330,
				yesLd: 13,
				stars: 22,
			},
			{
				name: 'March',
				nonLd: 350,
				yesLd: 18,
				stars: 19,
			},
		]

		return (
			<section style={{ width: '100%', height: 400 }}>
				<ResponsiveContainer width='100%' height='96%'>
					<BarChart data={data}>
						<XAxis dataKey='name' />
						<YAxis />
						{/*<CartesianGrid stroke='#eee' strokeDasharray='5 5' />*/}
						<Tooltip cursor={{ fill: 'var(--bs-gray)' }} />
						<Legend layout='horizontal' verticalAlign='bottom' align='center' wrapperStyle={{ position: 'relative' }} />
						<Bar dataKey='nonLd' stackId='a' fill='var(--bs-primary)' />
						<Bar dataKey='yesLd' stackId='a' fill='var(--bs-success)' />
						<Bar dataKey='stars' stackId='a' fill='var(--bs-warning)' />
					</BarChart>
				</ResponsiveContainer>
			</section>
		)
	}
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
