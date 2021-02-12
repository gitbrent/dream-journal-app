/**
 * 2.0 form
 */
import React, { useState, useEffect } from 'react'
import * as GDrive from './google-oauth'
import { IDreamSignTag, IJournalDream, IJournalEntry, InductionTypes } from './app.types'
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import ReactTags from 'react-tag-autocomplete'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { Calendar3, Clock, PlusCircle, Save, Star, StarFill, Trash, XCircle } from 'react-bootstrap-icons'

export interface IModalEntryProps {
	currEntry: IJournalEntry
	showDialog: boolean
}

enum NavShowType {
	viewNotes = 'Notes',
	viewDreams = 'Dream 1',
}

export default function TabAdmin(props: IModalEntryProps) {
	const NEW_DREAM = {
		title: '',
		notes: '',
		dreamSigns: [],
		dreamImages: [],
		isLucidDream: false,
		lucidMethod: InductionTypes.none,
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
	const [navShowType, setNavShowType] = useState(NavShowType.viewNotes)
	const [selectedTab, setSelectedTab] = useState(0)

	/** Set/Clear Entry */
	useEffect(() => setCurrEntry(props.currEntry ? props.currEntry : { ...NEW_ENTRY }), [props.currEntry])
	useEffect(() => setUniqueTags(GDrive.getUniqueDreamTags), [props.showDialog])

	// -----------------------------------------------------------------------

	function renderDreamTab(dream: IJournalDream, dreamIdx: number): JSX.Element {
		return (
			<div
				className={'tab-pane pt-3' + (dreamIdx === selectedTab ? ' active' : '')}
				id={'drmtab' + dreamIdx}
				role='tabpanel'
				aria-labelledby={'drmtab' + dreamIdx + '-tab'}
				key={'dreamrow' + dreamIdx}>
				<div className='row align-items-center mb-3'>
					<div className='col-12 col-lg'>
						<label className='text-muted text-uppercase text-sm'>Title</label>
						<input name='title' type='text' className='form-control' value={dream.title} onChange={() => console.log('TODO:')} data-dream-idx={dreamIdx} />
					</div>
					<div className='col-5 col-lg-auto'>
						<label className='text-muted text-uppercase text-sm d-block'>Lucid?</label>
						<BootstrapSwitchButton
							onChange={(checked: boolean) => {
								let newState = { ...currEntry }
								newState.dreams[dreamIdx].isLucidDream = checked
								setCurrEntry(newState)
							}}
							checked={dream.isLucidDream}
							onlabel='Y'
							onstyle='outline-success'
							offlabel='N'
							offstyle='outline-dark'
							style='w-100'
						/>
					</div>
					<div className='col-5 col-lg-auto'>
						<label className='text-muted text-uppercase text-sm d-block'>Method</label>
						<select
							name='lucidMethod'
							value={dream.lucidMethod || InductionTypes.none}
							disabled={!dream.isLucidDream}
							data-dream-idx={dreamIdx}
							onChange={(ev) => {
								let newState = { ...currEntry }
								newState.dreams[dreamIdx].lucidMethod = ev.currentTarget.value as InductionTypes
								setCurrEntry(newState)
							}}
							className='form-control'>
							{Object.keys(InductionTypes).map((type) => (
								<option value={type} key={'lucid-' + type + '-' + dreamIdx}>
									{InductionTypes[type]}
								</option>
							))}
						</select>
					</div>
					<div className='col-2 col-lg-auto'>
						<label className='text-muted text-uppercase text-sm d-block'>Delete</label>
					</div>
				</div>
				<div className='row mb-3'>
					<div className='col-12 col-lg mb-3 mb-lg-0'>
						<label className='text-muted text-uppercase text-sm d-block'>DreamSign Tags</label>
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
				<div className='row'>
					<div className='col'>
						<label className='text-muted text-uppercase text-sm'>Dream Details</label>
						<textarea
							name='notes'
							className='form-control'
							rows={8}
							value={dream.notes}
							onChange={(ev) => {
								let newState = { ...currEntry }
								newState.dreams[dreamIdx].notes = ev.currentTarget.value
								setCurrEntry(newState)
							}}
							data-dream-idx={dreamIdx}
						/>
					</div>
				</div>
			</div>
		)
	}

	function renderToolbar(): JSX.Element {
		return (
			<nav>
				<div className='row border-bottom border-secondary p-3'>
					<div className='col-6 col-md-3'>
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
					<div className='col-6 col-md-3'>
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
					<div className='col-12 col-md'>
						<div className='btn-group btn-group-sm w-100' role='group'>
							<button
								type='button'
								onClick={() => setNavShowType(NavShowType.viewDreams)}
								className={`btn btn-secondary ${navShowType === NavShowType.viewDreams ? 'active' : ''}`}>
								D1
							</button>
							<button
								type='button'
								onClick={() => setNavShowType(NavShowType.viewDreams)}
								className={`btn btn-secondary ${navShowType === NavShowType.viewDreams ? 'active' : ''}`}>
								D2
							</button>
							<button
								type='button'
								onClick={() => setNavShowType(NavShowType.viewDreams)}
								className={`btn btn-secondary ${navShowType === NavShowType.viewDreams ? 'active' : ''}`}>
								D3
							</button>
							<button
								type='button'
								onClick={() => setNavShowType(NavShowType.viewNotes)}
								className={`btn btn-secondary ${navShowType === NavShowType.viewNotes ? 'active' : ''}`}>
								{NavShowType.viewNotes}
							</button>
						</div>
					</div>
					<div className='col-auto'>
						<div className='btn-group btn-group-sm my-auto' role='group'>
							<button type='button' onClick={(_ev) => console.log('TODO:create_new')} className='btn btn-success px-2'>
								<div className='row no-gutters align-items-center'>
									<div className='col-auto'>
										<PlusCircle size='1.2rem' />
									</div>
									<div className='col px-2'>Add</div>
								</div>
							</button>
							<button
								type='button'
								onClick={(_ev) => {
									let updEntry = { ...currEntry }
									updEntry.starred = !updEntry.starred
									setCurrEntry(updEntry)
								}}
								className='btn btn-sm btn-warning'>
								{currEntry.starred ? <StarFill size='1.2rem' /> : <Star size='1.2rem' />}
							</button>
							<button type='button' onClick={() => console.log('TODO:')} className='btn btn-sm btn-danger'>
								<Trash size='1.2rem' />
							</button>
						</div>
					</div>
				</div>
			</nav>
		)
	}

	function renderToolbar_GOOD(): JSX.Element {
		return (
			<nav>
				<div className='row justify-content-between border-bottom border-secondary px-4 py-3'>
					<div className='col-6 col-md-3'>
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
					<div className='col-6 col-md-3'>
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
					<div className='col-12 col-md text-center'>
						<div className='btn-group btn-group-sm my-auto' role='group'>
							<button
								type='button'
								onClick={() => setNavShowType(NavShowType.viewNotes)}
								className={`btn btn-secondary px-4 ${navShowType === NavShowType.viewNotes ? 'active' : ''}`}>
								{NavShowType.viewNotes}
							</button>
							<button
								type='button'
								onClick={() => setNavShowType(NavShowType.viewDreams)}
								className={`btn btn-secondary px-4 ${navShowType === NavShowType.viewDreams ? 'active' : ''}`}>
								{NavShowType.viewDreams}
							</button>
						</div>
					</div>
					<div className='col-auto px-1'>
						<button
							type='button'
							onChange={(_ev) => {
								let updEntry = { ...currEntry }
								updEntry.starred = !updEntry.starred
								setCurrEntry(updEntry)
								console.log(updEntry.starred)
							}}
							className='btn btn-sm btn-outline-warning'>
							{currEntry.starred ? <StarFill /> : <Star />}
						</button>
					</div>
					<div className='col-auto px-1'>
						<button type='button' onClick={() => console.log('TODO:')} className='btn btn-sm btn-outline-danger'>
							<Trash />
						</button>
					</div>
				</div>
			</nav>
		)
	}

	function renderToolbar2(): JSX.Element {
		return (
			<nav className='navbar navbar-expand-lg navbar-dark border-secondary border-bottom'>
				<button
					className='navbar-toggler'
					type='button'
					data-toggle='collapse'
					data-target='#navbarSupportedContent'
					aria-controls='navbarSupportedContent'
					aria-expanded='false'
					aria-label='Toggle navigation'>
					<span className='navbar-toggler-icon'></span>
				</button>

				<div className='collapse navbar-collapse' id='navbarSupportedContent'>
					<ul className='navbar-nav mr-auto'>
						<div className='row my-2 my-lg-0 mr-2'>
							<div className='col m-auto' style={{ maxWidth: '150px' }}>
								<div className='input-group'>
									<div className='input-group-prepend'>
										<span className='input-group-text'>
											<Calendar3 />
										</span>
									</div>
									<input
										name='entryDate'
										type='date'
										placeholder='Entry Date'
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
							<div className='col m-auto' style={{ maxWidth: '150px' }}>
								<div className='input-group'>
									<div className='input-group-prepend'>
										<span className='input-group-text'>
											<Clock />
										</span>
									</div>
									<input
										name='bedTime'
										type='time'
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
						</div>
						<div className='btn-group btn-group-sm' role='group' aria-label='Second group'>
							<button type='button' className='btn btn-secondary active'>
								Notes
							</button>
							<button type='button' className='btn btn-secondary'>
								Dreams
							</button>
						</div>
					</ul>
					<form className='form-inline my-2 my-lg-0'>
						<button className='btn btn-sm btn-outline-danger my-2 my-sm-0' type='button'>
							<Trash size='16' className='mt-n1 mr-1' />
							Delete
						</button>
					</form>
				</div>
			</nav>
		)
	}

	function renderBtnGroup(): JSX.Element {
		return (
			<div className='btn-toolbar justify-content-between px-3 py-2' role='toolbar'>
				<div className='btn-group btn-group-sm' role='group' aria-label='First group'>
					<button type='button' className='btn btn-outline-success'>
						<PlusCircle size='16' className='mt-n1' /> Dream
					</button>
				</div>
				<div className='btn-group btn-group-sm' role='group' aria-label='Second group'>
					<button type='button' className='btn btn-secondary active'>
						Dream 1
					</button>
					<button type='button' className='btn btn-secondary'>
						Dream 2
					</button>
					<button type='button' className='btn btn-secondary'>
						Dream 3
					</button>
					<button type='button' className='btn btn-secondary'>
						Dream 4
					</button>
				</div>
				<div className='btn-group btn-group-sm' role='group' aria-label='Third group'>
					<button type='button' className='btn btn-outline-danger'>
						<XCircle size='16' className='mt-n1' /> Dream
					</button>
				</div>
			</div>
		)
	}

	return (
		<section>
			<Modal size='lg' show={showModal} onHide={() => setShowModal(false)} backdrop='static'>
				<Modal.Header className='bg-info' closeButton>
					<Modal.Title className='text-white h6'>Journal Entry</Modal.Title>
				</Modal.Header>

				<Modal.Body className='container bg-light p-0'>
					{renderToolbar()}

					{navShowType === NavShowType.viewDreams ? (
						<div>
							{/*renderBtnGroup()*/}
							<div className='container pt-2 pr-4 pb-4 pl-4'>
								<div className='tab-content'>{currEntry.dreams.map((dream, idx) => renderDreamTab(dream, idx))}</div>
							</div>
						</div>
					) : (
						<div className='p-4'>
							<div className='row'>
								<div className='col-12 col-md-6 mb-2'>
									<label className='text-muted text-uppercase text-sm'>Prep Notes</label>
									<textarea
										name='notesPrep'
										rows={8}
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
										rows={8}
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
					)}
				</Modal.Body>

				{isBusySave ? (
					<Modal.Footer className='px-4'>
						<div className='spinner-border spinner-border-lg text-primary' role='status'>
							<span className='sr-only' />
						</div>
					</Modal.Footer>
				) : (
					<Modal.Footer className='px-4'>
						<Button type='button' variant='outline-secondary' className='mr-2' onClick={() => setShowModal(false)}>
							Cancel
						</Button>
						<button type='submit' className='btn btn-primary px-5' onClick={() => console.log('TODO:')}>
							<Save size='16' className='mt-n1 mr-2' />
							Save
						</button>
					</Modal.Footer>
				)}
			</Modal>

			<button className='btn btn-success' onClick={() => setShowModal(true)}>
				Edit Entry
			</button>
		</section>
	)
}
