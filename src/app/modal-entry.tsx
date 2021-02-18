/**
 * 2.0 form
 */
import React, { useState, useEffect } from 'react'
import * as GDrive from './google-oauth'
import { IDreamSignTag, IJournalDream, IJournalEntry, InductionTypes } from './app.types'
import ReactTags from 'react-tag-autocomplete'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { Calendar3, Clock, PlusCircle, Save, Star, StarFill, Trash, Trophy, TrophyFill } from 'react-bootstrap-icons'

export interface IModalEntryProps {
	currEntry: IJournalEntry
	showModal: boolean
	setShowModal: Function
}

export default function TabAdmin(props: IModalEntryProps) {
	const NEW_DREAM = {
		title: '',
		notes: '',
		dreamSigns: [],
		dreamImages: [],
		isLucidDream: false,
		lucidMethod: null,
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
	useEffect(() => {
		setShowModal(props.showModal)
		setUniqueTags(GDrive.getUniqueDreamTags)
		if (props.showModal) setSelectedTab(-1)
	}, [props.showModal])

	useEffect(() => setCurrEntry(props.currEntry ? props.currEntry : { ...NEW_ENTRY }), [props.currEntry])

	// -----------------------------------------------------------------------

	function handleSave() {
		if (props.currEntry) {
			GDrive.doEntryEdit(currEntry, props.currEntry.entryDate)
		} else {
			if (GDrive.doesEntryDateExist(currEntry.entryDate)) {
				alert('Date already exists!')
				return
			}
			GDrive.doEntryAdd(currEntry)
		}

		doSaveDataFile()
	}

	function handleDelete() {
		if (!confirm('PLEASE CONFIRM\n^^^^^^ ^^^^^^^\n\nYou are deleting this *entire journal entry*!')) return

		GDrive.doEntryDelete(currEntry.entryDate)
		doSaveDataFile()
	}

	function doSaveDataFile() {
		setIsBusySave(true)

		GDrive.doSaveFile()
			.then(() => {
				setShowModal(false)
				setIsBusySave(false)
				props.setShowModal(false)
			})
			.catch((ex) => {
				setIsBusySave(false)
				// TODO: Show error message somewhere on dialog! (20190324)
				// Set errstate and show message in DialogFooter
				alert(ex)
			})
	}

	// -----------------------------------------------------------------------

	function renderTopToolbar(): JSX.Element {
		return (
			<nav>
				<div className='row align-items-center pt-4'>
					<div className='col-6 col-lg-3 mb-4'>
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
								className={`form-control form-control-sm ${isDateDupe && 'is-invalid'}`}
								required
							/>
						</div>
					</div>
					<div className='col-6 col-lg-3 mb-4'>
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
							<button
								type='button'
								onClick={(_ev) => {
									let updEntry = { ...currEntry }
									updEntry.dreams.push({ ...NEW_DREAM })
									setCurrEntry(updEntry)
									setSelectedTab(updEntry.dreams.length - 1)
								}}
								className='btn btn-success w-100'>
								<div className='row g-0 align-items-center'>
									<div className='col-auto'>
										<PlusCircle style={{ marginTop: '-2px' }} />
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
								className='btn btn-warning w-100'>
								<div className='row g-0 align-items-center'>
									<div className='col-auto'>
										{currEntry.starred ? <StarFill size='1rem' style={{ marginTop: '-2px' }} /> : <Star size='1rem' style={{ marginTop: '-2px' }} />}
									</div>
									<div className='col'>{currEntry.starred ? 'Starred' : 'Un-Starred'}</div>
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
			<div role='tabpanel' aria-labelledby='drmtabNOTES-tab' key='dreamrowNOTES'>
				<div className='mb-3'>
					<div className='form-floating'>
						<textarea
							id='notesPrep'
							name='notesPrep'
							//rows={10}
							value={currEntry.notesPrep}
							onChange={(ev) => {
								let newState = { ...currEntry }
								newState.notesPrep = ev.currentTarget.value
								setCurrEntry(newState)
							}}
							className='form-control'
							style={{ height: '240px' }}
						/>
						<label htmlFor='notesPrep' className='text-muted text-uppercase text-sm'>
							Prep Notes
						</label>
					</div>
				</div>
				<div>
					<div className='form-floating'>
						<textarea
							id='notesWake'
							name='notesWake'
							//rows={7}
							value={currEntry.notesWake}
							onChange={(ev) => {
								let newState = { ...currEntry }
								newState.notesWake = ev.currentTarget.value
								setCurrEntry(newState)
							}}
							className='form-control'
							style={{ height: '180px' }}
						/>
						<label htmlFor='notesWake' className='text-muted text-uppercase text-sm'>
							Wake Notes
						</label>
					</div>
				</div>
			</div>
		)
	}

	function renderTabDream(dreamIdx: number): JSX.Element {
		let dream: IJournalDream = currEntry.dreams[dreamIdx]
		let isLucid = currEntry.dreams[dreamIdx].isLucidDream

		return (
			<div data-desc='dream-tab-pane'>
				<div className='row align-items-center' data-desc='title/btnGrp'>
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
						<div className='btn-group my-auto' role='group' aria-label='dream toolbar group'>
							<button
								type='button'
								title={isLucid ? 'Lucid Dream' : 'Non-Lucid Dream'}
								onClick={(_ev) => {
									let updEntry = { ...currEntry }
									updEntry.dreams[dreamIdx].isLucidDream = !updEntry.dreams[dreamIdx].isLucidDream
									setCurrEntry(updEntry)
								}}
								className={`btn btn-${isLucid ? 'success' : 'secondary'} px-2`}>
								{isLucid ? <TrophyFill size='1rem' /> : <Trophy size='1rem' />}
							</button>
							{dream.isLucidDream && (
								<div className='btn-group' role='lucid type group'>
									<button
										id='btnGroupDropIndType'
										type='button'
										title='Induction Type'
										data-toggle='dropdown'
										aria-haspopup='true'
										aria-expanded='false'
										className='btn btn-success text-white dropdown-toggle'>
										{dream.lucidMethod ? InductionTypes[dream.lucidMethod] : InductionTypes.dild}
									</button>
									<div className='dropdown-menu' aria-labelledby='btnGroupDropIndType'>
										{Object.keys(InductionTypes).map((type) => (
											<a
												key={`lucid-${type}-${dreamIdx}`}
												className={`dropdown-item ${dream.lucidMethod === type ? 'active' : ''}`}
												href='#'
												onClick={(_ev) => {
													let newState = { ...currEntry }
													newState.dreams[dreamIdx].lucidMethod = type as InductionTypes
													setCurrEntry(newState)
												}}>
												{InductionTypes[type]}
											</a>
										))}
									</div>
								</div>
							)}
							<button
								type='button'
								title='Delete Dream'
								onClick={(_ev) => {
									if (confirm(`Delete Dream #${dreamIdx + 1}?`)) {
										let newState = { ...currEntry }
										newState.dreams.splice(dreamIdx, 1)
										if (newState.dreams.length === 0) newState.dreams.push({ ...NEW_DREAM })
										setCurrEntry(newState)
										setSelectedTab(0)
									}
								}}
								className='btn btn-danger px-2'>
								<Trash size='1rem' />
							</button>
						</div>
					</div>
				</div>
				<ReactTags
					allowNew={true}
					allowBackspace={false}
					minQueryLength={2}
					maxSuggestionsLength={6}
					tags={dream.dreamSigns.sort().map((sign, idx) => ({ id: idx, name: sign }))}
					suggestions={uniqueTags.map((sign, idx) => new Object({ id: idx, name: sign }))}
					suggestionsFilter={(item: { id: number; name: string }, query: string) => item.name.indexOf(query.toLowerCase()) > -1}
					addOnBlur={true}
					onAddition={(tag: IDreamSignTag) => {
						let newState = { ...currEntry }
						// Dont allow dupes
						if (newState.dreams[dreamIdx].dreamSigns.indexOf(tag.name.trim()) === -1) {
							newState.dreams[dreamIdx].dreamSigns.push(tag.name.toLowerCase())
						}
						setCurrEntry(newState)
					}}
					onChange={(ev) => {
						let newState = { ...currEntry }
						newState.dreams[dreamIdx].dreamSigns = [...ev.currentTarget.value]
						setCurrEntry(newState)
					}}
					onDelete={(idx: number) => {
						let newState = { ...currEntry }
						newState.dreams[dreamIdx].dreamSigns.splice(idx, 1)
						setCurrEntry(newState)
					}}
					className='my-2'
				/>
				<div className='row' data-desc='details'>
					<div className='col'>
						<div className='form-floating'>
							<textarea
								id='notes'
								name='notes'
								//rows={16}
								value={dream.notes}
								onChange={(ev) => {
									let newState = { ...currEntry }
									newState.dreams[dreamIdx].notes = ev.currentTarget.value
									setCurrEntry(newState)
								}}
								className='form-control'
								style={{ height: '350px' }}
							/>
							<label htmlFor='notes'>Dream Summary</label>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<section>
			<Modal
				size='lg'
				show={showModal}
				onHide={() => {
					setShowModal(false)
					props.setShowModal(false)
				}}
				backdrop='static'>
				<Modal.Header className='bg-primary' closeButton>
					<Modal.Title className='text-white h6'>Journal Entry</Modal.Title>
				</Modal.Header>

				<Modal.Body className='container bg-light py-0 px-4'>
					{renderTopToolbar()}

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
					<div className='tab-content py-3'>{selectedTab === -1 ? renderTabNotes() : <div className='tab-content'>{renderTabDream(selectedTab)}</div>}</div>
				</Modal.Body>

				<Modal.Footer className='px-4'>
					<Button
						type='button'
						variant='outline-secondary'
						className='me-2'
						onClick={() => {
							setShowModal(false)
							props.setShowModal(false)
						}}>
						Cancel
					</Button>
					<button type='submit' onClick={() => handleSave()} className='btn btn-primary px-5' disabled={isDateDupe}>
						{isBusySave ? (
							<span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
						) : (
							<Save size='16' className='mt-n1 me-2' />
						)}
						Save
					</button>
				</Modal.Footer>
			</Modal>
		</section>
	)
}
