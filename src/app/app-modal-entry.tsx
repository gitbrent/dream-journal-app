/*\
|*|  :: Brain Cloud Dream Journal ::
|*|
|*|  Dream Journal App - Record and Search Daily Dream Entries
|*|  https://github.com/gitbrent/dream-journal-app
|*|
|*|  This library is released under the MIT Public License (MIT)
|*|
|*|  Dream Journal App (C) 2019-present Brent Ely (https://github.com/gitbrent)
|*|
|*|  Permission is hereby granted, free of charge, to any person obtaining a copy
|*|  of this software and associated documentation files (the "Software"), to deal
|*|  in the Software without restriction, including without limitation the rights
|*|  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
|*|  copies of the Software, and to permit persons to whom the Software is
|*|  furnished to do so, subject to the following conditions:
|*|
|*|  The above copyright notice and this permission notice shall be included in all
|*|  copies or substantial portions of the Software.
|*|
|*|  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
|*|  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
|*|  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
|*|  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
|*|  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
|*|  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
|*|  SOFTWARE.
\*/

import * as React from 'react'
import { IJournalDream, IJournalEntry, InductionTypes } from './app'
import BootstrapSwitchButton from 'bootstrap-switch-button-react' // '../../../bootstrap-switch-button-react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
// FUTURE: `react-bootstrap` added hooks in 1.0.0-beta.6 which break the whole app (even with react-16.8)
// FUTURE: swtich to: https://reactstrap.github.io/components/modals/#app

const EMPTY_DREAM = {
	title: '',
	notes: '',
	dreamSigns: [],
	dreamImages: [],
	isLucidDream: false,
	lucidMethod: InductionTypes.none,
}
const NEW_ENTRY = Object.freeze({
	// TODO: need better idea - UTC shows wrong date half the time (1 day ahead)
	//entryDate: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDay(), // TODO: mon/day both need zero-padding (eg: "06")
	entryDate: new Date().toISOString().substring(0, 10),
	bedTime: '',
	notesPrep: '',
	notesWake: '',
	starred: false,
	dreams: [EMPTY_DREAM],
})

export interface IAppModalProps {
	doCreateEntry: Function
	doDeleteEntry: Function
	doUpdateEntry: Function
	editEntry?: IJournalEntry
	isExistingEntryDate: Function
	onShowModal: Function
	show?: boolean
}
export interface IAppModalState {
	dailyEntry: IJournalEntry
	isDateDupe: boolean
	origEntryDate: string
	selectedTab: number
	show: boolean
	isBusy: boolean
}

export default class EntryModal extends React.Component<IAppModalProps, IAppModalState> {
	constructor(props: Readonly<IAppModalProps>) {
		super(props)

		this.state = {
			dailyEntry: JSON.parse(JSON.stringify(NEW_ENTRY)),
			isDateDupe: false,
			origEntryDate: '',
			selectedTab: 0,
			show: props.show,
			isBusy: false,
		}
	}

	/**
	 * Handle show/no-show and clearing of form data
	 * React-Design: Allow `props` changes from other Components to change state/render
	 */
	componentWillReceiveProps(nextProps: any) {
		// A: Update `show` when needed
		if (
			typeof nextProps.show !== 'undefined' &&
			typeof nextProps.show === 'boolean' &&
			this.state.show !== nextProps.show
		) {
			this.setState({ show: nextProps.show })
		}

		// B: Clear form when "Create" is used to open modal
		if (nextProps.show && !nextProps.editEntry) {
			this.setState({
				dailyEntry: JSON.parse(JSON.stringify(NEW_ENTRY)),
			})
		}

		// C: Load corresponding day for Edits
		if (nextProps.editEntry && this.state.dailyEntry !== nextProps.editEntry) {
			// NOTE: React Feb-2019 wont do: `dailyEntry: nextProps.editEntry`
			// SOLN: create a copy use json+json as `dreams` requires deep copy
			this.setState({
				dailyEntry: JSON.parse(JSON.stringify(nextProps.editEntry)),
				origEntryDate: nextProps.editEntry.entryDate,
				selectedTab: 0,
			})
		}
	}

	// ============================================================================

	handleAddDream = (_event: React.MouseEvent<HTMLButtonElement>) => {
		let dailyEntryNew = this.state.dailyEntry
		dailyEntryNew.dreams.push({
			title: '',
			notes: '',
			dreamSigns: [],
			dreamImages: [],
			isLucidDream: false,
			lucidMethod: null,
		})
		this.setState({
			dailyEntry: dailyEntryNew,
			selectedTab: dailyEntryNew.dreams.length - 1,
		})
	}

	handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const target = event.target
		const value = target.type === 'checkbox' ? target.checked : target.value
		const name = target.name

		let newState = this.state.dailyEntry
		newState[name] = value

		// A: allow edit of Entry Date, but check for dupe date so PK isnt corrupted
		if (this.props.editEntry && name == 'entryDate' && value != this.state.origEntryDate) {
			this.setState({ isDateDupe: this.props.isExistingEntryDate(value) })
		}

		// B:
		this.setState({
			dailyEntry: newState,
		})
	}
	handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const target = event.target
		const value = target.value
		const name = target.name

		let newState = this.state.dailyEntry
		newState[name] = value

		// A: allow edit of Entry Date, but check for dupe date so PK isnt corrupted
		if (this.props.editEntry && name == 'entryDate' && value != this.state.origEntryDate) {
			this.setState({ isDateDupe: this.props.isExistingEntryDate(value) })
		}

		// B:
		this.setState({
			dailyEntry: newState,
		})
	}
	handleInputDreamChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const target = event.target
		const value = target.type === 'checkbox' ? target.checked : target.value
		const name = target.name

		let newState = this.state.dailyEntry

		if (name == 'dreamSigns') {
			// `dreamSigns` is an array and must be maintained as such
			newState.dreams[event.target.getAttribute('data-dream-idx')].dreamSigns = value
				? value.toString().split(',')
				: []
		} else {
			newState.dreams[event.target.getAttribute('data-dream-idx')][name] = value
		}

		this.setState({ dailyEntry: newState })
	}
	handleSelectDreamChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const target = event.target
		const value = target.value
		const name = target.name

		let newState = this.state.dailyEntry

		if (name == 'dreamSigns') {
			// `dreamSigns` is an array and must be maintained as such
			newState.dreams[event.target.getAttribute('data-dream-idx')].dreamSigns = value
				? value.toString().split(',')
				: []
		} else {
			newState.dreams[event.target.getAttribute('data-dream-idx')][name] = value
		}

		this.setState({ dailyEntry: newState })
	}
	handleTextAreaDreamChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const target = event.target
		const value = target.value
		const name = target.name

		let newState = this.state.dailyEntry

		if (name == 'dreamSigns') {
			// `dreamSigns` is an array and must be maintained as such
			newState.dreams[event.target.getAttribute('data-dream-idx')].dreamSigns = value
				? value.toString().split(',')
				: []
		} else {
			newState.dreams[event.target.getAttribute('data-dream-idx')][name] = value
		}

		this.setState({ dailyEntry: newState })
	}

	handleDeleteDream = (dreamIdx: number, event: React.MouseEvent<HTMLDivElement>) => {
		if (confirm('Delete Dream #' + (dreamIdx + 1) + '?')) {
			let dailyEntryNew = this.state.dailyEntry
			dailyEntryNew.dreams.splice(dreamIdx, 1)
			this.setState({ dailyEntry: dailyEntryNew, selectedTab: 0 })
		}

		event.preventDefault()
	}

	handleDelete = (event: React.MouseEvent<HTMLInputElement>) => {
		if (confirm('Delete entry ' + this.state.dailyEntry.entryDate + '?')) {
			this.props
				.doDeleteEntry(this.state.dailyEntry.entryDate)
				.catch((err: any) => {
					alert('Unable to delete!\n' + err)
				})
				.then((res: Boolean) => {
					if (res == true) this.modalClose()
				})
		}

		event.preventDefault()
	}
	handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
		let arrPromises = []

		// 1
		this.setState({ isBusy: true })

		if (this.props.editEntry) {
			arrPromises.push(this.props.doUpdateEntry(this.state.dailyEntry, this.state.origEntryDate))
		} else {
			arrPromises.push(this.props.doCreateEntry(this.state.dailyEntry))
		}

		Promise.all(arrPromises)
			.catch(err => {
				throw err
			})
			.then(arrArrays => {
				let result = arrArrays && arrArrays[0] ? arrArrays[0] : 'NO RESULTS'
				if (typeof result === 'boolean' && result == true) this.modalClose()
				else throw result
			})
			.catch(ex => {
				// TODO: Show error message somewhere on dialog! (20190324)
				alert(ex)
			})
			.finally(() => this.setState({ isBusy: false }))

		event.preventDefault()
	}

	// ============================================================================

	modalClose = () => {
		// Reset state in both components
		this.setState({ show: false })
		this.props.onShowModal({ show: false })
	}
	renderDreamTab = (dream: IJournalDream, dreamIdx: number) => {
		return (
			<div
				className={'tab-pane pt-3' + (dreamIdx == this.state.selectedTab ? ' active' : '')}
				id={'drmtab' + dreamIdx}
				role='tabpanel'
				aria-labelledby={'drmtab' + dreamIdx + '-tab'}
				key={'dreamrow' + dreamIdx}>
				<div className='row align-items-center mb-3'>
					<div className='col'>
						<label className='text-muted text-uppercase text-sm'>Title</label>
						<input
							name='title'
							type='text'
							className='form-control'
							value={dream.title}
							onChange={this.handleInputDreamChange}
							data-dream-idx={dreamIdx}
						/>
					</div>
					<div className='col-auto'>
						<label className='text-muted text-uppercase text-sm d-block'>&nbsp;</label>
						<div
							className='iconSvg size24 small circle no cursor-pointer'
							title='Delete Dream'
							onClick={event => this.handleDeleteDream(dreamIdx, event)}
						/>
					</div>
				</div>
				<div className='row mb-3'>
					<div className='col-12 col-lg-6 mb-3 mb-lg-0'>
						<label className='text-muted text-uppercase text-sm d-block'>Dream Signs</label>
						<input
							name='dreamSigns'
							type='text'
							className='form-control'
							value={dream.dreamSigns}
							onChange={this.handleInputDreamChange}
							data-dream-idx={dreamIdx}
						/>
					</div>
					<div className='col-6 col-lg-3'>
						<label className='text-muted text-uppercase text-sm d-block'>Lucid Dream?</label>
						<BootstrapSwitchButton
							onChange={(checked: boolean) => {
								let newState = this.state.dailyEntry
								newState.dreams[dreamIdx].isLucidDream = checked
								this.setState({ dailyEntry: newState })
							}}
							checked={dream.isLucidDream}
							onlabel='Yes'
							onstyle='outline-success'
							offlabel='No'
							offstyle='outline-dark'
							style='w-100'
						/>
					</div>
					<div className='col-6 col-lg-3'>
						<label className='text-muted text-uppercase text-sm d-block'>Lucid Method</label>
						<select
							name='lucidMethod'
							value={dream.lucidMethod || InductionTypes.none}
							disabled={!dream.isLucidDream}
							data-dream-idx={dreamIdx}
							onChange={this.handleSelectDreamChange}
							className='form-control'>
							{Object.keys(InductionTypes).map(type => {
								return (
									<option value={type} key={'lucid-' + type + '-' + dreamIdx}>
										{InductionTypes[type]}
									</option>
								)
							})}
						</select>
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
							onChange={this.handleTextAreaDreamChange}
							data-dream-idx={dreamIdx}
						/>
					</div>
				</div>
			</div>
		)
	}

	render() {
		return (
			<form>
				<Modal size='lg' show={this.state.show} onHide={this.modalClose} backdrop='static'>
					<Modal.Header className='bg-info' closeButton>
						<Modal.Title className='text-white h6'>Journal Entry</Modal.Title>
					</Modal.Header>

					<Modal.Body className='bg-light'>
						<div className='container'>
							<div className='row mb-4'>
								<div className='col-6 mb-2 required'>
									<label className='text-muted text-uppercase text-sm'>Entry Date</label>
									<input
										name='entryDate'
										type='date'
										value={this.state.dailyEntry.entryDate}
										onChange={this.handleInputChange}
										className={
											this.state.isDateDupe
												? 'is-invalid form-control w-100'
												: 'form-control w-100'
										}
										required
									/>
									<div className='invalid-feedback'>Entry Date already exists in Dream Journal!</div>
								</div>
								<div className='col mb-2'>
									<label className='text-muted text-uppercase text-sm'>Bed Time</label>
									<input
										name='bedTime'
										type='time'
										value={this.state.dailyEntry.bedTime}
										onChange={this.handleInputChange}
										className='form-control w-100'
									/>
								</div>
								<div className='col-auto px-0 mb-2'>
									<label className='text-muted text-uppercase text-sm'>&nbsp;</label>
									<div
										className={
											'd-block iconSvg size32 cursor-pointer ' +
											(this.state.dailyEntry.starred ? 'star-on' : 'star-off')
										}
										title={this.state.dailyEntry.starred ? 'Un-Star Entry' : 'Star Entry'}
										onClick={() => {
											let newState = this.state.dailyEntry
											newState.starred = this.state.dailyEntry.starred ? false : true
											this.setState({ dailyEntry: newState })
										}}
									/>
								</div>
								<div className='col-12 col-md-6 mb-2'>
									<label className='text-muted text-uppercase text-sm'>Prep Notes</label>
									<textarea
										name='notesPrep'
										value={this.state.dailyEntry.notesPrep}
										onChange={this.handleTextAreaChange}
										className='form-control'
										rows={1}
									/>
								</div>
								<div className='col-12 col-md-6 mb-2'>
									<label className='text-muted text-uppercase text-sm'>Wake Notes</label>
									<textarea
										name='notesWake'
										value={this.state.dailyEntry.notesWake}
										onChange={this.handleTextAreaChange}
										className='form-control'
										rows={1}
									/>
								</div>
							</div>

							<div className='row align-items-center'>
								<div className='col pr-0'>
									<ul className='nav nav-tabs border-bottom border-secondary' role='tablist'>
										{this.state.dailyEntry.dreams.map((_dream, idx) => (
											<li className='nav-item' key={'dreamtab' + idx}>
												<a
													className={
														'nav-link' + (idx == this.state.selectedTab ? ' active' : '')
													}
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
									<button
										type='button'
										className='btn btn-sm btn-outline-info'
										onClick={this.handleAddDream}>
										New Dream
									</button>
								</div>
							</div>
							<div className='tab-content'>
								{this.state.dailyEntry.dreams.map((dream, idx) => this.renderDreamTab(dream, idx))}
							</div>
						</div>
					</Modal.Body>

					{this.state.isBusy ? (
						<Modal.Footer>
							<div className='spinner-border spinner-border-lg text-primary mb-4' role='status'>
								<span className='sr-only' />
							</div>
						</Modal.Footer>
					) : (
						<Modal.Footer>
							<div className='d-block d-sm-none'>
								<button type='button' className='btn btn-outline-danger' onClick={this.handleDelete}>
									Delete
								</button>
							</div>
							<div className='d-none d-sm-block'>
								<button
									type='button'
									className='btn btn-outline-danger mr-5'
									onClick={this.handleDelete}>
									Delete Entry
								</button>
							</div>
							<Button
								type='button'
								variant='outline-secondary'
								className='px-4 mr-2'
								onClick={this.modalClose}>
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
			</form>
		)
	}
}
