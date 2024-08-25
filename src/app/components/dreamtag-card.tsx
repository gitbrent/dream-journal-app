import { useState } from 'react'
import { DateTime } from 'luxon'
import { CardDreamSignGrpViewType, IDreamSignTagGroup, IJournalEntry } from '../app.types'

export interface Props {
	setCurrEntry: (entry: IJournalEntry) => void
	setShowModal: (show: boolean) => void
	tagGrp: IDreamSignTagGroup
	viewType: CardDreamSignGrpViewType
	doMassUpdateTag: (oldTag: string, newTag: string) => void
}

export default function DreamTagCard(props: Props) {
	const [showDreams, setShowDreams] = useState(false)
	const [showRename, setShowRename] = useState(false)
	const [renameValue, setRenameValue] = useState('')

	function renderShowDreams(): JSX.Element {
		return (
			<div className='row row-cols-auto g-3'>
				{props.tagGrp.dailyEntries.map((entry, idy) => {
					const dateEntry = DateTime.fromISO(entry.entryDate)
					return (
						<div
							key={`cardTagDate${props.tagGrp.dreamSign}${idy}`}
							title={Math.abs(Math.round(dateEntry.diff(DateTime.now(), 'months').months)) + ' months ago'}
							onClick={() => {
								props.setCurrEntry(entry)
								props.setShowModal(true)
							}}
							className='col cursor-link text-center text-sm user-select-none'
							style={{ minWidth: '65px' }}>
							<div className='bg-danger px-2 py-1 text-white align-text-middle rounded-top'>
								<h6 className='mb-0'>{dateEntry.toFormat('yyyy')}</h6>
							</div>
							<div className='bg-white px-2 py-3 rounded-bottom'>{dateEntry.toFormat('LLL dd')}</div>
						</div>
					)
				})}
			</div>
		)
	}

	return !props || !props.tagGrp ? (
		<div />
	) : props.viewType === CardDreamSignGrpViewType.lg || props.viewType === CardDreamSignGrpViewType.md ? (
		<div
			className='card'
			key={`cardTag${props.tagGrp.dreamSign}`}
			style={{ minWidth: props.viewType === CardDreamSignGrpViewType.lg ? (!showDreams ? '200px' : '600px') : !showDreams ? '125px' : '400px' }}>
			<div className='card-header bg-info-800 text-white'>
				<div className={`row align-tiems-center mb-0 ${props.viewType === CardDreamSignGrpViewType.lg ? 'h5' : 'h6'}`}>
					<div className='col text-breakword pe-0'>{props.tagGrp.dreamSign.replace(':', ': ')}</div>
					<div className='col-auto text-white-50 ps-1'>{props.tagGrp.totalOccurs}</div>
				</div>
			</div>
			<div className={`card-body ${props.viewType === CardDreamSignGrpViewType.md ? 'py-2' : ''}`}>
				{showDreams && renderShowDreams()}
				<div className='row align-items-end g-0 flex-nowrap'>
					<div className='col pe-1'>
						<button className='btn btn-sm btn-outline-secondary w-100' onClick={() => setShowDreams(!showDreams)}>
							{showDreams ? 'Hide' : 'Show'}
						</button>
					</div>
					<div className='col ps-1'>
						<button className='btn btn-sm btn-outline-secondary w-100' onClick={() => setShowRename(!showRename)}>
							Edit
						</button>
					</div>
				</div>
			</div>
			{showRename && (
				<div className='card-footer py-2'>
					<div className='form-floating'>
						<input id='floatingInput' className='form-control' type='text' value={renameValue} onChange={(ev) => setRenameValue(ev.target.value.toLowerCase())} />
						<label htmlFor='floatingInput'>New Tag</label>
					</div>
					<button
						className='btn btn-sm btn-warning w-100 mt-2'
						disabled={!renameValue}
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
		<div className='col text-nowrap text-white user-select-none'>
			<div className='row g-0 bg-info'>
				<div className='col px-3 py-2 cursor-link' title='click to view dreams' onClick={() => setShowDreams(!showDreams)}>
					{props.tagGrp.dreamSign}
				</div>
				<div className='col-auto px-3 py-2 text-white-50 text-end bg-trans-25' style={{ minWidth: '60px' }}>
					{props.tagGrp.totalOccurs}
				</div>
			</div>
			{showDreams && <div className='bg-black-70 p-3'>{renderShowDreams()}</div>}
		</div>
	)
}
