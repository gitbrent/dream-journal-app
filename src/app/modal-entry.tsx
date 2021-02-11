/**
 * 2.0 form
 */
import React, { useState, useEffect } from 'react'
import * as GDrive from './google-oauth'
import { CardDreamSignGrpViewType, IDreamSignTag, IDreamSignTagGroup, IDriveFile, IJournalDream, IJournalEntry, InductionTypes } from './app.types'
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import ReactTags from 'react-tag-autocomplete'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { Star, StarFill, Trash } from 'react-bootstrap-icons'

export interface IModalEntryProps {
	currEntry: IJournalEntry
}

export default function TabAdmin(props: IModalEntryProps) {
	/*
	const EMPTY_DREAM = {
		title: '',
		notes: '',
		dreamSigns: [],
		dreamImages: [],
		isLucidDream: false,
		lucidMethod: InductionTypes.none,
	}
	const NEW_ENTRY {
		// TODO: need better idea - UTC shows wrong date half the time (1 day ahead)
		//entryDate: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDay(), // TODO: mon/day both need zero-padding (eg: "06")
		entryDate: new Date().toISOString().substring(0, 10),
		bedTime: '',
		notesPrep: '',
		notesWake: '',
		starred: false,
		dreams: [EMPTY_DREAM],
	}
	*/

	const [showModal, setShowModal] = useState(false)
	const [isBusySave, setIsBusySave] = useState(false)

	useEffect(() => {
		//if (props.currEntry) exiting
		//or: new!
		// TODO:
	}, [props.currEntry])

	// -----------------------------------------------------------------------

	// TODO: replace all fields
	// TODO: remogve all "this."

	function renderDreamTab(dream: IJournalDream, dreamIdx: number): JSX.Element {
		return (
			<div
				className={'tab-pane pt-3' + (dreamIdx === this.state.selectedTab ? ' active' : '')}
				id={'drmtab' + dreamIdx}
				role='tabpanel'
				aria-labelledby={'drmtab' + dreamIdx + '-tab'}
				key={'dreamrow' + dreamIdx}>
				<div className='row align-items-center mb-3'>
					<div className='col-12 col-lg'>
						<label className='text-muted text-uppercase text-sm'>Title</label>
						<input name='title' type='text' className='form-control' value={dream.title} onChange={this.handleInputDreamChange} data-dream-idx={dreamIdx} />
					</div>
					<div className='col-5 col-lg-auto'>
						<label className='text-muted text-uppercase text-sm d-block'>Lucid?</label>
						<BootstrapSwitchButton
							onChange={(checked: boolean) => {
								let newState = this.state.dailyEntry
								newState.dreams[dreamIdx].isLucidDream = checked
								this.setState({ dailyEntry: newState })
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
							onChange={this.handleSelectDreamChange}
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
						<button type='button' title='Delete Dream' className='btn btn-outline-danger' onClick={(event) => this.handleDeleteDream(dreamIdx, event)}>
							<Trash size='16' />
						</button>
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
								suggestions={this.props.dreamSignTags}
								suggestionsFilter={(item: { id: number; name: string }, query: string) => item.name.indexOf(query.toLowerCase()) > -1}
								onDelete={(idx: number) => {
									let newState = this.state.dailyEntry
									newState.dreams[dreamIdx].dreamSigns.splice(idx, 1)
									this.setState({ dailyEntry: newState })
								}}
								onAddition={(tag: IDreamSignTag) => {
									let newState = this.state.dailyEntry
									// Dont allow dupes
									if (newState.dreams[dreamIdx].dreamSigns.indexOf(tag.name.trim()) === -1) {
										newState.dreams[dreamIdx].dreamSigns.push(tag.name.toLowerCase())
									}
									this.setState({ dailyEntry: newState })
								}}
								addOnBlur={true}
							/>
						</div>
					</div>
				</div>
				<div className='row'>
					<div className='col'>
						<label className='text-muted text-uppercase text-sm'>Dream Details</label>
						<textarea name='notes' className='form-control' rows={8} value={dream.notes} onChange={this.handleTextAreaDreamChange} data-dream-idx={dreamIdx} />
					</div>
				</div>
			</div>
		)
	}

	return (
		<section>
			<Modal size='lg' show={showModal} onHide={setShowModal(false)} backdrop='static'>
				<Modal.Header className='bg-info' closeButton>
					<Modal.Title className='text-white h6'>Journal Entry</Modal.Title>
				</Modal.Header>

				<Modal.Body className='bg-light p-4'>
					<div className='container px-0'>
						<div className='row mb-2'>
							<div className='col-6 required'>
								<label className='text-muted text-uppercase text-sm'>Entry Date</label>
								<input
									name='entryDate'
									type='date'
									value={this.state.dailyEntry.entryDate}
									onChange={this.handleInputChange}
									className={this.state.isDateDupe ? 'is-invalid form-control w-100' : 'form-control w-100'}
									required
								/>
								<div className='invalid-feedback'>Entry Date already exists in Dream Journal!</div>
							</div>
							<div className='col pr-0'>
								<label className='text-muted text-uppercase text-sm'>Bed Time</label>
								<input name='bedTime' type='time' value={this.state.dailyEntry.bedTime} onChange={this.handleInputChange} className='form-control w-100' />
							</div>
							<div className='col-auto'>
								<label className='text-muted text-uppercase text-sm'>&nbsp;</label>
								<div
									className={'d-block cursor-link'}
									title={this.state.dailyEntry.starred ? 'Un-Star Entry' : 'Star Entry'}
									onClick={() => {
										let newState = this.state.dailyEntry
										newState.starred = this.state.dailyEntry.starred ? false : true
										this.setState({ dailyEntry: newState })
									}}>
									{this.state.dailyEntry.starred ? <StarFill size='32' className='text-warning' /> : <Star size='32' />}
								</div>
							</div>
						</div>

						<div className='row mb-4'>
							<div className='col-12 col-md-6 mb-2'>
								<label className='text-muted text-uppercase text-sm'>Prep Notes</label>
								<textarea name='notesPrep' value={this.state.dailyEntry.notesPrep} onChange={this.handleTextAreaChange} className='form-control' rows={1} />
							</div>
							<div className='col-12 col-md-6 mb-2'>
								<label className='text-muted text-uppercase text-sm'>Wake Notes</label>
								<textarea name='notesWake' value={this.state.dailyEntry.notesWake} onChange={this.handleTextAreaChange} className='form-control' rows={1} />
							</div>
						</div>

						<div className='row align-items-center'>
							<div className='col pr-0'>
								<ul className='nav nav-tabs border-bottom border-secondary' role='tablist'>
									{this.state.dailyEntry.dreams.map((_dream, idx) => (
										<li className='nav-item' key={'dreamtab' + idx}>
											<a
												className={'nav-link' + (idx === this.state.selectedTab ? ' active' : '')}
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
								<button type='button' className='btn btn-sm btn-outline-success' onClick={this.handleAddDream}>
									New Dream
								</button>
							</div>
						</div>

						<div className='tab-content'>{this.state.dailyEntry.dreams.map((dream, idx) => renderDreamTab(dream, idx))}</div>
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
						<div className='d-block d-sm-none'>
							<button type='button' className='btn btn-outline-danger' onClick={this.handleDelete}>
								Delete
							</button>
						</div>
						<div className='d-none d-sm-block'>
							<button type='button' className='btn btn-outline-danger mr-5' onClick={this.handleDelete}>
								Delete Entry
							</button>
						</div>
						<Button type='button' variant='outline-secondary' className='px-4 mr-2' onClick={() => setShowModal(false)}>
							Cancel
						</Button>
						<div className='d-block d-sm-none'>
							<button type='submit' className='btn btn-primary' onClick={this.handleSubmit}>
								Save
							</button>
						</div>
						<div className='d-none d-sm-block'>
							<button type='submit' className='btn btn-primary px-4' onClick={this.handleSubmit}>
								Save Entry
							</button>
						</div>
					</Modal.Footer>
				)}
			</Modal>

			<button className='btn btn-success' onClick={() => setShowModal(true)}>
				Edit Entry
			</button>
		</section>
	)
}
