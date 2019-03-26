import React from 'react'
import ContentEditable from 'react-contenteditable'
import { IDriveFile, IJournalDream, IJournalEntry, ImportTypes, InductionTypes } from './app'
const ENTRY_DATE_BREAK = 'SECTIONBREAK'
const DEBUG = true

class TabImport extends React.Component<
	{
		doSaveImportState: Function
		importState: object
		selDataFile: IDriveFile
	},
	{
		_defaultYear: number
		_demoData: string
		_dreamSignsDelim: string
		_entryDateInvalidMsg: string
		_importHTML: string
		_importText: string
		_invalidSections: Array<IJournalEntry>
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
	// @see: https://medium.com/@martin_hotell/react-refs-with-typescript-a32d56c4d315
	private refDemoData = React.createRef<HTMLDivElement>()
	private refContentEditable = React.createRef<HTMLElement>()

	constructor(props: Readonly<{ doSaveImportState: Function; importState: object; selDataFile: IDriveFile }>) {
		super(props)

		let config = this.props.importState || JSON.parse(localStorage.getItem('import-config')) || {}

		this.state = {
			_defaultYear: config._defaultYear || new Date().getFullYear(),
			_demoData: config._demoData || '',
			_dreamSignsDelim: config._dreamSignsDelim || '',
			_entryDateInvalidMsg: '',
			_importHTML: config._importHTML || '<br>',
			_importText: config._importText || '',
			_invalidSections: config._invalidSections || [],
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

	/**
	 * Capture demoData content into state after it renders
	 */
	componentDidMount = () => {
		this.setState({
			_demoData: this.refDemoData.current.innerText,
		})

		this.updateOptionResults()
	}

	/**
	 * this constructor is called whenever tab is hidden/shown, so state must be preserved by parent
	 */
	componentWillUnmount = () => {
		this.props.doSaveImportState(this.state)
	}

	/* ======================================================================== */

	/**
	 * Populate all "Field Mapping" Results fields
	 */
	updateOptionResults = () => {
		const arrOtherFields = ['_bedTime', '_dreamSigns', '_isLucidDream', '_notesPrep', '_notesWake', '_title']
		const demoData = this.refDemoData.current.innerText || ''

		// A: "Entry Date"
		this.setState({ _entryDateInvalidMsg: '' })
		if (this.state._selEntryType == 'first') {
			if ((demoData.split('\n') || []).length > 0) {
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
		} else if (this.state._selEntryType == 'match' && this.state._entryDate) {
			;(demoData.split('\n') || []).forEach(line => {
				try {
					if (line.trim().match(new RegExp(this.state._entryDate, 'g'))) {
						let keyVal = line.trim().split(new RegExp(this.state._entryDate, 'g'))
						let newState = { entryDate: '' }

						// CASE 1: "DATE: 03/08"
						if (keyVal[1]) {
							newState['entryDate'] = keyVal[1]
						}
						// CASE 2: "03/08:" and thats it - no keyname or lede like "DATE:"
						// NOTE: `\d\d/\d\d/\d\d\d\d:` parse result is ["",""], so show whole line
						else if (!keyVal[0]) {
							newState['entryDate'] = line.trim()
						}

						this.setState(newState)
					}
				} catch (ex) {
					this.setState({ _entryDateInvalidMsg: ex.toString() })
				}
			})
		}

		// B: "Dream Break"
		if ((demoData || '').split('\n').length > 0) {
			let arrMatch = []
			demoData.split('\n').forEach(line => {
				if (line.trim().match(new RegExp(this.state._dreamBreak, 'g'))) {
					let keyVal = line.trim().split(new RegExp(this.state._dreamBreak, 'g'))
					arrMatch.push(keyVal[1])
				}
			})
			this.setState({ dreamBreak: arrMatch })
		}

		// C: all other fields
		;(demoData.split('\n') || []).forEach(line => {
			arrOtherFields.forEach(name => {
				if (line.trim().match(new RegExp(this.state[name], 'g'))) {
					let keyVal = line.trim().split(new RegExp(this.state[name], 'g'))
					if (keyVal[1]) {
						let newState = {}
						newState[name.replace('_', '')] = name == '_isLucidDream' ? true : keyVal[1]
						this.setState(newState)
					}
				}
			})
		})

		// C: Update "Dream Notes"
		if (this.state._selDreamNotes == 'after') {
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

	handleInputChange = event => {
		const target = event.target
		const value = target.type === 'checkbox' ? target.checked : target.value
		const name = target.name

		// A: Capture regex field value
		let newState = {}
		newState[name] = value
		this.setState(newState)

		// B:
		if (name == '_selEntryType') {
			this.setState({
				entryDate: '',
			})
		}

		// C: Update UI (delay reqd as state isnt committed to memory fast enough for render to read it back!)
		setTimeout(this.updateOptionResults, 100)
	}

	handleResultChange = event => {
		const target = event.target
		const value = target.type === 'checkbox' ? target.checked : target.value
		const name = target.name
		const idx = event.target.getAttribute('data-sect-idx')
		const idy = event.target.getAttribute('data-dream-idx')

		let newState = this.state._parsedSections

		if (idy) newState[idx].dreams[idy][name] = value
		else newState[idx][name] = value

		this.setState({
			_parsedSections: newState,
		})
	}

	handleDeleteEntry = event => {
		if (!confirm('Delete this Entry?')) return

		let newState = this.state._parsedSections
		newState.splice(event.target.getAttribute('data-sect-idx'), 1)

		console.log('handleDeleteEntry!!')

		this.setState({
			_parsedSections: newState,
		})
	}

	/* ======================================================================== */

	/**
	 * Parse user-pasted journal entries into `dailyEntry` objects
	 */
	handleParse = () => {
		const strDreamSignDelim = ','
		let arrEntries: Array<IJournalEntry> = []
		let strSecBreak = new RegExp('\n\n')
		let strImportText = this.state._importText
		if (this.state._selBreakType == 'blankLine') strSecBreak = new RegExp('\n\n')
		if (this.state._selBreakType == 'entryDate') strSecBreak = new RegExp(ENTRY_DATE_BREAK)

		// A: reality check
		if (!this.state._importText) {
			// TODO: invalid-response div shown
			console.log('Bro, add some text!')
			return
		}

		// B: handle "Entry Date" as section break
		// Merely using `split(new RegExp(this.state._entryDate))` will cause the loss of the date itself
		// SOLN: Add custom break and split using that string instead so only its lost
		if (this.state._selBreakType == 'entryDate') {
			strImportText = strImportText.replace(new RegExp(this.state._entryDate, 'gi'), ENTRY_DATE_BREAK + '$&')
		}

		// C: clear state data
		this.setState({
			_parsedSections: [],
		})

		// D: parse text
		if (DEBUG) {
			console.log('-------------------------------------------')
			console.log('strImportText split into sections:')
			console.log(strImportText.split(strSecBreak))
			console.log('-------------------------------------------')
		}
		strImportText
			.split(strSecBreak)
			.filter(sect => {
				return sect
			})
			.forEach(sect => {
				//if (DEBUG) console.log('SECTION: ' + sect)

				// 1: Divide text into dream sections
				let objEntry: IJournalEntry = {
					entryDate: '',
					bedTime: '',
					notesPrep: '',
					notesWake: '',
					dreams: [],
				}
				let objDream: IJournalDream
				let tmpDreamSigns: IJournalDream['dreamSigns']

				// 2: Tokenize each section into our fields
				//if (DEBUG) console.log('sect.split(`\\n`):')
				sect.split('\n').forEach((line, idx) => {
					// DESIGN: dreams are 1+ lines that need to captured once they start, kind of a loop-within-loop
					// As a initial algorithm, check for any `dream` array items, consider all other fields complete
					if (line.trim().match(new RegExp(this.state._dreamBreak, 'g'))) {
						objDream = {
							title: '',
							notes: '',
							dreamSigns: tmpDreamSigns || [],
							dreamImages: [],
							isLucidDream: false,
							lucidMethod: null,
						}
						objEntry.dreams.push(objDream)
						if (DEBUG) {
							console.log('NEW (objDream)')
							console.log(objDream)
						}
					}

					// parse entry tokens/dream(s) tokens
					if (objEntry.dreams.length == 0) {
						// NOTE: As each of the Entry props have diff reqs, handle each one sep
						if (idx == 0 && this.state._selEntryType == 'first') {
							try {
								let textParse = line.split('\n')[0].replace(/[^0-9$\/]/g, '')
								let dateParse = new Date(textParse)
								if (
									Object.prototype.toString.call(dateParse) === '[object Date]' &&
									dateParse.getDay() > 0
								) {
									objEntry.entryDate = dateParse.toISOString().substring(0, 10)
								}
							} catch (ex) {
								objEntry.entryDate = ex
							}
						} else if (
							this.state._selEntryType == 'match' &&
							this.state._entryDate &&
							line.trim().match(new RegExp(this.state._entryDate, 'g'))
						) {
							let textParse = line.trim().match(new RegExp(this.state._entryDate, 'gm'))[0]
							if (textParse) {
								textParse = textParse.replace(/:|;/gi, '') // For "11/29/2019:"
								if (DEBUG) console.log('textParse = ' + textParse)
								let dateParse = new Date(textParse)
								if (this.state._defaultYear && textParse && textParse.length <= 5) {
									// "12/31"
									if (DEBUG) console.log('FYI using `_defaultYear`: ' + this.state._defaultYear)
									dateParse.setFullYear(this.state._defaultYear)
								}
								if (
									Object.prototype.toString.call(dateParse) === '[object Date]' &&
									dateParse.getDay() > 0
								) {
									objEntry.entryDate = dateParse.toISOString().substring(0, 10)
								}
							}
						} else if (line.trim().match(new RegExp(this.state._bedTime, 'g'))) {
							let keyVal = line.trim().split(new RegExp(this.state._bedTime, 'g'))
							if (keyVal[1].trim()) objEntry.bedTime = keyVal[1].trim()
						} else if (line.trim().match(new RegExp(this.state._notesPrep, 'g'))) {
							let keyVal = line.trim().split(new RegExp(this.state._notesPrep, 'g'))
							if (keyVal[1].trim()) objEntry.notesPrep = keyVal[1].trim()
						} else if (line.trim().match(new RegExp(this.state._notesWake, 'g'))) {
							let keyVal = line.trim().split(new RegExp(this.state._notesWake, 'g'))
							if (keyVal[1].trim()) objEntry.notesWake = keyVal[1].trim()
						} else if (line.trim().match(new RegExp(this.state._dreamSigns, 'g'))) {
							// DESIGN: Some people (*ahem*) choose to put DREAMSIGNS at the top-level (not as a Dream section field)
							let keyVal = line.trim().split(new RegExp(this.state._dreamSigns, 'g'))
							if (keyVal[1].trim())
								tmpDreamSigns = keyVal[1].trim().split(this.state._dreamSignsDelim || strDreamSignDelim)
						}
					} else {
						// DESIGN: the last `else if` above created an item in `objEntry.dreams`
						// Regardless of its index, closures allow us to address `objDream` and ensure the correct "Dream"

						// A: Capture `title` so `notes` can be captured subsequnetly
						if (line.trim().match(new RegExp(this.state._title, 'g'))) {
							let keyVal = line.trim().split(new RegExp(this.state._title, 'g'))
							if (keyVal[1]) objDream.title = keyVal[1].trim()
						} else if (objDream.title && this.state._selDreamNotes == 'after' && line) {
							objDream.notes += (line + '\n').replace(/\n\s*\n/g, '\n')
							if (DEBUG) console.log('dream.notes:\n' + objDream.notes)
						} else if (this.state._selDreamNotes != 'after') {
							// TODO: look for regex
						}

						// B: Capture other `dream` fields
						if (line.trim().match(new RegExp(this.state._dreamSigns, 'g'))) {
							let keyVal = line.trim().split(new RegExp(this.state._dreamSigns, 'g'))
							if (keyVal[1].trim())
								objDream.dreamSigns =
									tmpDreamSigns ||
									keyVal[1].trim().split(this.state._dreamSignsDelim || strDreamSignDelim)
						} else if (line.trim().match(new RegExp(this.state._isLucidDream, 'g'))) {
							let keyVal = line.trim().split(new RegExp(this.state._isLucidDream, 'g'))
							if (keyVal[1].trim()) objDream.isLucidDream = keyVal[1].trim() ? true : false
						}
						/* TODO:
						else if (line.trim().match(new RegExp(this.state._lucidMethod, 'g'))) {
							let keyVal = line.trim().split(new RegExp(this.state._lucidMethod, 'g'))
							if (keyVal[1]) objDream.lucidMethod = keyVal[1].trim()
						}
						*/
					}
				})

				// 3: Add section
				arrEntries.push(objEntry)
			})

		// E: capture/populate results
		this.setState({
			_parsedSections: arrEntries,
		})

		// F: save current setup to localStorage
		localStorage.setItem('import-config', JSON.stringify(this.state))

		if (DEBUG) {
			console.log(arrEntries)
			console.log(this.state)
		}
	}

	/**
	 * Add newly parsed entries into current Dream Journal
	 * This completes the import process
	 */
	handleImport = () => {
		let arrInvalidSects = []

		// A:
		if (!this.props.selDataFile || !this.props.selDataFile.name) {
			console.log('ERROR: No file selected')
		}

		// B:
		this.setState({
			_invalidSections: [],
		})

		// C: flag entries with duplicate `entryDate` (already exists in selected journal)
		this.state._parsedSections.forEach(sect => {
			if (
				this.props.selDataFile.entries.filter(entry => {
					return entry.entryDate == sect.entryDate
				}).length > 0
			) {
				arrInvalidSects.push(sect)
			}
		})

		// D: mark invalid entries, or do import if no errors
		if (arrInvalidSects.length > 0) {
			this.setState({
				_invalidSections: arrInvalidSects,
			})
		} else {
			// 1: Add new entries
			this.props.selDataFile.entries = [...this.props.selDataFile.entries, ...this.state._parsedSections].sort(
				(a, b) => {
					if (a.entryDate < b.entryDate) return -1
					if (a.entryDate > b.entryDate) return 1
					return 0
				}
			)

			// 2: Clear import text and parsed results
			this.setState({
				_importHTML: '<br>',
				_importText: '',
				_parsedSections: [],
			})
		}
	}

	/* ======================================================================== */

	render() {
		let contDemoData: JSX.Element = (
			<div ref={this.refDemoData} className='container p-3 bg-black'>
				<span className='text-white'>03/08:</span>
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
		)

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
						<div className='row align-items-top mb-2'>
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
								<div className='form-output p-2'>{this.state.entryDate}</div>
								<div
									className={
										this.state._entryDateInvalidMsg
											? 'invalid-feedback d-block'
											: 'invalid-feedback'
									}>
									{this.state._entryDateInvalidMsg}
								</div>
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
								<div className='form-output p-2'>{this.state.bedTime}</div>
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
								<div className='form-output p-2'>{this.state.notesPrep}</div>
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
								<div className='form-output p-2'>{this.state.notesWake}</div>
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
								<div className='form-output p-2'>
									{(this.state.dreamBreak || []).map((dream, idx) => {
										return (
											<div
												className='badge badge-primary mb-1 w-100 text-left font-weight-light p-2'
												key={'dreambreak' + idx}>
												{dream}
											</div>
										)
									})}
								</div>
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
								<div className='form-output p-2'>
									{this.state.isLucidDream && (
										<div className='badge badge-success font-weight-light p-2'>YES</div>
									)}
								</div>
							</div>
						</div>
						<div className='row align-items-center mb-2'>
							<div className='col-3'>Dream Signs</div>
							<div className='col'>
								<div className='row no-gutters'>
									<div className='col mr-1'>
										<input
											name='_dreamSigns'
											value={this.state._dreamSigns}
											type='text'
											className='form-control'
											onChange={this.handleInputChange}
											placeholder='DREAMSIGNS'
										/>
									</div>
									<div className='col-2'>
										<select
											name='_dreamSignsDelim'
											value={this.state._dreamSignsDelim}
											className='form-control'
											onChange={this.handleInputChange}>
											<option value=','>,</option>
											<option value=';'>;</option>
											<option value=' '>(space)</option>
										</select>
									</div>
								</div>
							</div>
							<div className='col'>
								<div className='form-output p-2'>{this.state.dreamSigns}</div>
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
								<div className='form-output p-2'>{this.state.title}</div>
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
								<div className='form-output p-2'>
									{this.state.notes.map((note, idx) => {
										return <div key={'note' + idx}>{note}</div>
									})}
								</div>
							</div>
						</div>
					</div>
					<div className='col-4'>
						<label className='text-muted text-uppercase d-block'>Sample Entry</label>
						{contDemoData}
					</div>
				</div>

				<div className='row align-items-center mb-4'>
					<div className='col-5'>
						<h5 className='text-primary'>Default Year</h5>
						<label>Used when no year is available (ex: "Date: 10/31")</label>
					</div>
					<div className='col-3'>
						<input
							name='_defaultYear'
							type='number'
							className='form-control'
							min='1950'
							max={new Date().getFullYear()}
							onChange={this.handleInputChange}
							value={this.state._defaultYear}
						/>
					</div>
				</div>
				<div className='row align-items-center mb-4'>
					<div className='col-5'>
						<h5 className='text-primary'>Section Break</h5>
						<label>Type of break your journal uses between entries</label>
					</div>
					<div className='col-3'>
						<select
							name='_selBreakType'
							className='form-control'
							onChange={this.handleInputChange}
							value={this.state._selBreakType}>
							<option value='blankLine'>Empty Line (paragraph style)</option>
							<option value='entryDate'>Entry Date</option>
						</select>
					</div>
				</div>

				<div className='row align-items-bottom'>
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
				<div className='row'>
					<div className='col'>
						<h5 className='text-primary'>Instructions</h5>
						<ul>
							<li>
								Copy one or more entries from your Dream Journal, then paste them below and click the
								Parse button
							</li>
							<li>
								The options in the Setup tab will be used to parse your existing entries into a new,
								well-structured format
							</li>
							<li>
								Review the results, make any changes, then click Import to add them to your Brain Cloud
								journal
							</li>
						</ul>
					</div>
					<div className='col-auto pt-2'>
						<button
							className='btn btn-success'
							onClick={this.handleParse}
							disabled={(this.state._importText || '').length == 0}>
							Parse Journal Entries
						</button>
					</div>
				</div>

				<ContentEditable
					innerRef={this.refContentEditable}
					html={this.state._importHTML} // innerHTML of the editable div
					disabled={false} // use true to disable editing
					onChange={event =>
						this.setState({
							_importText: event.currentTarget.innerText,
							_importHTML: event.target.value,
						})
					} // handle innerHTML change
					className='form-control bg-black mb-2'
					style={{ minHeight: '300px', height: 'auto' }}
				/>
				<div className='invalid-feedback'>Please paste your journal above</div>
			</div>
		)

		let importResults: JSX.Element = (
			<form>
				<div className='row'>
					<div className='col'>
						<h5 className='text-primary mb-3'>Parse Results</h5>
						<ul>
							<li>{'Found ' + this.state._parsedSections.length + ' entries'}</li>
						</ul>
					</div>
					<div className='col-auto pt-2'>
						<button
							type='button'
							className='btn btn-success'
							onClick={this.handleImport}
							disabled={this.state._parsedSections.length == 0}>
							Import Entries into Journal
						</button>
					</div>
				</div>

				<ul className='list-group mb-4'>
					{this.state._parsedSections.map((sect, idx) => {
						return (
							<li className='list-group-item' key={'parsedsect' + idx}>
								<div className='row no-gutters'>
									<div className='col'>
										<h4 className='text-primary'>Entry {idx + 1}</h4>
									</div>
									<div className='col-auto'>
										<div
											data-sect-idx={idx}
											onClick={this.handleDeleteEntry}
											className='iconSvg size24 small circle no cursor-pointer'
											title='Delete Entry'
										/>
									</div>
								</div>
								<div className='row mb-4'>
									<div className='col-auto'>
										<label className='text-uppercase text-muted d-block'>Entry Date</label>
										<input
											data-sect-idx={idx}
											name='entryDate'
											type='date'
											className={
												this.state._invalidSections.indexOf(sect) > -1
													? 'form-control is-invalid'
													: 'form-control'
											}
											value={sect.entryDate}
											onChange={this.handleResultChange}
											required
										/>
										<div className='invalid-feedback'>
											A journal entry with this date already exists.
										</div>
									</div>
									<div className='col-auto'>
										<label className='text-uppercase text-muted d-block'>Bed Time</label>
										<input
											data-sect-idx={idx}
											name='bedTime'
											type='time'
											className='form-control'
											value={sect.bedTime}
											onChange={this.handleResultChange}
										/>
									</div>
									<div className='col'>
										<label className='text-uppercase text-muted d-block'>Prep Notes</label>
										<input
											data-sect-idx={idx}
											name='notesPrep'
											type='text'
											className='form-control'
											value={sect.notesPrep}
											onChange={this.handleResultChange}
										/>
									</div>
									<div className='col'>
										<label className='text-uppercase text-muted d-block'>Wake Notes</label>
										<input
											data-sect-idx={idx}
											name='notesWake'
											type='text'
											className='form-control'
											value={sect.notesWake}
											onChange={this.handleResultChange}
										/>
									</div>
								</div>
								{sect.dreams.map((dream, idy) => {
									return (
										<div key={'parsedsectdream' + idx + idy}>
											<div className='row mb-4'>
												<div className='col-auto border-info border-right'>
													<h2 className='text-info'>{idy + 1}</h2>
												</div>
												<div className='col'>
													<div className='row mb-3'>
														<div className='col'>
															<label className='text-uppercase text-muted d-block'>
																Title
															</label>
															<input
																data-sect-idx={idx}
																data-dream-idx={idy}
																name='title'
																type='text'
																className='form-control'
																value={dream.title}
																onChange={this.handleResultChange}
															/>
														</div>
														<div className='col-auto'>
															<label className='text-uppercase text-muted d-block'>
																Dream Signs
															</label>
															<input
																data-sect-idx={idx}
																data-dream-idx={idy}
																name='dreamSigns'
																type='text'
																className='form-control'
																value={dream.dreamSigns}
																onChange={this.handleResultChange}
															/>
														</div>
														<div className='col-auto'>
															<label className='text-uppercase text-muted d-block'>
																Lucid Dream?
															</label>
															<input
																data-sect-idx={idx}
																data-dream-idx={idy}
																name='isLucidDream'
																type='checkbox'
																className='form-control'
																checked={dream.isLucidDream}
																onChange={this.handleResultChange}
															/>
														</div>
														<div className='col-auto'>
															<label className='text-uppercase text-muted d-block'>
																Lucid Method
															</label>

															<select
																data-sect-idx={idx}
																data-dream-idx={idy}
																name='lucidMethod'
																value={dream.lucidMethod || InductionTypes.none}
																onChange={this.handleResultChange}
																className='form-control'>
																{Object.keys(InductionTypes).map(type => {
																	return (
																		<option
																			value={type}
																			key={'lucid-' + type + '-' + idy}>
																			{InductionTypes[type]}
																		</option>
																	)
																})}
															</select>
														</div>
													</div>
													<div className='row'>
														<div className='col'>
															<textarea
																data-sect-idx={idx}
																data-dream-idx={idy}
																name='notes'
																value={dream.notes}
																onChange={this.handleResultChange}
																className='form-control w-100'
																rows={5}
															/>
														</div>
													</div>
												</div>
											</div>
										</div>
									)
								})}
							</li>
						)
					})}
				</ul>
			</form>
		)

		return (
			<div className='container mt-5'>
				<div className='card mb-5'>
					<div className='card-header bg-primary'>
						<h5 className='card-title text-white mb-0'>Import Dream Journal Entries</h5>
					</div>
					<div className='card-body bg-light'>
						<div className='row align-items-top'>
							<div className='col-auto'>
								<div className='iconSvg size96 wizard' />
							</div>
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
						</div>
					</div>
				</div>

				<ul className='nav nav-tabs nav-fill' role='tablist'>
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
