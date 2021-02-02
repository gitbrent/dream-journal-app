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

export default function CardDreamSignGrp(props: IDreamSignTagProps) {
	const [showEditBtns, setShowEditBtns] = useState(false)

	return !props || !props.tagGrp ? (
		<div />
	) : props.viewType === CardDreamSignGrpViewType.full || props.viewType === CardDreamSignGrpViewType.mini ? (
		<div key={`cardTag${props.tagGrp.dreamSign}`} className='card mb-3' style={{ minWidth: props.viewType === CardDreamSignGrpViewType.full ? '200px' : '125px' }}>
			<div className={`card-head bg-info text-white p-2 ${props.viewType === CardDreamSignGrpViewType.mini ? 'h-100' : ''}`}>
				<div className='row align-tiems-center'>
					<div className='col'>
						<h5 className='mb-0'>{props.tagGrp.dreamSign}</h5>
					</div>
					<div className='col-auto'>
						<h5 className='mb-0'>{props.tagGrp.totalOccurs}</h5>
					</div>
				</div>
			</div>
			{(props.viewType === CardDreamSignGrpViewType.full || showEditBtns) && (
				<div className='card-body bg-white p-2'>
					{(showEditBtns || props.tagGrp.totalOccurs <= 10) &&
						props.tagGrp.dailyEntries.map((entry, idy) => (
							<div
								key={`cardTagDate${props.tagGrp.dreamSign}${idy}`}
								title={Math.abs(Math.round(moment(entry.entryDate).diff(moment(new Date()), 'months', true))) + ' months ago'}
								onClick={() => props.onShowModal({ show: true, editEntry: entry })}
								className='cursor-link text-center d-inline-block border border-light mb-2 mr-2'
								style={{ userSelect: 'none' }}>
								<div className='bg-danger px-2 py-1 text-sm text-white align-text-middle rounded-top'>{new Date(entry.entryDate).getFullYear()}</div>
								<div className='bg-white px-2 py-1 rounded-bottom'>
									<h6 className='mb-0'>
										{MONTHS[new Date(entry.entryDate).getMonth()]} {new Date(entry.entryDate).getDate()}
									</h6>
								</div>
							</div>
						))}
				</div>
			)}
			<div className='card-footer text-center'>
				<button
					disabled={props.tagGrp.totalOccurs <= 10 && props.viewType === CardDreamSignGrpViewType.full}
					onClick={() => setShowEditBtns(!showEditBtns)}
					className='btn btn-sm btn-dark mr-2'>
					{showEditBtns ? 'Hide >10' : 'Show All'}
				</button>
			</div>
		</div>
	) : (
		<div key={`badgeTag${props.tagGrp.dreamSign}`} className='d-inline-block text-nowrap bg-info text-white mr-3 mb-3'>
			<div className='row no-gutters'>
				<div className='col px-3 py-2'>{props.tagGrp.dreamSign}</div>
				<div className='col-auto px-3 py-2 bg-trans-25'>{props.tagGrp.totalOccurs}</div>
			</div>
		</div>
	)
}
