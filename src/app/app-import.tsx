import React from 'react'
import { ImportTypes, IDriveFile, IJournalEntry } from './app'

class TabImport extends React.Component<
	{ selDataFile: IDriveFile },
	{
		_importText: string
		_parsedSections: Array<IJournalEntry>
		_selBreakType: string
		_selDreamNotes: string
		_selEntryType: string
		_showImporter: ImportTypes

		_bedTime: string
		_dreamBreak: string
		_dreamSigns: string
		_entryDate: string
		_isLucidDream: string
		_notes: Array<string>
		_notesPrep: string
		_notesWake: string
		_title: string
		bedTime: string
		dreamBreak: Array<string>
		dreamSigns: string
		entryDate: string
		isLucidDream: boolean
		notes: Array<string>
		notesPrep: string
		notesWake: string
		title: string
	}
> {
	constructor(props: Readonly<{ selDataFile: IDriveFile }>) {
		super(props)

		let config = JSON.parse(localStorage.getItem('import-config')) || {}

		this.state = {
			_importText: null,
			_parsedSections: config._parsedSections || [],
			_selBreakType: config._selBreakType || 'blankLine',
			_selDreamNotes: config._selDreamNotes || 'match',
			_selEntryType: config._selEntryType || 'match',
			_showImporter: ImportTypes.docx,

			_bedTime: config._bedTime || '',
			_dreamBreak: config._dreamBreak || '',
			_dreamSigns: config._dreamSigns || '',
			_entryDate: config._entryDate || '',
			_isLucidDream: config._isLucidDream || '',
			_notes: config._notes || [],
			_notesPrep: config._notesPrep || '',
			_notesWake: config._notesWake || '',
			_title: config._title || '',

			bedTime: null,
			dreamBreak: [],
			dreamSigns: null,
			entryDate: null,
			isLucidDream: false,
			notes: [],
			notesPrep: null,
			notesWake: null,
			title: null,
		}
	}

	handleInputChange = event => {
		const target = event.target
		const value = target.type === 'checkbox' ? target.checked : target.value
		const name = target.name
		const demoData = document.getElementById('contDemoData').innerText || ''

		// A: Capture regex field value, reset result field
		let newState = {}
		newState[name] = value
		newState[name.replace('_', '')] = ''
		this.setState(newState)

		// B:
		if (name == '_selEntryType') {
			if (value == 'first' && (demoData.split('\n') || []).length > 0) {
				try {
					let textParse = demoData.split('\n')[0].replace(/[^0-9$\/]/g, '')
					let dateParse = new Date(textParse)
					if (Object.prototype.toString.call(dateParse) === '[object Date]' && dateParse.getDay() > 0) {
						this.setState({
							entryDate: dateParse.toUTCString().substring(0, 16),
						})
					}
				} catch (ex) {
					this.setState({
						entryDate: ex,
					})
				}
			}
		} else if (name == '_dreamBreak' && value && (demoData || '').split('\n').length > 0) {
			let arrMatch = []
			demoData.split('\n').forEach(line => {
				if (line.trim().match(new RegExp(value, 'g'))) {
					let keyVal = line.trim().split(new RegExp(value, 'g'))
					arrMatch.push(keyVal[1])
				}
			})
			this.setState({ dreamBreak: arrMatch })
		} else if (typeof value !== 'undefined') {
			;(demoData.split('\n') || []).forEach(line => {
				if (line.trim().match(new RegExp(value, 'g')) && value) {
					let keyVal = line.trim().split(new RegExp(value, 'g'))
					if (keyVal[1]) {
						let newState = {}
						newState[name.replace('_', '')] = name == '_isLucidDream' ? true : keyVal[1]
						this.setState(newState)
					}
				}
			})
		}

		// C: Update "Dream Notes"
		if (this.state._selDreamNotes == 'after' || (name == '_selDreamNotes' && value == 'after')) {
			if (!this.state._dreamBreak) {
				this.setState({ notes: ['(add text to Dream Section)'] })
			} else {
				let arrNotes = [],
					isNotes = false
				// Locate "Dream Title", capture all lines after it - until next [Dream Section]/[Dream Title]
				demoData.split('\n').forEach(line => {
					if (isNotes) arrNotes.push(line)
					// Flip capture flag once we hit a subsequnet [DreamTitle]
					if (line.trim().match(new RegExp(this.state.title, 'g'))) isNotes = isNotes ? false : true
				})
				this.setState({ notes: arrNotes })
			}
		}
	}

	/**
	 * Parse user-pasted journal entries into `dailyEntry` objects
	 */
	handleParse = () => {
		const strSecBreak = this.state._selBreakType == 'blankLine' ? new RegExp('\n\n') : 'TODO'
		var arrEntries: Array<IJournalEntry> = []

		// A: Reality check
		if (!this.state._importText) {
			// TODO: invalid-response div shown
			console.log('Bro, add some text!')
			return
		}

		// B: Clear results
		this.setState({
			_parsedSections: [],
		})

		// C: Parse text
		this.state._importText.split(strSecBreak).forEach(sect => {
			console.log(sect) // DEBUG

			// 1: Divide text into dream sections
			let objEntry: IJournalEntry = {
				entryDate: '',
				bedTime: '',
				notesPrep: '',
				notesWake: '',
				dreams: [],
			}

			// 2: Tokenize each section into our fields
			this.state._importText.split('\n').forEach((line, idx) => {
				// NOTE: As each of the Entry props have diff reqs, handle each one sep
				if (idx == 0 && this.state._selEntryType == 'first') {
					try {
						let textParse = line.split('\n')[0].replace(/[^0-9$\/]/g, '')
						let dateParse = new Date(textParse)
						if (Object.prototype.toString.call(dateParse) === '[object Date]' && dateParse.getDay() > 0) {
							objEntry.entryDate = dateParse.toISOString()
						}
					} catch (ex) {
						objEntry.entryDate = ex
					}
				} else if (
					this.state._selEntryType != 'first' &&
					line.trim().match(new RegExp(this.state._entryDate, 'g'))
				) {
					let keyVal = line.trim().split(new RegExp(this.state._entryDate, 'g'))
					if (keyVal[1]) objEntry.entryDate = keyVal[1].trim()
				} else if (line.trim().match(new RegExp(this.state._bedTime, 'g'))) {
					let keyVal = line.trim().split(new RegExp(this.state._bedTime, 'g'))
					if (keyVal[1]) objEntry.bedTime = keyVal[1].trim()
				} else if (line.trim().match(new RegExp(this.state._notesPrep, 'g'))) {
					let keyVal = line.trim().split(new RegExp(this.state._notesPrep, 'g'))
					if (keyVal[1]) objEntry.notesPrep = keyVal[1].trim()
				} else if (line.trim().match(new RegExp(this.state._notesWake, 'g'))) {
					let keyVal = line.trim().split(new RegExp(this.state._notesWake, 'g'))
					if (keyVal[1]) objEntry.notesWake = keyVal[1].trim()
				}
				// TODO: finish this!
				// TODO: NEXT: Locate dream section and break it up
				else if (line.trim().match(new RegExp(this.state._dreamBreak, 'g'))) {
					// TODO: keep capturing lines and looking for props
					console.log('DREAM:')
					console.log(line)
				}
			})

			// 3: Add section
			arrEntries.push(objEntry)
		})

		// D: Populate results
		this.setState({
			_parsedSections: arrEntries,
		})

		// DEBUG
		console.log(arrEntries)
		console.log(this.state)

		// E: Save current setup to localStorage
		localStorage.setItem('import-config', JSON.stringify(this.state))
		// TODO: remove `_importText` before saving into localStorage
	}

	/**
	 * Add newly parsed entries into current Dream Journal
	 * This completes the import process
	 */
	handleImport = () => {
		// TODO: add each entry to journal
		// TODO: check each date - dont allow more than one entry date
	}

	render() {
		// TODO: this.state._showImporter == ImportTypes.xlsx
		let importSetup: JSX.Element = (
			<div>
				<div className='row align-items-top mb-4'>
					<div className='col-8'>
						<h5 className='text-primary'>Field Mapping</h5>
						<p>
							Use the form below to map your dream journal fields to Brain Cloud's, then your data will be
							automatically imported into your new dream journal.
						</p>
					</div>
					<div className='col-4'>
						<h5 className='text-primary'>Current Journal Format</h5>
						<p>Paste a journal entry from your current journal below.</p>
					</div>
				</div>

				<div className='row align-items-top mb-4'>
					<div id='contMapDemo' className='col-8'>
						<div className='row'>
							<div className='col-3'>
								<label className='text-muted text-uppercase d-block'>Description</label>
							</div>
							<div className='col'>
								<label className='text-muted text-uppercase'>Your Field Name</label>
							</div>
							<div className='col'>
								<label className='text-muted text-uppercase'>Result</label>
							</div>
						</div>
						<div className='row align-items-center mb-2'>
							<div className='col-3'>
								Entry Date
								<span className='text-danger mx-1' title='required field'>
									*
								</span>
							</div>
							<div className='col'>
								<div className='row no-gutters'>
									<div className='col'>
										<select
											name='_selEntryType'
											className='form-control'
											onChange={this.handleInputChange}
											value={this.state._selEntryType}>
											<option value='match'>Regex</option>
											<option value='first'>First line is the Entry Date</option>
										</select>
									</div>
									<div className={this.state._selEntryType == 'first' ? 'd-none' : 'col-7 pl-2'}>
										<input
											name='_entryDate'
											value={this.state._entryDate}
											type='text'
											className='form-control'
											onChange={this.handleInputChange}
											placeholder='DATE:'
											required
										/>
										<div className='invalid-feedback'>Entry Date format required</div>
									</div>
								</div>
							</div>
							<div className='col'>
								<div className='form-control bg-secondary p-2'>{this.state.entryDate}</div>
							</div>
						</div>
						<div className='row align-items-center mb-2'>
							<div className='col-3'>Bed Time</div>
							<div className='col'>
								<input
									name='_bedTime'
									value={this.state._bedTime}
									type='text'
									className='form-control'
									onChange={this.handleInputChange}
									placeholder='BEDTIME'
								/>
							</div>
							<div className='col'>
								<div className='form-control bg-secondary p-2'>{this.state.bedTime}</div>
							</div>
						</div>
						<div className='row align-items-center mb-2'>
							<div className='col-3'>Prep Notes</div>
							<div className='col'>
								<input
									name='_notesPrep'
									value={this.state._notesPrep}
									type='text'
									className='form-control'
									onChange={this.handleInputChange}
									placeholder='PREP'
								/>
							</div>
							<div className='col'>
								<div className='form-control bg-secondary p-2'>{this.state.notesPrep}</div>
							</div>
						</div>
						<div className='row align-items-center mb-3'>
							<div className='col-3'>Wake Notes</div>
							<div className='col'>
								<input
									name='_notesWake'
									value={this.state._notesWake}
									type='text'
									className='form-control'
									onChange={this.handleInputChange}
									placeholder='WAKES'
								/>
							</div>
							<div className='col'>
								<div className='form-control bg-secondary p-2'>{this.state.notesWake}</div>
							</div>
						</div>

						<label className='text-muted'>DREAMS: (1 or more)</label>

						<div className='row align-items-top mb-3'>
							<div className='col-3'>Dream Section</div>
							<div className='col'>
								<input
									name='_dreamBreak'
									value={this.state._dreamBreak}
									type='text'
									className='form-control'
									onChange={this.handleInputChange}
									placeholder='DREAM \d+:'
								/>
							</div>
							<div className='col'>
								{(this.state.dreamBreak || []).map((dream, idx) => {
									return (
										<div
											className='badge badge-primary mr-1 mb-1 font-weight-light p-2'
											key={'dreambreak' + idx}>
											{dream}
										</div>
									)
								})}
							</div>
						</div>
						<div className='row align-items-center mb-2'>
							<div className='col-3'>Lucid Dream?</div>
							<div className='col'>
								<input
									name='_isLucidDream'
									value={this.state._isLucidDream}
									type='text'
									className='form-control'
									onChange={this.handleInputChange}
									placeholder='SUCCESS'
								/>
							</div>
							<div className='col'>
								<div className='form-control bg-secondary p-1'>
									{this.state.isLucidDream && (
										<div className='badge badge-success font-weight-light p-2'>YES</div>
									)}
								</div>
							</div>
						</div>
						<div className='row align-items-center mb-2'>
							<div className='col-3'>Dream Signs</div>
							<div className='col'>
								<input
									name='_dreamSigns'
									value={this.state._dreamSigns}
									type='text'
									className='form-control'
									onChange={this.handleInputChange}
									placeholder='DREAMSIGNS'
								/>
							</div>
							<div className='col'>
								<div className='form-control bg-secondary p-2'>{this.state.dreamSigns}</div>
							</div>
						</div>
						<div className='row align-items-center mb-2'>
							<div className='col-3'>Dream Title</div>
							<div className='col'>
								<input
									name='_title'
									value={this.state._title}
									type='text'
									className='form-control'
									onChange={this.handleInputChange}
									placeholder='DREAM \d+:'
								/>
							</div>
							<div className='col'>
								<div className='form-control bg-secondary p-2'>{this.state.title}</div>
							</div>
						</div>
						<div className='row align-items-top mb-2'>
							<div className='col-3'>Dream Notes</div>
							<div className='col'>
								<div className='row no-gutters'>
									<div className='col'>
										<select
											name='_selDreamNotes'
											className='form-control'
											onChange={this.handleInputChange}
											value={this.state._selDreamNotes}>
											<option value='match'>Regex</option>
											<option value='after'>All text after Dream Title</option>
										</select>
									</div>
									<div className={this.state._selDreamNotes == 'after' ? 'd-none' : 'col-7 pl-2'}>
										<input
											name='_notes'
											value={this.state._notes}
											type='text'
											className='form-control'
											onChange={this.handleInputChange}
											placeholder='DREAM 1'
										/>
									</div>
								</div>
							</div>
							<div className='col'>
								{this.state.notes.map(note => {
									return <div className='badge'>{note}</div>
								})}
							</div>
						</div>
					</div>
					<div className='col-4'>
						<label className='text-muted text-uppercase d-block'>Sample Entry</label>
						<div id='contDemoData' className='container p-3 bg-black'>
							<span className='text-white'>03/08/2019:</span>
							<ul>
								<li>
									<span className='text-white'>BEDTIME:</span> 11:30
								</li>
								<li>
									<span className='text-white'>PREP:</span> Bath
								</li>
								<li>
									<span className='text-white'>WAKES:</span> 06:00 for bio break
								</li>
								<li>
									<span className='text-white'>DREAMSIGNS:</span> Dad, Camping
								</li>
								<li>
									<span className='text-white'>DREAM 1:</span> At the mall
								</li>
								<ul>
									<li>SUCCESS!!</li>
									<li>Working at pizza place again</li>
									<li>It was snowing outside</li>
									<li>Realized I was dreaming when i could not find my phone</li>
								</ul>
								<li>
									<span className='text-white'>DREAM 99:</span> Camping with dad
								</li>
								<ul>
									<li>Dad and I were off camping</li>
									<li>Same place we used to go</li>
									<li>Talked about school and stuff</li>
								</ul>
							</ul>
						</div>
					</div>
				</div>

				<div className='row align-items-top mb-4'>
					<div className='col-8'>
						<h5 className='text-primary'>Section Break</h5>
						<p>Select the type of break your journal uses between entries.</p>
						<select
							name='_selBreakType'
							className='form-control'
							onChange={this.handleInputChange}
							value={this.state._selBreakType}>
							<option value='blankLine'>Empty Line (paragraph style)</option>
						</select>
					</div>
					<div className='col-4' />
				</div>

				<div className='row align-items-top'>
					<div className='col-12 text-center'>
						<p>
							Once the options above are functioning correctly, go to the next tab to import your dream
							journal.
						</p>
					</div>
				</div>
			</div>
		)

		let importParse: JSX.Element = (
			<div>
				<h5 className='text-primary'>Instructions</h5>
				<ul>
					<li>
						Copy one or more entries from your Dream Journal, then paste them below and click the Parse
						button
					</li>
					<li>
						The options in the Setup tab will be used to parse your existing entries into a new,
						well-structured format
					</li>
					<li>
						Review the results, make any changes, then click Import to add them to your Brain Cloud journal
					</li>
				</ul>

				<div
					className='form-control bg-black mb-2'
					contentEditable
					onKeyDown={event => this.setState({ _importText: event.currentTarget.innerText })}
					style={{ minHeight: '400px', height: 'auto' }}
				/>
				<div className='invalid-feedback'>Please paste your journal above</div>

				<div className='text-center p-3'>
					<button className='btn btn-primary' onClick={this.handleParse}>
						Parse Journal Entries
					</button>
				</div>
			</div>
		)

		let importResults: JSX.Element = (
			<div>
				<h5 className='text-primary mt-4'>Parse Results</h5>
				<p>{'Found ' + this.state._parsedSections.length + ' entries'}</p>

				<ul className='list-group'>
					{this.state._parsedSections.map((sect, idx) => {
						return (
							<li className='list-group-item' key={'parsedsect' + idx}>
								<div className='row'>
									<div className='col-auto'>
										<label className='text-uppercase text-muted d-block'>Entry Date</label>
										{new Date(sect.entryDate).toLocaleDateString()}
									</div>
									<div className='col-auto'>
										<label className='text-uppercase text-muted d-block'>Bed Time</label>
										{sect.bedTime}
									</div>
									<div className='col-auto'>
										<label className='text-uppercase text-muted d-block'>Prep Notes</label>
										{sect.notesPrep}
									</div>
									<div className='col-auto'>
										<label className='text-uppercase text-muted d-block'>Wake Notes</label>
										{sect.notesWake}
									</div>
								</div>
							</li>
						)
					})}
				</ul>
			</div>
		)

		return (
			<div className='container mt-5'>
				<div className='card mb-5'>
					<div className='card-header bg-primary'>
						<h5 className='card-title text-white mb-0'>Import Dream Journal Entries</h5>
					</div>
					<div className='card-body bg-light'>
						<div className='row align-items-top'>
							<div className='col'>
								<p className='card-text'>
									It's likely that you're already keeping a dream journal in another format, such a
									Document (Google Docs, Microsoft Word), spreadsheet (Google Sheets, Microsoft
									Excel), or just plain text.
								</p>
								<p className='card-text'>
									The importer interface allows you to import your free-form journal into the
									well-formatted Brain Cloud JSON format which is a universal, flat-file database and
									is supported by a myriad of apps (Microsoft Access, etc.).
								</p>
							</div>
							<div className='col-auto'>
								<button
									type='button'
									className='btn btn-primary d-block w-100 mb-4'
									disabled={!this.props.selDataFile}
									onClick={() => {
										this.setState({ _showImporter: ImportTypes.docx })
									}}>
									Import Document
								</button>
								<button
									type='button'
									className='btn btn-primary d-block w-100'
									disabled={!this.props.selDataFile}
									onClick={() => {
										this.setState({ _showImporter: ImportTypes.xlsx })
									}}>
									Import Spreadsheet
								</button>
							</div>
						</div>
					</div>
				</div>

				<ul className='nav nav-tabs' role='tablist'>
					<li className='nav-item'>
						<a
							className='nav-link active'
							id='setup-tab'
							data-toggle='tab'
							href='#setup'
							role='tab'
							aria-controls='setup'
							aria-selected='true'>
							Set Import Options
						</a>
					</li>
					<li className='nav-item'>
						<a
							className='nav-link'
							id='parse-tab'
							data-toggle='tab'
							href='#parse'
							role='tab'
							aria-controls='parse'
							aria-selected='false'>
							Parse Journal Entries
						</a>
					</li>
					<li className='nav-item'>
						<a
							className='nav-link'
							id='results-tab'
							data-toggle='tab'
							href='#results'
							role='tab'
							aria-controls='results'
							aria-selected='false'>
							Import Journal Entries
						</a>
					</li>
				</ul>
				<div className='tab-content mb-5'>
					<div
						className='tab-pane bg-light p-4 active'
						id='setup'
						role='tabpanel'
						aria-labelledby='setup-tab'>
						{importSetup}
					</div>
					<div className='tab-pane bg-light p-4' id='parse' role='tabpanel' aria-labelledby='parse-tab'>
						{importParse}
					</div>
					<div className='tab-pane bg-light p-4' id='results' role='tabpanel' aria-labelledby='results-tab'>
						{importResults}
					</div>
				</div>
			</div>
		)
	}
}

export default TabImport
