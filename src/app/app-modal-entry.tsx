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
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { IJournalEntry, IJournalDream, InductionTypes } from './app'

const EMPTY_DREAM = {
	title: '',
	notes: '',
	dreamSigns: [],
	dreamImages: [],
	isLucidDream: false,
	lucidMethod: InductionTypes.none,
}
const NEW_ENTRY = {
	entryDate: new Date().toISOString().substring(0, 10),
	bedTime: '',
	notesPrep: '',
	notesWake: '',
	dreams: [EMPTY_DREAM],
}

class EntryModal extends React.Component<
	{
		doCreateEntry: Function
		doUpdateEntry: Function
		editEntry?: IJournalEntry
		onShowModal: Function
		show?: boolean
	},
	{ dailyEntry: IJournalEntry; show: boolean }
> {
	constructor(
		props: Readonly<{
			doCreateEntry: Function
			doUpdateEntry: Function
			editEntry?: IJournalEntry
			onShowModal: Function
			show?: boolean
		}>
	) {
		super(props)

		this.state = {
			dailyEntry: NEW_ENTRY,
			show: props.show,
		}
	}

	/**
	 * Handle show/no-show and clearing of form data
	 * React-Design: Allow `props` changes from other Components to change state/render
	 */
	componentWillReceiveProps(nextProps) {
		// A:
		if (
			typeof nextProps.show !== 'undefined' &&
			typeof nextProps.show === 'boolean' &&
			this.state.show !== nextProps.show
		) {
			this.setState({ show: nextProps.show })

			if (!this.state.show && !this.props.editEntry) {
				this.setState({
					dailyEntry: NEW_ENTRY,
				})
			}
		}

		// B:
		if (nextProps.editEntry && this.state.dailyEntry !== nextProps.editEntry) {
			// NOTE: React Feb-2019 wont do: `dailyEntry: nextProps.editEntry`
			// SOLN: create a copy use json+json as `dreams` requires deep copy
			this.setState({
				dailyEntry: JSON.parse(JSON.stringify(nextProps.editEntry)),
			})
		}
	}

	// ============================================================================

	addRowHandler = event => {
		let dailyEntryNew = this.state.dailyEntry
		dailyEntryNew.dreams.push({
			title: '',
			notes: '',
			dreamSigns: [],
			dreamImages: [],
			isLucidDream: false,
			lucidMethod: null,
		})
		this.setState({ dailyEntry: dailyEntryNew })
	}

	handleInputChange = event => {
		const target = event.target
		const value = target.type === 'checkbox' ? target.checked : target.value
		const name = target.name

		let newState = this.state.dailyEntry
		newState[name] = value

		this.setState({
			dailyEntry: newState,
		})
	}
	handleInputDreamChange = event => {
		const target = event.target
		const value = target.type === 'checkbox' ? target.checked : target.value
		const name = target.name

		let newState = this.state.dailyEntry
		newState.dreams[event.target.getAttribute('data-dream-idx')][name] = value

		this.setState({
			dailyEntry: newState,
		})
	}
	handleSubmit = event => {
		let arrPromises = []

		// TODO: CURRENT: FIXME:
		console.log('TODO: FIXME:')

		if (this.props.editEntry) {
			arrPromises.push(this.props.doUpdateEntry(this.state.dailyEntry))
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
				console.log(ex)
			})

		event.preventDefault()
	}

	// ============================================================================

	modalClose = () => {
		// Reset state in both components
		this.setState({ show: false })
		this.props.onShowModal({ show: false })
	}
	renderDreamRow = (dream: IJournalDream, dreamIdx: number) => {
		return (
			<div className='row pt-3 mb-4' key={'dreamrow' + dreamIdx}>
				<div className='col-auto'>
					<h1 className='text-primary font-weight-light'>{dreamIdx + 1}</h1>
				</div>
				<div className='col'>
					<div className='row mb-3'>
						<div className='col-12 col-md-6'>
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
						<div className='col-6 col-md-3'>
							<label className='text-muted text-uppercase text-sm d-block'>Lucid Dream?</label>
							<input
								name='isLucidDream'
								type='checkbox'
								data-toggle='switchbutton'
								checked={dream.isLucidDream}
								onChange={this.handleInputDreamChange}
								data-dream-idx={dreamIdx}
							/>
						</div>
						<div className='col-6 col-md-3'>
							<label className='text-muted text-uppercase text-sm d-block'>Lucid Method</label>
							<select
								name='lucidMethod'
								value={dream.lucidMethod || InductionTypes.none}
								data-dream-idx={dreamIdx}
								onChange={this.handleInputDreamChange}
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
					<div className='row mb-3'>
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
					</div>
					<div className='row'>
						<div className='col'>
							<label className='text-muted text-uppercase text-sm'>Notes</label>
							<textarea
								name='notes'
								className='form-control'
								rows={5}
								value={dream.notes}
								onChange={this.handleInputDreamChange}
								data-dream-idx={dreamIdx}
							/>
						</div>
					</div>
				</div>
			</div>
		)
	}

	render() {
		return (
			<Modal size='lg' show={this.state.show} onHide={this.modalClose} backdrop='static'>
				<Modal.Header className='bg-primary' closeButton>
					<Modal.Title className='text-white'>Journal Entry</Modal.Title>
				</Modal.Header>

				<Modal.Body className='bg-light'>
					<div className='container mb-4'>
						<div className='row mb-3'>
							<div className='col-12 col-md-6 required'>
								<label className='text-muted text-uppercase text-sm'>Entry Date</label>
								<input
									name='entryDate'
									type='date'
									value={this.state.dailyEntry.entryDate}
									onChange={this.handleInputChange}
									className='form-control w-50'
									disabled={this.props.editEntry ? true : false}
									required
								/>
								<div className='invalid-feedback'>Please provide Entry Date</div>
							</div>
							<div className='col-12 col-md-6'>
								<label className='text-muted text-uppercase text-sm'>Bed Time</label>
								<input
									name='bedTime'
									type='time'
									value={this.state.dailyEntry.bedTime}
									onChange={this.handleInputChange}
									className='form-control w-50'
								/>
							</div>
						</div>
						<div className='row'>
							<div className='col-12 col-md-6'>
								<label className='text-muted text-uppercase text-sm'>Prep Notes</label>
								<textarea
									name='notesPrep'
									value={this.state.dailyEntry.notesPrep}
									onChange={this.handleInputChange}
									className='form-control'
									rows={3}
								/>
							</div>
							<div className='col-12 col-md-6'>
								<label className='text-muted text-uppercase text-sm'>Wake Notes</label>
								<textarea
									name='notesWake'
									value={this.state.dailyEntry.notesWake}
									onChange={this.handleInputChange}
									className='form-control'
									rows={3}
								/>
							</div>
						</div>
					</div>

					<div className='container'>
						<div className='row mb-3'>
							<div className='col'>
								<h5 className='text-primary'>Dreams</h5>
							</div>
							<div className='col-auto'>
								<button className='btn btn-sm btn-outline-primary' onClick={this.addRowHandler}>
									Add Dream Row
								</button>
							</div>
						</div>
						{this.state.dailyEntry.dreams.map((dream, idx) => this.renderDreamRow(dream, idx))}
					</div>
				</Modal.Body>

				<Modal.Footer>
					<Button variant='outline-secondary' className='px-4 mr-2' onClick={this.modalClose}>
						Close
					</Button>
					<Button variant='success' className='w-25' onClick={this.handleSubmit}>
						Add Entry
					</Button>
				</Modal.Footer>
			</Modal>
		)
	}
}

export default EntryModal