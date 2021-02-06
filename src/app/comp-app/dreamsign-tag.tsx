import React, { useState } from 'react'
import { CardDreamSignGrpViewType, IDreamSignTagGroup, MONTHS } from '../app.types'
import moment from 'moment'

export interface IDreamSignTagProps {
	tagGrp: IDreamSignTagGroup
	onShowModal: Function
	viewType: CardDreamSignGrpViewType
}
export interface IDreamSignTagState {
	showEditBtns: boolean
}

export default function DreamSignTag(props: IDreamSignTagProps) {
	const [showEditBtns, setShowEditBtns] = useState(false)

	return !props || !props.tagGrp ? (
		<div />
	) : props.viewType === CardDreamSignGrpViewType.lg || props.viewType === CardDreamSignGrpViewType.md ? (
		<div
			className='card m-3'
			key={`cardTag${props.tagGrp.dreamSign}`}
			style={{ minWidth: props.viewType === CardDreamSignGrpViewType.lg ? (!showEditBtns ? '200px' : '600px') : !showEditBtns ? '125px' : '400px' }}>
			<div className={`card-header bg-info-800 text-white`}>
				<div className={`row align-tiems-center mb-0 ${props.viewType === CardDreamSignGrpViewType.lg ? 'h5' : 'h6'}`}>
					<div className='col text-breakword pr-0'>{props.tagGrp.dreamSign}</div>
					<div className='col-auto text-white-50 pl-1'>{props.tagGrp.totalOccurs}</div>
				</div>
			</div>
			<div className={`card-body ${props.viewType === CardDreamSignGrpViewType.md ? 'p-2' : ''}`}>
				<div>
					{showEditBtns &&
						props.tagGrp.dailyEntries.map((entry, idy) => (
							<div
								key={`cardTagDate${props.tagGrp.dreamSign}${idy}`}
								title={Math.abs(Math.round(moment(entry.entryDate).diff(moment(new Date()), 'months', true))) + ' months ago'}
								onClick={() => props.onShowModal({ show: true, editEntry: entry })}
								className='cursor-link text-center text-sm d-inline-block mb-3 mr-3'
								style={{ userSelect: 'none', minWidth: '65px' }}>
								<div className='bg-danger px-2 py-1 text-white align-text-middle rounded-top'>
									<h6 className='mb-0'>{new Date(entry.entryDate).getFullYear()}</h6>
								</div>
								<div className='bg-white px-2 py-3 rounded-bottom'>
									{MONTHS[new Date(entry.entryDate).getMonth()]} {new Date(entry.entryDate).getDate()}
								</div>
							</div>
						))}
				</div>
				<div className='row align-items-center no-gutters flex-nowrap'>
					<div className='col pr-1'>
						<button className='btn btn-sm btn-outline-info w-100' onClick={() => setShowEditBtns(!showEditBtns)}>
							{showEditBtns ? 'Hide' : 'Show'}
						</button>
					</div>
					<div className='col pl-1'>
						<button className='btn btn-sm btn-outline-dark w-100' onClick={() => console.log('TODO:')}>
							Rename
						</button>
					</div>
				</div>
			</div>
		</div>
	) : (
		<div key={`badgeTag${props.tagGrp.dreamSign}`} className='d-inline-block text-nowrap bg-info text-white m-2'>
			<div className='row no-gutters'>
				<div className='col px-3 py-2'>{props.tagGrp.dreamSign}</div>
				<div className='col-auto px-3 py-2 text-white-50 bg-trans-25'>{props.tagGrp.totalOccurs}</div>
			</div>
		</div>
	)
}
