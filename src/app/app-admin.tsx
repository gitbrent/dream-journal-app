import React, { useState, useEffect } from 'react'
import { IDriveFile } from './app.types'

export interface IAppAdminProps {
	dataFile: IDriveFile
	doSaveAdminState: Function
	adminState: IAppAdminState
}
export interface IAppAdminState {
	searchDone: boolean
	/*
	searchMatches: ISearchMatch[]
	searchOptMatchType: SearchMatchTypes
	searchOptScope: SearchScopes
	searchTerm: string
	searchTermInvalidMsg: string
	showAlert: boolean
	*/
}

export default function TabAdmin(props: IAppAdminProps) {
	const [totalMonths, setTotalMonths] = useState(0)
	const [totalYears, setTotalYears] = useState(0)
	const [totalDreams, setTotalDreams] = useState(0)
	const [totalStarred, setTotalStarred] = useState(0)
	const [totalLucids, setTotalLucids] = useState(0)
	const [totalUntagged, setTotalUntagged] = useState(0)
	const [totalDreamSigns, setTotalDreamSigns] = useState(0)

	function renderHeader(): JSX.Element {
		if (!props.dataFile || !props.dataFile.entries) return <div />

		let test = props.dataFile.entries.map((entry) => entry.dreams.filter((dream) => dream.isLucidDream).length).reduce((a, b) => a + b)
		console.log(test)

		/*
			if (entry.starred) totalStarred++
			totalDreams += entry.dreams.length
			totalLucids += entry.dreams.filter(dream => dream.isLucidDream).length
		})*/

		return (
			<header className='container my-5'>
				<div className='card my-5'>
					<div className='card-header bg-primary'>
						<h5 className='card-title text-white mb-0'>Dream Journal Analysis</h5>
					</div>
					<div className='card-body bg-light'>
						<div className='row align-items-start justify-content-around'>
							<div className='col-auto text-center d-none d-md-block'>
								<h1 className='text-primary mb-1 x3'>{totalMonths}</h1>
								<label className='text-primary text-uppercase'>Months</label>
								<div className='badge badge-pill badge-primary w-100'>{`${totalYears} years`}</div>
							</div>
							<div className='col-auto text-center'>
								<h1 className='text-primary mb-1 x3'>{props.dataFile.entries.length}</h1>
								<label className='text-primary text-uppercase'>Days</label>
								<div className='badge badge-pill badge-primary w-100'>
									{totalMonths * 30 > 0 ? (props.dataFile.entries.length / totalMonths).toFixed(2) + ' / mon' : '-'}
								</div>
							</div>
							<div className='col-auto text-center'>
								<h1 className='text-info mb-1 x3'>{totalDreams}</h1>
								<label className='text-info text-uppercase d-block'>Dreams</label>
								<div className='badge badge-pill badge-info w-100'>
									{totalMonths * 30 > 0 ? (totalDreams / props.dataFile.entries.length).toFixed(2) + ' / day' : '-'}
								</div>
							</div>
							<div className='w-100 mb-3 d-md-none mb-md-0' />
							<div className='col-auto text-center'>
								<h1 className='text-warning mb-1 x3'>{totalStarred}</h1>
								<label className='text-warning text-uppercase d-block'>Starred</label>
								<div className='badge badge-pill badge-warning w-100'>
									{totalDreams && totalStarred ? ((totalStarred / totalDreams) * 100).toFixed(2) + '%' : '-'}
								</div>
							</div>
							<div className='col-auto text-center'>
								<h1 className='text-success mb-1 x3'>{totalLucids}</h1>
								<label className='text-success text-uppercase d-block'>Lucids</label>
								<div className='badge badge-pill badge-success w-100'>
									{totalDreams && totalLucids ? ((totalLucids / totalDreams) * 100).toFixed(2) + '%' : '-'}
								</div>
							</div>
							<div className='col-auto text-center'>
								<h1 className='text-primary mb-1 x3'>{totalDreamSigns}</h1>
								<label className='text-primary text-uppercase d-block'>
									Unique
									<br />
									DreamSigns
								</label>
							</div>
							<div className='col-auto text-center'>
								<h1 className='text-info mb-1 x3'>{totalDreams - totalUntagged}</h1>
								<label className='text-info text-uppercase d-block'>Tagged</label>
								<div className='badge badge-pill badge-info w-100'>
									{totalDreams ? (((totalDreams - totalUntagged) / totalDreams) * 100).toFixed(2) + '%' : '0%'}
								</div>
							</div>
							<div className='col-auto text-center'>
								<h1 className='text-warning mb-1 x3'>{totalUntagged || '0'}</h1>
								<label className='text-warning text-uppercase d-block'>Untagged</label>
								<div className='badge badge-pill badge-warning w-100'>{totalDreams ? ((totalUntagged / totalDreams) * 100).toFixed(2) + '%' : '0%'}</div>
							</div>
						</div>
					</div>
				</div>

				<div className='card my-5'>
					<div className='card-header bg-primary'>
						<h5 className='card-title text-white mb-0'>Dream Journal Admin</h5>
					</div>
					<div className='card-body bg-light'>
						<div className='row align-items-start justify-content-around'>
							<div className='col-auto text-center d-none d-md-block'>
								<label className='text-primary text-uppercase'>Months</label>
								<div className='badge badge-pill badge-primary w-100'>{' years'}</div>
							</div>
						</div>
					</div>
				</div>
			</header>
		)
	}

	return (
		<div>
			{renderHeader()}
			<main>
				<div>TODO:</div>
			</main>
		</div>
	)
}
