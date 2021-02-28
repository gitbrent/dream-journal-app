/**
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
import { IDriveFile } from '../app.types'
import * as GDrive from '../google-oauth'

interface Props {
	dataFile: IDriveFile
	isBusyLoad: boolean
	//showFull: boolean
}

export default function HeaderMetrics(props: Props) {
	const [totalMonths, setTotalMonths] = useState(0)
	const [totalYears, setTotalYears] = useState(0)
	const [totalEntries, setTotalEntries] = useState(0)
	const [totalDreams, setTotalDreams] = useState(0)
	const [totalStarred, setTotalStarred] = useState(0)
	const [totalLucids, setTotalLucids] = useState(0)
	const [totalUntagged, setTotalUntagged] = useState(0)
	const [totalDreamSigns, setTotalDreamSigns] = useState(0)

	useEffect(() => {
		if (!props.dataFile || !props.dataFile.entries) return

		// Total: dreams, stars, lucids
		{
			let tmpTotalStarred = 0
			let tmpTotalDreams = 0
			let tmpTotalLucids = 0

			props.dataFile.entries.forEach((entry) => {
				if (entry.starred) tmpTotalStarred++
				tmpTotalDreams += entry.dreams.length
				tmpTotalLucids += entry.dreams.filter((dream) => dream.isLucidDream).length
			})

			setTotalStarred(tmpTotalStarred)
			setTotalDreams(tmpTotalDreams)
			setTotalLucids(tmpTotalLucids)
		}

		// Total: Months
		{
			let d1 = new Date(props.dataFile.entries.sort((a, b) => ((a.entryDate || 'zzz') < (b.entryDate || 'zzz') ? -1 : 1))[0].entryDate)
			let d2 = new Date(props.dataFile.entries.sort((a, b) => ((a.entryDate || '000') > (b.entryDate || '000') ? -1 : 1))[0].entryDate)
			let months: number
			months = (d2.getFullYear() - d1.getFullYear()) * 12
			months -= d1.getMonth() + 1
			months += d2.getMonth()
			months += 2 // include both first and last months
			setTotalMonths(months <= 0 ? 0 : months)
		}

		// Total: Years
		{
			let d1 = new Date(props.dataFile.entries.sort((a, b) => ((a.entryDate || 'zzz') < (b.entryDate || 'zzz') ? -1 : 1))[0].entryDate)
			let d2 = new Date(props.dataFile.entries.sort((a, b) => ((a.entryDate || '000') > (b.entryDate || '000') ? -1 : 1))[0].entryDate)
			setTotalYears(d2.getFullYear() - d1.getFullYear() + 1)
		}

		// Total: all metrics
		{
			setTotalEntries(props.dataFile.entries.length)
			setTotalDreams(props.dataFile.entries.map((entry) => entry.dreams.length).reduce((a, b) => a + b))
			setTotalStarred(props.dataFile.entries.filter((entry) => entry.starred).length)
			setTotalLucids(props.dataFile.entries.map((entry) => entry.dreams.filter((dream) => dream.isLucidDream).length).reduce((a, b) => a + b))
			setTotalUntagged(props.dataFile.entries.map((entry) => entry.dreams.filter((dream) => dream.dreamSigns.length === 0).length).reduce((a, b) => a + b))
		}
	}, [props.dataFile])

	// ------------------------------------------------------------------------

	return (
		<header className='card mb-auto mb-md-5'>
			<div className='card-header bg-primary'>
				<h5 className='card-title text-white mb-0'>Dream Journal Analysis</h5>
			</div>
			<div className='card-body bg-light'>
				<div className='row align-items-end justify-content-around row-cols-3 row-cols-md-auto g-3 mb-3'>
					<div className='col text-center'>
						<h3 className='text-primary'>{totalMonths || '-'}</h3>
						<label className='text-primary text-uppercase mb-0'>Months</label>
					</div>
					<div className='col text-center'>
						<h3 className='text-primary'>{props.dataFile && props.dataFile.entries ? props.dataFile.entries.length : '-'}</h3>
						<label className='text-primary text-uppercase mb-0'>Days</label>
					</div>
					<div className='col text-center'>
						<h3 className='text-info'>{totalDreams || '-'}</h3>
						<label className='text-info text-uppercase mb-0'>Dreams</label>
					</div>
					<div className='col text-center'>
						<h3 className='text-warning'>{totalStarred || '-'}</h3>
						<label className='text-warning text-uppercase mb-0'>Starred</label>
					</div>
					<div className='col text-center'>
						<h3 className='text-success'>{totalLucids || '-'}</h3>
						<label className='text-success text-uppercase mb-0'>Lucids</label>
					</div>
					<div className='col'></div>
				</div>
			</div>
		</header>
	)
}
