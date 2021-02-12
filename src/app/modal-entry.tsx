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
import { Star, StarFill, Trash } from 'react-bootstrap-icons'

export interface IModalEntryProps {
	currEntry: IJournalEntry
	showDialog: boolean
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
	const [selectedTab, setSelectedTab] = useState(1)
	const [uniqueTags, setUniqueTags] = useState([])
	const [isDateDupe, setIsDateDupe] = useState(false)
	const [currEntry, setCurrEntry] = useState<IJournalEntry>({ ...NEW_ENTRY })

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
								let newState = currEntry
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
								let newState = currEntry
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
									let newState = currEntry
									newState.dreams[dreamIdx].dreamSigns = [...ev.currentTarget.value]
									setCurrEntry(newState)
								}}
								suggestionsFilter={(item: { id: number; name: string }, query: string) => item.name.indexOf(query.toLowerCase()) > -1}
								onDelete={(idx: number) => {
									let newState = currEntry
									newState.dreams[dreamIdx].dreamSigns.splice(idx, 1)
									setCurrEntry(newState)
								}}
								onAddition={(tag: IDreamSignTag) => {
									let newState = currEntry
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
								let newState = currEntry
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

	return (
		<section>
			<Modal size='lg' show={showModal} onHide={() => setShowModal(false)} backdrop='static'>
				<Modal.Header className='bg-info' closeButton>
					<Modal.Title className='text-white h6'>Journal Entry</Modal.Title>
				</Modal.Header>

				<Modal.Body className='bg-light p-4'>
					<div className='container px-0'>
						<div className='row no-gutters flex-nowrap' data-desc='root-row'>
							<nav className='col-auto'>
								<div className='btn-group btn-group-vertical' role='group'>
									<button type='button' className='btn btn-secondary'>
										1
									</button>
									<button type='button' className='btn btn-secondary'>
										2
									</button>
									<div className='btn-group' role='group'>
										<button
											id='btnGroupDrop1'
											type='button'
											className='btn btn-secondary dropdown-toggle'
											data-toggle='dropdown'
											aria-haspopup='true'
											aria-expanded='false'>
											Dropdown
										</button>
										<div className='dropdown-menu' aria-labelledby='btnGroupDrop1'>
											<a className='dropdown-item' href='#'>
												Dropdown link
											</a>
											<a className='dropdown-item' href='#'>
												Dropdown link
											</a>
										</div>
									</div>
								</div>
							</nav>
							<div className='col'>
								<div className='row mb-2'>
									<div className='col-6 required'>
										<label className='text-muted text-uppercase text-sm'>Entry Date</label>
										<input
											name='entryDate'
											type='date'
											value={currEntry.entryDate}
											onChange={(ev) => {
												let chgEntry = { ...currEntry }
												chgEntry.entryDate = ev.currentTarget.value
												setCurrEntry(chgEntry)
												setIsDateDupe(GDrive.doesEntryDateExist(ev.currentTarget.value))
											}}
											className={isDateDupe ? 'is-invalid form-control w-100' : 'form-control w-100'}
											required
										/>
										<div className='invalid-feedback'>Entry Date already exists in Dream Journal!</div>
									</div>
									<div className='col pr-0'>
										<label className='text-muted text-uppercase text-sm'>Bed Time</label>
										<input
											name='bedTime'
											type='time'
											value={currEntry.bedTime}
											onChange={(ev) => {
												let chgEntry = { ...currEntry }
												chgEntry.bedTime = ev.currentTarget.value
												setCurrEntry(chgEntry)
											}}
											className='form-control w-100'
										/>
									</div>
									<div className='col-auto'>
										<label className='text-muted text-uppercase text-sm'>&nbsp;</label>
										<div
											className={'d-block cursor-link'}
											title={currEntry.starred ? 'Un-Star Entry' : 'Star Entry'}
											onClick={() => {
												let newState = currEntry
												newState.starred = currEntry.starred ? false : true
												setCurrEntry(newState)
											}}>
											{currEntry.starred ? <StarFill size='32' className='text-warning' /> : <Star size='32' />}
										</div>
									</div>
								</div>

								<div className='row mb-4'>
									<div className='col-12 col-md-6 mb-2'>
										<label className='text-muted text-uppercase text-sm'>Prep Notes</label>
										<textarea
											name='notesPrep'
											value={currEntry.notesPrep}
											onChange={(ev) => {
												let newState = currEntry
												newState.notesPrep = ev.currentTarget.value
												setCurrEntry(newState)
											}}
											className='form-control'
											rows={1}
										/>
									</div>
									<div className='col-12 col-md-6 mb-2'>
										<label className='text-muted text-uppercase text-sm'>Wake Notes</label>
										<textarea
											name='notesWake'
											value={currEntry.notesWake}
											onChange={(ev) => {
												let newState = currEntry
												newState.notesWake = ev.currentTarget.value
												setCurrEntry(newState)
											}}
											className='form-control'
											rows={1}
										/>
									</div>
								</div>

								<div className='row align-items-center'>
									<div className='col pr-0'>
										<ul className='nav nav-tabs border-bottom border-secondary' role='tablist'>
											{currEntry.dreams.map((_dream, idx) => (
												<li className='nav-item' key={'dreamtab' + idx}>
													<a
														className={'nav-link' + (idx === selectedTab ? ' active' : '')}
														id={'drmtab' + idx + '-tab'}
														data-toggle='tab'
														href={'#drmtab' + idx}
														role='tab'
														aria-controls={'drmtab' + idx}>
														Dream {idx + 1}
													</a>
												</li>
											))}
										</ul>
									</div>
									<div className='col-auto'>
										<button type='button' className='btn btn-sm btn-outline-success' onClick={() => console.log('TODO:')}>
											New Dream
										</button>
									</div>
								</div>

								<div className='tab-content'>{currEntry.dreams.map((dream, idx) => renderDreamTab(dream, idx))}</div>
							</div>
						</div>
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
						<button type='button' className='btn btn-outline-danger' onClick={() => console.log('TODO:')}>
							Delete
						</button>
						<Button type='button' variant='outline-secondary' className='px-4 mr-2' onClick={() => setShowModal(false)}>
							Cancel
						</Button>
						<button type='submit' className='btn btn-primary' onClick={() => console.log('TODO:')}>
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
