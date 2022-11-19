import React, { useMemo } from 'react'
import { DateTime } from 'luxon'
import { IDreamSignTagGroup, IDriveDataFile, IJournalDream, IJournalEntry } from './app.types'
import AlertGdriveStatus from './components/alert-gstat'

interface IAppTagsProps {
	dataFile: IDriveDataFile
	isBusyLoad: boolean
}
export interface IAppTagsState {
	thisIsAplaceholder: string
}

interface IOnlyDream {
	entryDate: string
	dreams: IJournalDream[]
	tags: string[]
}
interface IEntriesByYear {
	year: number
	tags: IDreamSignTagGroup[]
}

export default function TabTags2(props: IAppTagsProps) {
	const TOP = 10

	/**
	 * all entries from datafile, sorted old->new
	 * @desc only parse datafile once
	 */
	const datafileEntries = useMemo(() => {
		const tempEntries = props.dataFile && props.dataFile.entries ? props.dataFile.entries : []
		return tempEntries.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
	}, [props.dataFile])

	/** WIP: TODO: */
	/*
	const tagsByYear = useMemo(() => {
		const tempByYear: IEntriesByYear[] = []

		tempByYear.push({
			year: 2022,
			tags: getGroupedTags(datafileEntries.filter((entry) => entry.entryDate.startsWith('2022'))),
		})
		tempByYear.push({
			year: 2021,
			tags: getGroupedTags(datafileEntries.filter((entry) => entry.entryDate.startsWith('2021'))),
		})

		console.log(tempByYear) // DEBUG:

		const allButThisYear = getGroupedTags(datafileEntries.filter((entry) => !entry.entryDate.startsWith('2022'))).map((item) => item.dreamSign)

		// TODO: whats the diff? what is new in 2022?
		const tags2022 = tempByYear.filter((item) => item.year === 2022)[0].tags.map((item) => item.dreamSign)
		const tags2021 = tempByYear.filter((item) => item.year === 2021)[0].tags.map((item) => item.dreamSign)

		const myArray = tags2022.filter((el) => !tags2021.includes(el))
		console.log(myArray)

		console.log('BRAND NEW')
		const brandNew = tags2022.filter((el) => !allButThisYear.includes(el))
		console.log(brandNew)

		return tempByYear
	}, [datafileEntries])
	*/

	const dreamTagGroups = useMemo(() => {
		return getGroupedTags(props.dataFile && props.dataFile.entries ? props.dataFile.entries : [])
	}, [props.dataFile])

	const tagsByTop = useMemo(() => {
		return dreamTagGroups
	}, [dreamTagGroups])

	// ------------------------------------------------------------------------

	function getGroupedTags(entries: IJournalEntry[]): IDreamSignTagGroup[] {
		const tmpOnlyDreams: IOnlyDream[] = []
		const tagGroups: IDreamSignTagGroup[] = []

		entries
			.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
			.forEach((entry) => {
				entry.dreams.forEach((dream) => {
					dream.dreamSigns.forEach((sign) => {
						const tag = tagGroups.filter((tag) => tag.dreamSign === sign)[0]
						if (tag) {
							const existingEntry = tag.dailyEntries.filter((item) => item.entryDate == entry.entryDate)[0]
							if (!existingEntry) tag.dailyEntries.push(entry)
							tag.totalOccurs++
						} else {
							tagGroups.push({ dreamSign: sign, dailyEntries: [entry], totalOccurs: 1 })
						}
					})

					const currEntry = tmpOnlyDreams.filter((item) => item.entryDate === entry.entryDate)[0]

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
		const dateMaxAge = DateTime.now()
			.minus({ months: months - 1 })
			.set({ day: 0, hour: 0, minute: 0, second: 0 })

		return datafileEntries.filter((entry) => DateTime.fromISO(entry.entryDate) > dateMaxAge)
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
			<section className='mb-4'>
				<h5>Top Tags</h5>
				<section className='bg-black p-4 text-sm'>
					<div className='row row-cols justify-content-between g-4'>
						<div className='col'>{renderTags(topAllTime, 'All Time')}</div>
						<div className='col'>{renderTags(topMonths72, 'Last 72 Months')}</div>
						<div className='col'>{renderTags(topMonths12, 'Last 12 Months')}</div>
						<div className='col'>{renderTags(topMonths03, 'Last 3 Months')}</div>
					</div>
				</section>
			</section>
		)
	}

	function renderTagsByYear(): JSX.Element {
		const allButThisYear = getGroupedTags(datafileEntries.filter((entry) => !entry.entryDate.startsWith('2022')))

		const tags2022 = getGroupedTags(datafileEntries.filter((entry) => entry.entryDate.startsWith('2022')))
		const tags2021 = getGroupedTags(datafileEntries.filter((entry) => entry.entryDate.startsWith('2021')))

		const diffPrevYear = tags2022.map((item) => item.dreamSign).filter((el) => !tags2021.map((item) => item.dreamSign).includes(el))
		const diffAllTime = tags2022.map((item) => item.dreamSign).filter((el) => !allButThisYear.map((item) => item.dreamSign).includes(el))

		const newPrevYear = tags2022.filter((item) => diffPrevYear.includes(item.dreamSign)).sort((a, b) => (a.totalOccurs > b.totalOccurs ? -1 : 1)).filter((_item, idx) => idx < TOP)
		const newAllTime = allButThisYear.filter((item) => diffAllTime.includes(item.dreamSign)).sort((a, b) => (a.totalOccurs > b.totalOccurs ? -1 : 1)).filter((_item, idx) => idx < TOP)

		return (
			<section className='mt-4'>
				<h5>Top Tags</h5>
				<section className='bg-black p-4 text-sm'>
					<div className='row row-cols justify-content-between g-4'>
						<div className='col'>{renderTags(newAllTime, 'Brand New This Year')}</div>
						<div className='col'>{renderTags(newPrevYear, 'Not Found Last Year')}</div>
					</div>
				</section>
			</section>
		)
	}

	// ------------------------------------------------------------------------

	return (
		<div className='container my-auto my-md-5'>
			{!props.dataFile || !props.dataFile.entries ? (
				<AlertGdriveStatus isBusyLoad={props.isBusyLoad} />
			) : (
				<div className='card'>
					<div className='card-header bg-primary h5 text-white'>Dream Journal Tags</div>
					<div className='card-body'>
						{renderTopTags()}
						{renderTagsByYear()}
					</div>
				</div>
			)}
		</div>
	)
}
