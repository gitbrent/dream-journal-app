import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { CardDreamSignGrpViewType, IDreamSignTagGroup, IJournalEntry, MONTHS } from '../app.types'
import ModalEntry from '../modal-entry'

export interface IDreamSignTagProps {
	tagGrp: IDreamSignTagGroup
	viewType: CardDreamSignGrpViewType
	doMassUpdateTag: Function
}

export default function DreamSignTag(props: IDreamSignTagProps) {
	const [showModal, setShowModal] = useState(false)
	const [currEntry, setCurrEntry] = useState<IJournalEntry>(null)
	const [showDreams, setShowDreams] = useState(false)
	const [showRename, setShowRename] = useState(false)
	const [renameValue, setRenameValue] = useState('')

	useEffect(() => {
		if (currEntry) setShowModal(true)
	}, [currEntry])

	return !props || !props.tagGrp ? (
		<div />
	) : props.viewType === CardDreamSignGrpViewType.lg || props.viewType === CardDreamSignGrpViewType.md ? (
		<div
			className='card m-3'
			key={`cardTag${props.tagGrp.dreamSign}`}
			style={{ minWidth: props.viewType === CardDreamSignGrpViewType.lg ? (!showDreams ? '200px' : '600px') : !showDreams ? '125px' : '400px' }}>
			<div className={`card-header bg-info-800 text-white`}>
				<div className={`row align-tiems-center mb-0 ${props.viewType === CardDreamSignGrpViewType.lg ? 'h5' : 'h6'}`}>
					<div className='col text-breakword pr-0'>{props.tagGrp.dreamSign.replace(':', ': ')}</div>
					<div className='col-auto text-white-50 pl-1'>{props.tagGrp.totalOccurs}</div>
				</div>
			</div>
			<div className={`card-body ${props.viewType === CardDreamSignGrpViewType.md ? 'p-2' : ''}`}>
				<div>
					<ModalEntry currEntry={currEntry} showModal={showModal} setShowModal={setShowModal} />

					{showDreams &&
						props.tagGrp.dailyEntries.map((entry, idy) => (
							<div
								key={`cardTagDate${props.tagGrp.dreamSign}${idy}`}
								title={Math.abs(Math.round(moment(entry.entryDate).diff(moment(new Date()), 'months', true))) + ' months ago'}
								onClick={() => setCurrEntry(entry)}
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
				<div className='row align-items-end no-gutters flex-nowrap'>
					<div className='col pr-1'>
						<button className='btn btn-sm btn-outline-secondary w-100' onClick={() => setShowDreams(!showDreams)}>
							{showDreams ? 'Hide' : 'Show'}
						</button>
					</div>
					<div className='col pl-1'>
						<button className='btn btn-sm btn-outline-secondary w-100' onClick={() => setShowRename(!showRename)}>
							Edit
						</button>
					</div>
				</div>
			</div>
			{showRename && (
				<div className='card-footer p-2'>
					<input className='form-control' value={renameValue} onChange={(ev) => setRenameValue(ev.target.value.toLowerCase())} />
					<button
						className='btn btn-sm btn-warning w-100 mt-2'
						onClick={() => {
							props.doMassUpdateTag(props.tagGrp.dreamSign, renameValue)
							setRenameValue('')
							setShowRename(false)
						}}>
						Edit
					</button>
				</div>
			)}
		</div>
	) : (
		<div className='d-inline-block text-nowrap bg-info text-white m-2'>
			<div className='row no-gutters'>
				<div className='col px-3 py-2'>{props.tagGrp.dreamSign}</div>
				<div className='col-auto px-3 py-2 text-white-50 bg-trans-25'>{props.tagGrp.totalOccurs}</div>
			</div>
		</div>
	)
}
