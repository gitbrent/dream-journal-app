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

import { useMemo } from 'react'
import { IDreamSignTagGroup, IDriveDataFile, IJournalEntry, MetaType } from '../app.types'
import { DateTime } from 'luxon'

interface Props {
	dataFile?: IDriveDataFile
	entries?: IJournalEntry[]
	isBusyLoad: boolean
	showStats: boolean
	onlyMetrics?: boolean
}

export default function HeaderMetrics(props: Props) {
	const dataEntries = useMemo(() => {
		return (props.dataFile && props.dataFile.entries) || props.entries ? props.entries || props.dataFile?.entries : []
	}, [props.dataFile, props.entries])

	const totalMonths = useMemo(() => {
		if (!dataEntries || dataEntries.length === 0) return 0
		const ad1 = DateTime.fromISO(dataEntries.sort((a, b) => ((a.entryDate || 'zzz') < (b.entryDate || 'zzz') ? -1 : 1))[0].entryDate || '')
		const ad2 = DateTime.fromISO(dataEntries.sort((a, b) => ((a.entryDate || '000') > (b.entryDate || '000') ? -1 : 1))[0].entryDate || '')
		return Math.round(ad2.diff(ad1, 'months').months) + 1
	}, [dataEntries])

	const totalYears = useMemo(() => {
		if (!dataEntries || dataEntries.length === 0) return 0
		const ad1 = DateTime.fromISO(dataEntries.sort((a, b) => ((a.entryDate || 'zzz') < (b.entryDate || 'zzz') ? -1 : 1))[0].entryDate || '')
		const ad2 = DateTime.fromISO(dataEntries.sort((a, b) => ((a.entryDate || '000') > (b.entryDate || '000') ? -1 : 1))[0].entryDate || '')
		return (Math.round(ad2.diff(ad1, 'months').months) + 1) / 12
	}, [dataEntries])

	const totalDreams = useMemo(() => {
		return (!dataEntries || dataEntries.length === 0) ? 0 : dataEntries.map((entry) => entry.dreams.length).reduce((a, b) => a + b) || 0
	}, [dataEntries])

	const totalLucids = useMemo(() => {
		return (!dataEntries || dataEntries.length === 0) ? 0 : dataEntries.map((entry) => entry.dreams.filter((dream) => dream.isLucidDream).length).reduce((a, b) => a + b) || 0
	}, [dataEntries])

	const totalStarred = useMemo(() => {
		return (!dataEntries || dataEntries.length === 0) ? 0 : dataEntries?.map((entry) => entry.dreams.filter((dream) => dream.dreamSigns?.some((tag) => tag === MetaType.star)).length).reduce((a, b) => a + b) || 0
	}, [dataEntries])

	const totalUntagged = useMemo(() => {
		return (!dataEntries || dataEntries.length === 0) ? 0 : dataEntries?.map((entry) => entry.dreams.filter((dream) => dream.dreamSigns?.length === 0).length).reduce((a, b) => a + b) || 0
	}, [dataEntries])

	const totalDreamSigns = useMemo(() => {
		const tagGroups: IDreamSignTagGroup[] = []
		if (!dataEntries || dataEntries.length === 0) return 0

		dataEntries.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
			.forEach((entry) => {
				entry.dreams.forEach((dream) =>
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
				)
			})

		return tagGroups.length
	}, [dataEntries])

	// ------------------------------------------------------------------------

	function renderFull(): JSX.Element {
		return (
			<header className='card mb-2 mb-md-4'>
				<div className='card-header bg-primary'>
					<h5 className='card-title text-white'>Dream Journal Analysis</h5>
				</div>
				<div className='card-body'>{renderBody()}</div>
			</header>
		)
	}

	function renderBody(): JSX.Element {
		return (
			<div className='row align-items-end justify-content-around row-cols-auto row-cols-md-4 row-cols-lg-auto g-4'>
				<div className='col text-center'>
					<h6 className='text-teal text-uppercase mb-0'>Dreams</h6>
					<h1 className='text-teal display-5 mb-0'>{totalDreams || '-'}</h1>
					{props.showStats && (
						<div className='badge rounded-pill bg-teal w-100'>{totalMonths * 30 > 0 ? (totalDreams / (dataEntries || []).length).toFixed(2) + ' / day' : '-'}</div>
					)}
				</div>
				<div className='col text-center d-none d-md-block'>
					<h6 className='text-primary text-uppercase mb-0 mb-0'>Months</h6>
					<h1 className='text-primary display-5 mb-0'>{totalMonths || '-'}</h1>
					{props.showStats && <div className='badge rounded-pill bg-primary w-100'>{`${totalYears.toFixed(1)} years`}</div>}
				</div>
				<div className='col text-center d-none d-md-block'>
					<h6 className='text-primary text-uppercase mb-0'>Days</h6>
					<h1 className='text-primary display-5 mb-0'>{(dataEntries || []).length || '-'}</h1>
					{props.showStats && (
						<div className='badge rounded-pill bg-primary w-100'>{totalMonths * 30 > 0 ? ((dataEntries || []).length / totalMonths).toFixed(2) + ' / mon' : '-'}</div>
					)}
				</div>
				<div className='col text-center'>
					<h6 className='text-be-tag text-uppercase mb-0'>Tags</h6>
					<h1 className='text-be-tag display-5 mb-0'>{totalDreamSigns || '-'}</h1>
					{props.showStats && <div className='badge rounded-pill bg-be-tag w-100'>-</div>}
				</div>
				<div className='col text-center d-none d-md-block'>
					<h6 className='text-info text-uppercase mb-0'>Tagged</h6>
					<h1 className='text-info display-5 mb-0'>{totalDreams - totalUntagged || '-'}</h1>
					{props.showStats && (
						<div className='badge rounded-pill bg-info w-100'>{totalDreams ? (((totalDreams - totalUntagged) / totalDreams) * 100).toFixed(2) + '%' : '0%'}</div>
					)}
				</div>
				<div className='col text-center d-none d-md-block'>
					<h6 className='text-info text-uppercase mb-0'>Un-Tagged</h6>
					<h1 className='text-info display-5 mb-0'>{totalUntagged || '-'}</h1>
					{props.showStats && <div className='badge rounded-pill bg-info w-100'>{totalDreams ? ((totalUntagged / totalDreams) * 100).toFixed(2) + '%' : '0%'}</div>}
				</div>
				<div className='col text-center'>
					<h6 className='text-warning text-uppercase mb-0'>Starred</h6>
					<h1 className='text-warning display-5 mb-0'>{totalStarred || '-'}</h1>
					{props.showStats && (
						<div className='badge rounded-pill bg-warning w-100'>{totalDreams && totalStarred ? ((totalStarred / totalDreams) * 100).toFixed(2) + '%' : '-'}</div>
					)}
				</div>
				<div className='col text-center'>
					<h6 className='text-success text-uppercase mb-0'>Lucids</h6>
					<h1 className='text-success display-5 mb-0'>{totalLucids || '-'}</h1>
					{props.showStats && (
						<div className='badge rounded-pill bg-success w-100'>{totalDreams && totalLucids ? ((totalLucids / totalDreams) * 100).toFixed(2) + '%' : '-'}</div>
					)}
				</div>
			</div>
		)
	}

	return <header>{(!props.entries && !props.dataFile) ? <div /> : props.onlyMetrics ? renderBody() : renderFull()}</header>
}
