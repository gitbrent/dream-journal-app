/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useContext } from 'react'
import { IJournalDream, IJournalEntry, InductionTypes } from './app.types'
import { Calendar3, ChatLeftText, Clock, PlusCircle, Save, Trash, Trophy, TrophyFill } from 'react-bootstrap-icons'
import { DateTime } from 'luxon'
import { DataContext } from '../api-google/DataContext'
import * as bootstrap from 'bootstrap'
import ModalReactTags from './components/modal-react-tags'
import Modal from 'bootstrap/js/dist/modal'

export interface IModalEntryProps {
	currEntry?: IJournalEntry
	currDreamIdx?: number
	showModal: boolean
	setShowModal: (arg0: boolean) => void
}

export default function ModalEntry(props: IModalEntryProps) {
	const {
		getUniqueDreamTags, doesEntryDateExist, doEntryAdd, doEntryEdit, doEntryDelete, doSaveDataFile
	} = useContext(DataContext)
	//
	const NEW_DREAM = {
		title: '',
		notes: '',
		dreamSigns: [],
		dreamImages: [],
		isLucidDream: false,
	}
	const NEW_ENTRY: IJournalEntry = {
		entryDate: DateTime.now().toFormat('yyyy-MM-dd'),
		bedTime: '01:30',
		notesPrep: '',
		notesWake: '',
		dreams: [{ ...NEW_DREAM }],
	}
	const [isBusySave, setIsBusySave] = useState(false)
	const [currEntry, setCurrEntry] = useState<IJournalEntry>({ ...NEW_ENTRY })
	const [uniqueTags, setUniqueTags] = useState<string[]>([])
	const [isDateDupe, setIsDateDupe] = useState(false)
	const [modal, setModal] = useState<Modal>()

	useEffect(() => {
		if (!modal) setModal(new Modal(document.getElementById('myModal') as Element))
	}, [])

	useEffect(() => {
		if (modal) {
			if (props.showModal) {
				modal.show()
			}
			else {
				modal.hide()
			}
		}
	}, [modal, props.showModal])

	useEffect(() => {
		setCurrEntry(props.currEntry ? props.currEntry : { ...NEW_ENTRY })
		setUniqueTags(getUniqueDreamTags())
	}, [props.currEntry])

	useEffect(() => {
		const someTabTriggerEl = document.getElementById(typeof props.currDreamIdx === 'number' ? `modalNav${props.currDreamIdx}` : 'modalNavNotes')
		if (someTabTriggerEl) {
			const tab = new bootstrap.Tab(someTabTriggerEl)
			tab.show()
		}
	}, [props.currEntry, props.showModal, props.currDreamIdx])

	// -----------------------------------------------------------------------

	function handleSave() {
		if (props.currEntry) {
			doEntryEdit(currEntry, props.currEntry.entryDate)
		} else {
			if (doesEntryDateExist(currEntry.entryDate)) {
				alert('Date already exists!')
				return
			}
			doEntryAdd(currEntry)
		}

		doSaveDataFile()
	}

	function handleClose() {
		setIsBusySave(false)
		setIsDateDupe(false)
		props.setShowModal(false)
	}

	function handleDelete() {
		if (!confirm('PLEASE CONFIRM\n^^^^^^ ^^^^^^^\n\nYou are deleting this *entire journal entry*!')) return

		doEntryDelete(currEntry.entryDate)
		saveDataFile()
	}

	async function saveDataFile() {
		setIsBusySave(true)
		await doSaveDataFile()
		handleClose()
	}

	// -----------------------------------------------------------------------

	function renderTopToolbar(): JSX.Element {
		return (
			<nav>
				<div className='row align-items-center'>
					<div className='col-6 col-lg-3 mb-4'>
						<div className='input-group match-btn-group-sm'>
							<div className='input-group-prepend' title='Entry Date'>
								<span className='input-group-text px-2'>
									<Calendar3 />
								</span>
							</div>
							<input
								name='entryDate'
								type='date'
								title='(entry date)'
								value={currEntry.entryDate}
								onChange={(ev) => {
									const chgEntry = { ...currEntry }
									chgEntry.entryDate = ev.currentTarget.value
									setCurrEntry(chgEntry)
									setIsDateDupe(doesEntryDateExist(ev.currentTarget.value))
								}}
								className={`form-control form-control-sm ${isDateDupe && 'is-invalid'}`}
								required
							/>
						</div>
					</div>
					<div className='col-6 col-lg-3 mb-4'>
						<div className='input-group match-btn-group-sm'>
							<div className='input-group-prepend' title='Bed Time'>
								<span className='input-group-text px-2'>
									<Clock />
								</span>
							</div>
							<input
								name='bedTime'
								type='time'
								title='(bed time)'
								value={currEntry.bedTime}
								onChange={(ev) => {
									const chgEntry = { ...currEntry }
									chgEntry.bedTime = ev.currentTarget.value
									setCurrEntry(chgEntry)
								}}
								className='form-control form-control-sm'
							/>
						</div>
					</div>
					<div className='col mb-4'>
						<div className='btn-group btn-group-sm my-auto w-100' role='group'>
							<button
								type='button'
								onClick={() => {
									const updEntry = { ...currEntry }
									updEntry.dreams.push({ ...NEW_DREAM })
									setCurrEntry(updEntry)
								}}
								className='btn btn-success w-100'>
								<div className='row g-0 align-items-center'>
									<div className='col-auto'>
										<PlusCircle style={{ marginTop: '-2px' }} />
									</div>
									<div className='col'>Add Dream</div>
								</div>
							</button>
							<button type='button' onClick={() => handleDelete()} className='btn btn-danger w-25'>
								<Trash size='1rem' style={{ marginTop: '-2px' }} />
							</button>
						</div>
					</div>
				</div>
			</nav>
		)
	}

	function renderTabNotes(): JSX.Element {
		return (
			<div>
				<div className='mb-3'>
					<div className='form-floating'>
						<textarea
							id='notesPrep'
							name='notesPrep'
							title='Prep Notes'
							//rows={10}
							value={currEntry.notesPrep}
							onChange={(ev) => {
								const newState = { ...currEntry }
								newState.notesPrep = ev.currentTarget.value
								setCurrEntry(newState)
							}}
							className='form-control'
							style={{ height: '240px' }}
						/>
						<label htmlFor='notesPrep'><ChatLeftText className='me-2' />Prep Notes</label>
					</div>
				</div>
				<div>
					<div className='form-floating'>
						<textarea
							id='notesWake'
							name='notesWake'
							title='Wake Notes'
							//rows={7}
							value={currEntry.notesWake}
							onChange={(ev) => {
								const newState = { ...currEntry }
								newState.notesWake = ev.currentTarget.value
								setCurrEntry(newState)
							}}
							className='form-control'
							style={{ height: '120px' }}
						/>
						<label htmlFor='notesWake'><ChatLeftText className='me-2' />Wake Notes</label>
					</div>
				</div>
			</div>
		)
	}

	function renderTabDream(dreamIdx: number): JSX.Element {
		const dream: IJournalDream = currEntry.dreams[dreamIdx]
		const isLucid = dream ? currEntry.dreams[dreamIdx].isLucidDream : false

		return dream ? (
			<div data-desc='dream-tab-pane'>
				<div className='row align-items-center' data-desc='title/btnGrp'>
					<div className='col'>
						<input
							name='title'
							type='text'
							placeholder='title'
							value={dream.title}
							onChange={(ev) => {
								const newState = { ...currEntry }
								newState.dreams[dreamIdx].title = ev.currentTarget.value
								setCurrEntry(newState)
							}}
							className='form-control'
						/>
					</div>
					<div className='col-auto'>
						<div className='btn-group my-auto' role='group' aria-label='dream toolbar group'>
							<button
								type='button'
								title={isLucid ? 'Lucid Dream' : 'Non-Lucid Dream'}
								onClick={() => {
									const updEntry = { ...currEntry }
									updEntry.dreams[dreamIdx].isLucidDream = !updEntry.dreams[dreamIdx].isLucidDream
									setCurrEntry(updEntry)
								}}
								className={`btn btn-${isLucid ? 'success' : 'secondary'} px-2`}>
								{isLucid ? <TrophyFill size='1rem' /> : <Trophy size='1rem' />}
							</button>
							{dream.isLucidDream && (
								<div className='btn-group'>
									<button
										id='btnGroupDropIndType'
										type='button'
										title='Induction Type'
										data-toggle='dropdown'
										aria-haspopup='true'
										aria-expanded='false'
										className='btn btn-success text-white dropdown-toggle'>
										{dream.lucidMethod ? dream.lucidMethod : InductionTypes.dild}
									</button>
									<div className='dropdown-menu' aria-labelledby='btnGroupDropIndType'>
										{Object.keys(InductionTypes).map((type) => (
											<a
												key={`lucid-${type}-${dreamIdx}`}
												className={`dropdown-item ${dream.lucidMethod === type ? 'active' : ''}`}
												href='#'
												onClick={() => {
													const newState = { ...currEntry }
													newState.dreams[dreamIdx].lucidMethod = type as InductionTypes
													setCurrEntry(newState)
												}}>
												{InductionTypes[type as keyof typeof InductionTypes]}
											</a>
										))}
									</div>
								</div>
							)}
							<button
								type='button'
								title='Delete Dream'
								onClick={() => {
									if (confirm(`Delete Dream #${dreamIdx + 1}?`)) {
										const newState = { ...currEntry }
										newState.dreams.splice(dreamIdx, 1)
										if (newState.dreams.length === 0) newState.dreams.push({ ...NEW_DREAM })
										setCurrEntry(newState)
									}
								}}
								className='btn btn-danger px-2'>
								<Trash size='1rem' />
							</button>
						</div>
					</div>
				</div>
				<div className='py-3'>
					<ModalReactTags uniqueTags={uniqueTags} currEntry={currEntry} setCurrEntry={setCurrEntry} dreamIdx={dreamIdx} />
				</div>
				<div className='row' data-desc='details'>
					<div className='col'>
						<textarea
							id='notes'
							name='notes'
							placeholder='Dream Summary'
							//rows={16}
							value={dream.notes}
							onChange={(ev) => {
								const newState = { ...currEntry }
								newState.dreams[dreamIdx].notes = ev.currentTarget.value
								setCurrEntry(newState)
							}}
							className='form-control'
							style={{ height: '290px' }}
						/>
					</div>
				</div>
			</div>
		) : (
			<div />
		)
	}

	return (
		<div id='myModal' className='modal' data-bs-backdrop='static' tabIndex={-1}>
			<div className='modal-dialog modal-lg'>
				<div className='modal-content'>
					<div className='modal-header bg-primary'>
						<h5 className='modal-title'>Journal Entry</h5>
						<button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close' onClick={() => handleClose()}></button>
					</div>
					<div className='modal-body p-3'>
						{renderTopToolbar()}
						<ul className='nav nav-tabs' id='entryTab' role='tablist'>
							<li className='nav-item' role='presentation'>
								<button
									className='nav-link active'
									id='modalNavNotes'
									data-bs-target='#modalTabNotes'
									aria-controls='modalTabNotes'
									data-bs-toggle='tab'
									type='button'
									role='tab'
									aria-selected='true'>
									Notes
								</button>
							</li>
							{currEntry.dreams.map((_dream, idx) => (
								<li className='nav-item' role='presentation' key={`tabDream${idx}`}>
									<button
										className='nav-link'
										id={`modalNav${idx}`}
										data-bs-target={`#modalTab${idx}`}
										aria-controls={`modalTab${idx}`}
										data-bs-toggle='tab'
										type='button'
										role='tab'
										aria-selected='false'>
										{`Dream ${idx + 1}`}
									</button>
								</li>
							))}
						</ul>
						<div className='tab-content'>
							<div className='tab-pane active p-3' id='modalTabNotes' role='tabpanel' aria-labelledby='modalNavNotes'>
								{renderTabNotes()}
							</div>
							{currEntry.dreams.map((_dream, idx) => (
								<div className='tab-pane p-3' id={`modalTab${idx}`} role='tabpanel' aria-labelledby={`modalTab${idx}`} key={`tab${idx + 1}`}>
									{renderTabDream(idx)}
								</div>
							))}
						</div>
					</div>
					<div className='modal-footer'>
						<button type='button' className='btn btn-secondary' onClick={() => handleClose()}>
							Close
						</button>
						<button type='submit' onClick={() => handleSave()} className='btn btn-primary px-5' disabled={isDateDupe}>
							{isBusySave ? (
								<span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
							) : (
								<Save size='16' className='mt-n1 me-2' />
							)}
							Save
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
