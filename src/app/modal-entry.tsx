/**
 * 2.0 form
 */
import React, { useState, useEffect } from 'react'
import * as GDrive from './google-oauth'
import { IDreamSignTag, IJournalDream, IJournalEntry, InductionTypes } from './app.types'
import ReactTags from 'react-tag-autocomplete'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { Calendar3, Clock, PlusCircle, Save, Star, StarFill, Trash, Check } from 'react-bootstrap-icons'

export interface IModalEntryProps {
	currEntry: IJournalEntry
	showDialog: boolean
	setShowDialog: Function
}

export default function TabAdmin(props: IModalEntryProps) {
	const NEW_DREAM = {
		title: '',
		notes: '',
		dreamSigns: [],
		dreamImages: [],
		isLucidDream: false,
		lucidMethod: InductionTypes.dild,
	}
	const NEW_ENTRY = {
		// TODO: need better idea - UTC shows wrong date half the time (1 day ahead)
		//entryDate: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDay(), // TODO: mon/day both need zero-padding (eg: "06")
		entryDate: new Date().toISOString().substring(0, 10),
		bedTime: '',
		notesPrep: '',
		notesWake: '',
		starred: false,
		dreams: [NEW_DREAM],
	}
	const [showModal, setShowModal] = useState(false)
	const [isBusySave, setIsBusySave] = useState(false)
	const [currEntry, setCurrEntry] = useState<IJournalEntry>({ ...NEW_ENTRY })
	const [uniqueTags, setUniqueTags] = useState([])
	const [isDateDupe, setIsDateDupe] = useState(false)
	const [selectedTab, setSelectedTab] = useState(-1)

	/** Set/Clear Entry */
	useEffect(() => setCurrEntry(props.currEntry ? props.currEntry : { ...NEW_ENTRY }), [props.currEntry])
	useEffect(() => setUniqueTags(GDrive.getUniqueDreamTags), [props.showDialog])
	useEffect(() => setShowModal(props.showDialog), [props.showDialog])

	// -----------------------------------------------------------------------

	function renderToolbar(): JSX.Element {
		return (
			<nav>
				{/* border-bottom border-secondary */}
				<div className='row px-4 pt-4'>
					<div className='col-6 col-md-3 mb-4'>
						<div className='input-group'>
							<div className='input-group-prepend' title='Entry Date'>
								<span className='input-group-text bg-secondary px-2'>
									<Calendar3 />
								</span>
							</div>
							<input
								name='entryDate'
								type='date'
								placeholder='(entry date)'
								value={currEntry.entryDate}
								onChange={(ev) => {
									let chgEntry = { ...currEntry }
									chgEntry.entryDate = ev.currentTarget.value
									setCurrEntry(chgEntry)
									setIsDateDupe(GDrive.doesEntryDateExist(ev.currentTarget.value))
								}}
								className={'form-control form-control-sm'}
								required
							/>
						</div>
					</div>
					<div className='col-6 col-md-3 mb-4'>
						<div className='input-group'>
							<div className='input-group-prepend' title='Bed Time'>
								<span className='input-group-text bg-secondary px-2'>
									<Clock />
								</span>
							</div>
							<input
								name='bedTime'
								type='time'
								placeholder='(bed time)'
								value={currEntry.bedTime}
								onChange={(ev) => {
									let chgEntry = { ...currEntry }
									chgEntry.bedTime = ev.currentTarget.value
									setCurrEntry(chgEntry)
								}}
								className='form-control form-control-sm'
							/>
						</div>
					</div>
					<div className='col mb-4'>
						<div className='btn-group btn-group-sm my-auto w-100' role='group'>
							<button type='button' onClick={(_ev) => console.log('TODO:create_new')} className='btn btn-sm btn-success w-100'>
								<div className='row no-gutters align-items-center'>
									<div className='col-auto'>
										<PlusCircle size='1.2rem' />
									</div>
									<div className='col'>Add Dream</div>
								</div>
							</button>
							<button
								type='button'
								onClick={(_ev) => {
									let updEntry = { ...currEntry }
									updEntry.starred = !updEntry.starred
									setCurrEntry(updEntry)
								}}
								className='btn btn-sm btn-warning w-100'>
								<div className='row no-gutters align-items-center'>
									<div className='col-auto'>{currEntry.starred ? <StarFill size='1.2rem' /> : <Star size='1.2rem' />}</div>
									<div className='col'>{currEntry.starred ? 'Starred' : 'Un-Starred'}</div>
								</div>
							</button>
							<button type='button' onClick={() => console.log('TODO:')} className='btn btn-sm btn-danger w-25'>
								<Trash size='1.2rem' />
							</button>
						</div>
					</div>
				</div>
			</nav>
		)
	}

	function renderDreamTabNotes(): JSX.Element {
		return (
			<div role='tabpanel' aria-labelledby='drmtabNOTES-tab' key='dreamrowNOTES'>
				<div className='row'>
					<div className='col-12 col-md-6 mb-2'>
						<label className='text-muted text-uppercase text-sm'>Prep Notes</label>
						<textarea
							name='notesPrep'
							rows={10}
							value={currEntry.notesPrep}
							onChange={(ev) => {
								let newState = { ...currEntry }
								newState.notesPrep = ev.currentTarget.value
								setCurrEntry(newState)
							}}
							className='form-control'
						/>
					</div>
					<div className='col-12 col-md-6 mb-2'>
						<label className='text-muted text-uppercase text-sm'>Wake Notes</label>
						<textarea
							name='notesWake'
							rows={10}
							value={currEntry.notesWake}
							onChange={(ev) => {
								let newState = { ...currEntry }
								newState.notesWake = ev.currentTarget.value
								setCurrEntry(newState)
							}}
							className='form-control'
						/>
					</div>
				</div>
			</div>
		)
	}

	function renderDreamTab(dreamIdx: number): JSX.Element {
		let dream: IJournalDream = currEntry.dreams[dreamIdx]
		let isLucid = currEntry.dreams[dreamIdx].isLucidDream

		return (
			<div data-desc='dream-tab-pane'>
				<div className='row align-items-center mb-3' data-desc='title/btnGrp'>
					<div className='col'>
						<input
							name='title'
							type='text'
							placeholder='title'
							value={dream.title}
							onChange={(ev) => {
								let newState = { ...currEntry }
								newState.dreams[dreamIdx].title = ev.currentTarget.value
								setCurrEntry(newState)
							}}
							className='form-control'
						/>
					</div>
					<div className='col-auto'>
						<div className='btn-group my-auto w-100' role='group'>
							<button
								type='button'
								onClick={(_ev) => {
									let updEntry = { ...currEntry }
									updEntry.dreams[dreamIdx].isLucidDream = !updEntry.dreams[dreamIdx].isLucidDream
									setCurrEntry(updEntry)
								}}
								className={`btn btn-${isLucid ? 'success px-1' : 'secondary'} w-100`}>
								{isLucid ? <Check size='1.2rem' /> : 'Normal'}
							</button>
							{dream.isLucidDream && (
								<select
									name='lucidMethod'
									value={dream.lucidMethod || InductionTypes.dild}
									disabled={isBusySave}
									data-dream-idx={dreamIdx}
									onChange={(ev) => {
										let newState = { ...currEntry }
										newState.dreams[dreamIdx].lucidMethod = ev.currentTarget.value as InductionTypes
										setCurrEntry(newState)
									}}
									className='form-control w-100'
									style={{ minWidth: '100px' }}>
									{Object.keys(InductionTypes).map((type) => (
										<option value={type} key={'lucid-' + type + '-' + dreamIdx}>
											{InductionTypes[type]}
										</option>
									))}
								</select>
							)}
							<button type='button' title='Delete Dream' onClick={() => console.log('TODO:')} className='btn btn-danger'>
								<Trash size='1.2rem' />
							</button>
						</div>
					</div>
				</div>
				<div className='row mb-3' data-desc='tags'>
					<div className='col-12 col-lg mb-3 mb-lg-0'>
						<div className='bg-white'>
							<ReactTags
								allowNew={true}
								allowBackspace={false}
								minQueryLength={2}
								maxSuggestionsLength={6}
								tags={dream.dreamSigns.sort().map((sign, idx) => ({ id: idx, name: sign }))}
								suggestions={uniqueTags.map((sign, idx) => new Object({ id: idx, name: sign }))}
								onChange={(ev) => {
									let newState = { ...currEntry }
									newState.dreams[dreamIdx].dreamSigns = [...ev.currentTarget.value]
									setCurrEntry(newState)
								}}
								suggestionsFilter={(item: { id: number; name: string }, query: string) => item.name.indexOf(query.toLowerCase()) > -1}
								onDelete={(idx: number) => {
									let newState = { ...currEntry }
									newState.dreams[dreamIdx].dreamSigns.splice(idx, 1)
									setCurrEntry(newState)
								}}
								onAddition={(tag: IDreamSignTag) => {
									let newState = { ...currEntry }
									// Dont allow dupes
									if (newState.dreams[dreamIdx].dreamSigns.indexOf(tag.name.trim()) === -1) {
										newState.dreams[dreamIdx].dreamSigns.push(tag.name.toLowerCase())
									}
									setCurrEntry(newState)
								}}
								addOnBlur={true}
							/>
						</div>
					</div>
				</div>
				<div className='row mb-0' data-desc='details'>
					<div className='col'>
						<label className='text-muted text-uppercase text-sm'>Dream Details</label>
						<textarea
							name='notes'
							className='form-control'
							rows={14}
							value={dream.notes}
							onChange={(ev) => {
								let newState = { ...currEntry }
								newState.dreams[dreamIdx].notes = ev.currentTarget.value
								setCurrEntry(newState)
							}}
						/>
					</div>
				</div>
			</div>
		)
	}

	return (
		<section>
			<Modal size='lg' show={showModal} onHide={() => props.setShowDialog(false)} backdrop='static'>
				<Modal.Header className='bg-info' closeButton>
					<Modal.Title className='text-white h6'>Journal Entry</Modal.Title>
				</Modal.Header>

				<Modal.Body className='container bg-light p-0'>
					{renderToolbar()}
					<div className='border-bottom border-secondary px-4'>
						<ul className='nav nav-tabs' role='tablist'>
							<li className='nav-item' key='tabDream00'>
								<a href='#' onClick={() => setSelectedTab(-1)} className={'nav-link' + (selectedTab === -1 ? ' active' : '')} data-toggle='tab' role='tab'>
									Notes
								</a>
							</li>
							{currEntry.dreams.map((_dream, idx) => (
								<li className='nav-item' key={`tabDream${idx}`}>
									<a href='#' onClick={() => setSelectedTab(idx)} className={`nav-link ${idx === selectedTab ? 'active' : ''}`} data-toggle='tab' role='tab'>
										{`Dream ${idx + 1}`}
									</a>
								</li>
							))}
						</ul>
					</div>
					<div className='tab-content py-3 px-4'>
						{selectedTab === -1 ? renderDreamTabNotes() : <div className='tab-content'>{renderDreamTab(selectedTab)}</div>}
					</div>
				</Modal.Body>

				{isBusySave ? (
					<Modal.Footer className='px-4'>
						<div className='spinner-border spinner-border-lg text-primary' role='status'>
							<span className='sr-only' />
						</div>
					</Modal.Footer>
				) : (
					<Modal.Footer className='px-4'>
						<Button type='button' variant='outline-secondary' className='mr-2' onClick={() => props.setShowDialog(false)}>
							Cancel
						</Button>
						<button type='submit' className='btn btn-primary px-5' onClick={() => console.log('TODO:')}>
							<Save size='16' className='mt-n1 mr-2' />
							Save
						</button>
					</Modal.Footer>
				)}
			</Modal>

			{/* TEMP BELOW - move to using `props.showModal` */}
			<button className='btn btn-success' onClick={() => setShowModal(true)}>
				Edit Entry
			</button>
		</section>
	)
}
