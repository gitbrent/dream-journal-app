/* eslint-disable no-control-regex */

/*
 *  :: Brain Cloud Dream Journal ::
 *
 *  Dream Journal App - Record and Search Daily Dream Entries
 *  https://github.com/gitbrent/dream-journal-app
 *
 *  This library is released under the MIT Public License (MIT)
 *
 *  Dream Journal App (C) 2019-present Brent Ely (https://github.com/gitbrent)
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

import React from 'react'
import { IDriveDataFile, IJournalDream, IJournalEntry, ImportTypes, InductionTypes, VERBOSE_IMPORT } from './app.types'
import ContentEditable from 'react-contenteditable'
import { ChevronRight, Cloud, Trash, Upload } from 'react-bootstrap-icons'
import { DateTime } from 'luxon'
import { appdata } from './appdata'

const ENTRY_DATE_BREAK = 'SECTIONBREAK'

export interface IAppTabProps {
	dataFile: IDriveDataFile
	appdataSvc: appdata
}
interface IAppTabState {
	_defaultBedTime: string
	_defaultYear: number
	_demoHTML: string
	_demoText: string
	_dreamSignsDelim: string
	_entryDateInvalidMsg: string
	_useDefaultTime: boolean
	_importHTML: string
	_importText: string
	_invalidSections: Array<IJournalEntry>
	_isTime24Hour: boolean
	_parsedSections: Array<IJournalEntry>
	_selBreakType: string
	_selDreamNotes: string
	_selEntryType: string
	_selNotePrepType: string
	_selNoteWakeType: string
	_showImporter: ImportTypes

	_bedTime: string
	_dreamBreak: string
	_dreamSigns: string[]
	_entryDate: string
	_isLucidDream: string
	_notes: Array<string>
	_notesPrep: string
	_notesPrepEnd: string
	_notesWake: string
	_notesWakeEnd: string
	_title: string
	bedTime: string
	dreamBreak: Array<string>
	dreamSigns: string[]
	entryDate: string
	isLucidDream: boolean
	notes: Array<string>
	notesPrep: string
	notesWake: string
	title: string
}

export default class TabImport extends React.Component<IAppTabProps, IAppTabState> {
	// @see: https://medium.com/@martin_hotell/react-refs-with-typescript-a32d56c4d315
	private refDemoData = React.createRef<HTMLDivElement>()
	private refContentEditable = React.createRef<HTMLElement>()
	private demoHtmlStr: string = `
		<section className='bg-black p-4 border border-dark'>
			<span>03/08</span>
			<ul>
				<li>
					<span>BED:</span> 11:30
				</li>
				<li>
					<span>PREP: Bubble bath</span>
				</li>
				<li>
					<span>WAKES:</span> 06:00 for bio break
				</li>
				<li>
					<span>DREAM 1:</span> At the mall
				</li>
				<ul>
					<li>SUCCESS!!</li>
					<li>Working at pizza place again</li>
					<li>It was snowing outside</li>
					<li>Realized I was dreaming when i could not find my phone</li>
				</ul>
				<li>
					<span>DREAM 99:</span> Camping with dad
				</li>
				<ul>
					<li>
						<span>DREAMSIGNS:</span> Dad, Camping
					</li>
					<li>Dad and I were off camping</li>
					<li>Same place we used to go</li>
					<li>Talked about school and stuff</li>
				</ul>
			</ul>
		</section>`

	constructor(props: Readonly<IAppTabProps>) {
		super(props)

		// Default state
		const defaultState: IAppTabState = {
			_defaultBedTime: '00:00',
			_defaultYear: new Date().getFullYear(),
			_demoHTML: this.demoHtmlStr,
			_demoText: '',
			_dreamSignsDelim: ',',
			_entryDateInvalidMsg: '',
			_useDefaultTime: true,
			_importHTML: '<br>',
			_importText: '',
			_invalidSections: [],
			_isTime24Hour: false,
			_parsedSections: [],
			_selBreakType: 'blankLine',
			_selDreamNotes: 'after',
			_selEntryType: 'first',
			_selNotePrepType: 'single',
			_selNoteWakeType: 'single',
			_showImporter: ImportTypes.docx,

			_bedTime: 'BED:',
			_dreamBreak: 'DREAM \\d+:',
			_dreamSigns: ['DREAMSIGNS:'],
			_entryDate: '\\d\\d/\\d\\d:',
			_isLucidDream: 'SUCCESS',
			_notes: [],
			_notesPrep: 'PREP:',
			_notesPrepEnd: 'WAKES:',
			_notesWake: 'WAKES:',
			_notesWakeEnd: 'WAKES:',
			_title: 'DREAM \\d+:',

			bedTime: '',
			dreamBreak: [],
			dreamSigns: [],
			entryDate: '',
			isLucidDream: false,
			notes: [],
			notesPrep: '',
			notesWake: '',
			title: '',
		};

		// Load config from localStorage
		const savedConfig: Partial<IAppTabState> = (() => {
			try {
				return JSON.parse(localStorage.getItem('import-config') || '{}') as Partial<IAppTabState>
			} catch (ex) {
				console.error(ex)
				return {} // Fallback to empty object if parsing fails
			}
		})()

		// Merge default state with saved config
		this.state = {
			...defaultState,
			...savedConfig,
		}
	}

	/**
	 * Capture demoData content into state after it renders
	 */
	componentDidMount = () => {
		this.setState({
			_demoText: this.refDemoData.current?.innerText || '',
		})

		this.updateOptionResults()
	}

	/**
	 * this constructor is called whenever tab is hidden/shown, so state must be preserved by parent (lifting state up)
	 */
	componentWillUnmount = () => {
		//this.props.appdataSvc.doSaveImportState(this.state)
	}

	parseDate = (input: string): string | null => {
		const currentYear = new Date().getFullYear();

		// Try different date formats
		const formats = ['MM/dd/yyyy', 'MM/dd', 'MMM dd', 'MMMM dd'];

		let parsedDate = null;

		for (const format of formats) {
			let date = DateTime.fromFormat(input, format)

			// If the format was MM/dd, append the current year
			if (date.isValid && (format === 'MM/dd' || format === 'MMM dd' || format === 'MMMM dd')) {
				date = date.set({ year: currentYear });
			}

			if (date.isValid) {
				parsedDate = date;
				break;
			}
		}

		/**
		 * parseDate("03/08");        // returns "2024-03-08"
		 * parseDate("March 20");      // returns "2024-03-20"
		 * parseDate("Mar 20");        // returns "2024-03-20"
		 * parseDate("03/08/2024");    // returns "2024-03-08"
		 */
		return parsedDate ? parsedDate.toISODate() : null
	}

	/* ======================================================================== */

	/**
	 * Populate all "Field Mapping" Results fields
	 */
	updateOptionResults = () => {
		const arrOtherFields = ['_bedTime', '_dreamSigns', '_isLucidDream', '_notesPrep', '_notesWake', '_title']
		const demoData = this.refDemoData.current?.innerText || ''

		// A: "Entry Date"
		this.setState({ _entryDateInvalidMsg: '' })
		if (this.state._selEntryType === 'first') {
			if ((demoData.split('\n') || []).length > 0) {
				try {
					const textParse = demoData.split('\n')[0]
					const parsedDate = this.parseDate(textParse)
					if (parsedDate) {
						this.setState({
							entryDate: parsedDate,
						});
					}
				} catch (ex) {
					console.error('Date parsing error:', ex);
					if (ex instanceof Error) {
						this.setState({ entryDate: ex.message })
					} else {
						this.setState({ entryDate: String(ex) })
					}
				}
			}
		} else if (this.state._selEntryType === 'match' && this.state._entryDate) {
			(demoData.split('\n') || []).forEach((line) => {
				try {
					if (line.trim().match(new RegExp(this.state._entryDate, 'g'))) {
						const keyVal = line.trim().split(new RegExp(this.state._entryDate, 'g'))
						const newState = { entryDate: '' }

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
					if (ex instanceof Error) {
						this.setState({ _entryDateInvalidMsg: ex.message })
					} else {
						this.setState({ _entryDateInvalidMsg: String(ex) })
					}
				}
			})
		}

		// B: "Dream Break"
		if ((demoData || '').split('\n').length > 0) {
			const arrMatch: string[] = []
			demoData.split('\n').forEach((line) => {
				if (line.trim().match(new RegExp(this.state._dreamBreak, 'g'))) {
					const keyVal = line.trim().split(new RegExp(this.state._dreamBreak, 'g'))
					arrMatch.push(keyVal[1])
				}
			})
			this.setState({ dreamBreak: arrMatch })
		}

		// C: "Prep Notes" (multi-line)
		if (this.state._selNotePrepType === 'multi' && this.state._notesPrepEnd) {
			let isCapturing = false
			let strNotesPrep = ''
			const strArray = (demoData.split('\n') || [])
			strArray.forEach((line) => {
				if (line && line.trim().match(new RegExp(this.state._notesPrepEnd, 'g'))) {
					isCapturing = false
				} else if (line && line.trim().match(new RegExp(this.state._notesPrep, 'g'))) {
					isCapturing = true
				}

				if (line && line.replace(this.state._notesPrep, '').trim() && isCapturing) {
					strNotesPrep += line.replace(this.state._notesPrep, '').trim() + '\n'
				}
			})

			this.setState({
				notesPrep: strNotesPrep,
			})
		}

		// D: "Wake Notes" (multi-line)
		if (this.state._selNoteWakeType === 'multi' && this.state._notesWakeEnd) {
			let isCapturing = false
			let strNotesWake = ''
			const strArray = (demoData.split('\n') || [])
			strArray.forEach((line) => {
				if (line && line.trim().match(new RegExp(this.state._notesWakeEnd, 'g'))) {
					isCapturing = false
				} else if (line && line.trim().match(new RegExp(this.state._notesWake, 'g'))) {
					isCapturing = true
				}

				if (line && line.replace(this.state._notesWake, '').trim() && isCapturing) {
					strNotesWake += line.replace(this.state._notesWake, '').trim() + '\n'
				}
			})

			this.setState({
				notesWake: strNotesWake,
			})
		}

		// E: all other fields
		const strDemoDataArray = demoData.split('\n') || [];
		strDemoDataArray.forEach((line) => {
			arrOtherFields.forEach((name) => {
				const stateValue = this.state[name as keyof IAppTabState];

				if (typeof stateValue === 'string' && line.trim().match(new RegExp(stateValue, 'g'))) {
					const keyVal = line.trim().split(new RegExp(stateValue, 'g'));
					const value = keyVal[1];

					if (value) {
						this.setState(prevState => {
							const newKey = name.replace('_', '') as keyof IAppTabState;
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							let updatedValue: any;

							// Handle special cases
							if (newKey === 'isLucidDream') {
								updatedValue = true;
							} else if (newKey === 'dreamSigns' && typeof value === 'string') {
								updatedValue = value.split(prevState._dreamSignsDelim || ',');
							} else if (
								newKey === 'bedTime' ||
								newKey === 'entryDate' ||
								newKey === 'notesPrep' ||
								newKey === 'notesWake' ||
								newKey === 'title'
							) {
								updatedValue = value;
							} else if (Array.isArray(prevState[newKey])) {
								updatedValue = value ? [value] : [];
							} else {
								updatedValue = value;
							}

							return {
								...prevState,
								[newKey]: updatedValue,
							};
						});
					}
				}
			});
		});

		// F: Update "Dream Notes"
		if (this.state._selDreamNotes === 'after') {
			if (!this.state._dreamBreak) {
				this.setState({ notes: ['(add text to Dream Section)'] })
			} else {
				const arrNotes: string[] = []
				let isNotes = false
				// Locate "Dream Title", capture all lines after it - until next [Dream Section]/[Dream Title]
				demoData.split('\n').forEach((line) => {
					if (isNotes) arrNotes.push(line)
					// Flip capture flag once we hit a subsequnet [DreamTitle]
					if (line.trim().match(new RegExp(this.state.title, 'g'))) isNotes = isNotes ? false : true
				})
				this.setState({ notes: arrNotes })
			}
		}
	}

	handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const target = event.target
		const value = target.value
		const name = target.id

		// Update this one field
		this.setState(prevState => {
			return {
				...prevState,
				[name as keyof IAppTabState]: value,
			}
		})

		// LAST: Update UI (delay reqd as state isnt committed to memory fast enough for render to read it back!)
		setTimeout(this.updateOptionResults, 100)
	}

	handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const target = event.target
		const value = target.type === 'checkbox' ? target.checked : target.value
		const name = target.name

		// A: Capture regex field value
		this.setState(prevState => {
			if (name === 'dreamSigns') {
				return {
					...prevState,
					dreamSigns: value && typeof value === 'string' ? value.split(prevState._dreamSignsDelim || ',') : [],
				}
			} else {
				return {
					...prevState,
					[name]: value,
				}
			}
		})

		// Last: Update UI (delay reqd as state isnt committed to memory fast enough for render to read it back!)
		setTimeout(this.updateOptionResults, 100)
	}

	handleResultChange = (
		event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLTextAreaElement>,
		idx: number,
		idy?: number
	) => {
		const target = event.target
		const value = target.value
		const name = target.name

		this.setState(prevState => {
			const newParsedSections = [...prevState._parsedSections]

			if (typeof idy === 'number') {
				const dream = newParsedSections[idx].dreams[idy]

				// Type guard to ensure `name` is a key of IJournalDream and assign correctly
				if (name === 'dreamSigns' && typeof value === 'string') {
					dream.dreamSigns = value.split(prevState._dreamSignsDelim || ',');
				} else if (name === 'lucidMethod') {
					dream.lucidMethod = target.value as InductionTypes
				} else if (name in dream) {
					// Type assertion to let TypeScript know that this key exists in IJournalDream
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(dream as Record<string, any>)[name] = value
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					console.log((dream as Record<string, any>)[name]);
				}
			} else {
				// Type guard to ensure `name` is a key of IJournalEntry and assign correctly
				if (name in newParsedSections[idx]) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(newParsedSections[idx] as Record<string, any>)[name] = value
				}
			}

			return {
				...prevState,
				_parsedSections: newParsedSections,
			}
		})
	}

	handleDeleteEntry = (idx: number) => {

		if (!confirm('Delete this Entry?')) return

		const newState = this.state._parsedSections
		newState.splice(idx, 1)

		this.setState({
			_parsedSections: newState,
		})
	}

	/* ======================================================================== */

	/**
	 * Parse user-pasted journal entries into `dailyEntry` objects
	 */
	handleParse = () => {
		const DefaultDreamSignDelim = ','
		const arrEntries: IJournalEntry[] = []
		let strSecBreak = new RegExp('\n\n')
		let strImportText = this.state._importText
		if (this.state._selBreakType === 'blankLine') strSecBreak = new RegExp('\n\n')
		if (this.state._selBreakType === 'entryDate') strSecBreak = new RegExp(ENTRY_DATE_BREAK)

		// A: reality check
		if (!this.state._importText) {
			// TODO: invalid-response div shown
			alert('Bro, add some text!')
			return
		}

		// B: handle "Entry Date" as section break
		// Merely using `split(new RegExp(this.state._entryDate))` will cause the loss of the date itself
		// SOLN: Add custom break and split using that string instead so only its lost
		if (this.state._selBreakType === 'entryDate') {
			strImportText = strImportText.replace(new RegExp(this.state._entryDate, 'gi'), ENTRY_DATE_BREAK + '$&')
		}

		// C: parse text
		if (VERBOSE_IMPORT) {
			console.log('==================================================')
			console.log('| VERBOSE_IMPORT                                 |')
			console.log('==================================================')
			console.log(`this.state._selBreakType = ${this.state._selBreakType}`)
			console.log('this.state._importText')
			console.log(this.state._importText)
			console.log('strImportText split into entries (1/day):')
			console.log(strImportText.split(strSecBreak))
			console.log('--------------------------------------------------')
		}
		strImportText
			.split(strSecBreak)
			.filter((sect) => sect)
			.forEach((sect) => {
				if (VERBOSE_IMPORT) console.log('IMPORT > ENTRY', sect)

				// 1: Divide text into dream sections
				const objEntry: IJournalEntry = {
					entryDate: '',
					bedTime: '',
					notesPrep: '',
					notesWake: '',
					dreams: [],
				}
				let objDream: IJournalDream
				let tmpDreamSigns: IJournalDream['dreamSigns']

				// 2: Tokenize each section into our fields
				//if (VERBOSE_IMPORT) console.log('sect.split(`\\n`):')
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
						}
						objEntry.dreams.push(objDream)
						if (VERBOSE_IMPORT) {
							console.log('NEW (objDream)')
							console.log(objDream)
						}
					}

					// parse entry tokens/dream(s) tokens
					if (objEntry.dreams.length === 0) {
						// NOTE: As each of the Entry props have diff reqs, handle each one sep
						if (idx === 0 && this.state._selEntryType === 'first') {
							try {
								const textParse = line.split('\n')[0]
								const parsedDate = this.parseDate(textParse)
								objEntry.entryDate = parsedDate || '(HUH?)'
							} catch (ex) {
								if (ex instanceof Error) {
									objEntry.entryDate = ex.message
								} else {
									objEntry.entryDate = String(ex)
								}
							}
						} else if (this.state._selEntryType === 'match' && this.state._entryDate && line.trim().match(new RegExp(this.state._entryDate, 'g'))) {
							const textRegex = line.trim().match(new RegExp(this.state._entryDate, 'gm'))
							let textParse = textRegex && textRegex[0] ? textRegex[0] : ''
							if (textParse) {
								textParse = textParse.replace(/:|;/gi, '') // For "11/29/2019:"
								if (VERBOSE_IMPORT) console.log('textParse = ' + textParse)
								const dateParse = new Date(textParse)
								if (this.state._defaultYear && textParse && textParse.length <= 5) {
									// "12/31"
									if (VERBOSE_IMPORT) console.log('FYI using `_defaultYear`: ' + this.state._defaultYear)
									dateParse.setFullYear(this.state._defaultYear)
								}
								if (Object.prototype.toString.call(dateParse) === '[object Date]' && dateParse.getDay() >= 0) {
									objEntry.entryDate = dateParse.toISOString().substring(0, 10)
								} else {
									if (VERBOSE_IMPORT) {
										console.log('---> ATTN: unable to parse `entryDate` ')
										console.log(dateParse)
										console.log(Object.prototype.toString.call(dateParse))
										console.log(dateParse.getDay())
									}
								}
							}
						} else if (line.trim().match(new RegExp(this.state._bedTime, 'g'))) {
							const keyVal = line.trim().split(new RegExp(this.state._bedTime, 'g'))
							if (keyVal[1].trim()) {
								let time = keyVal[1].trim()
								if (this.state._isTime24Hour) {
									const arrTime = time.split(':')
									let timeHour = Number(arrTime[0])
									if (timeHour && !isNaN(timeHour)) {
										timeHour += 12
										if (timeHour >= 24) timeHour = 0
										time = (timeHour < 10 ? '0' + timeHour : timeHour) + ':' + arrTime[1]
									}
								}
								objEntry.bedTime = time
							}
						} else if (line.trim().match(new RegExp(this.state._notesPrep, 'g'))) {
							if (this.state._selNotePrepType === 'single') {
								const keyVal = line.trim().split(new RegExp(this.state._notesPrep, 'g'))
								if (keyVal[1].trim()) objEntry.notesPrep = keyVal[1].trim()
							}
						} else if (line.trim().match(new RegExp(this.state._notesWake, 'g'))) {
							const keyVal = line.trim().split(new RegExp(this.state._notesWake, 'g'))
							if (keyVal[1].trim()) objEntry.notesWake = keyVal[1].trim()
						} else if (line.trim().match(new RegExp(this.state._dreamSigns.join(','), 'g'))) {
							// DESIGN: Some people (*ahem*) choose to put DREAMSIGNS at the top-level (not as a Dream section field)
							const keyVal = line.trim().split(new RegExp(this.state._dreamSigns.join(','), 'g'))
							if (keyVal[1].trim())
								tmpDreamSigns = keyVal[1]
									.trim()
									.toLowerCase()
									.split(this.state._dreamSignsDelim || DefaultDreamSignDelim)
						}
					} else if (line) {
						// DESIGN: the last `else if` above created an item in `objEntry.dreams`
						// Regardless of its index, closures allow us to address `objDream` and ensure the correct "Dream"

						// A: Capture `title` so `notes` can be subsequently captured
						if (line.trim().match(new RegExp(this.state._title, 'g'))) {
							const keyVal = line.trim().split(new RegExp(this.state._title, 'g'))
							if (keyVal[1]) objDream.title = keyVal[1].trim()
						} else if (objDream.title && this.state._selDreamNotes === 'after' && line) {
							objDream.notes += (line + '\n').replace(/\n\s*\n/g, '\n')
							//if (VERBOSE_IMPORT) console.log('dream.notes:\n' + objDream.notes)
						} else if (this.state._selDreamNotes !== 'after') {
							// TODO: look for regex
						}

						// B: Capture other `dream` fields
						if (line.trim().match(new RegExp(this.state._dreamSigns.join(','), 'g'))) {
							const keyVal = line.trim().split(new RegExp(this.state._dreamSigns.join(','), 'g'))
							if (!keyVal[1].trim()) console.log(line) // FIXME:
							if (keyVal[1].trim())
								objDream.dreamSigns =
									tmpDreamSigns ||
									keyVal[1]
										.trim()
										.toLowerCase()
										.split(this.state._dreamSignsDelim || DefaultDreamSignDelim)
						} else if (line.trim().match(new RegExp(this.state._isLucidDream, 'g'))) {
							const keyVal = line.trim().split(new RegExp(this.state._isLucidDream, 'g'))
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

				// 3: Handle fields that can be multi-line
				if (this.state._selNotePrepType === 'multi' && this.state._notesPrepEnd) {
					let isCapturing = false
					const strArray = (sect.split('\n') || [])
					strArray.forEach((line) => {
						if (line && line.trim().match(new RegExp(this.state._notesPrepEnd, 'g'))) {
							isCapturing = false
						} else if (line && line.trim().match(new RegExp(this.state._notesPrep, 'g'))) {
							isCapturing = true
						}
						if (line && line.replace(this.state._notesPrep, '').trim() && isCapturing) {
							objEntry.notesPrep += line.replace(this.state._notesPrep, '').trim() + '\n'
						}
					})
				}
				if (this.state._selNoteWakeType === 'multi' && this.state._notesWakeEnd) {
					let isCapturing = false
					const strArray = (sect.split('\n') || [])
					strArray.forEach((line) => {
						console.log(`line = ${line}`)
						if (line && line.trim().match(new RegExp(this.state._notesWakeEnd, 'g'))) {
							isCapturing = false
						} else if (line && line.trim().match(new RegExp(this.state._notesWake, 'g'))) {
							isCapturing = true
						}
						if (line && line.replace(this.state._notesWake, '').trim() && isCapturing) {
							// NOTE: Using multiline setting when only a single line exists, will duplicate data
							// EX: "WAKES: none" => "nonenone" b/c `objEntry.notesWake` is already "none" before this block ran
							// Therefore, check for this condition
							if (objEntry.notesWake !== line.replace(this.state._notesWake, '').trim())
								objEntry.notesWake += line.replace(this.state._notesWake, '').trim() + '\n'
						}
					})
				}

				// 3: default [bed time] if needed
				if (this.state._useDefaultTime && !objEntry.bedTime) objEntry.bedTime = this.state._defaultBedTime || '00:00'

				// 4: add section
				objEntry.notesPrep = objEntry.notesPrep?.trim()
				objEntry.notesWake = objEntry.notesWake?.trim()
				arrEntries.push(objEntry)
			})

		// D: capture/populate results
		this.setState({
			_parsedSections: arrEntries,
		})

		// E: save current setup to localStorage
		localStorage.setItem('import-config', JSON.stringify(this.state))

		if (VERBOSE_IMPORT) {
			console.log('arrEntries', arrEntries)
			//console.log(this.state)
		}
	}

	/**
	 * Add newly parsed entries into current Dream Journal
	 * This completes the import process
	 */
	handleImport = () => {
		const arrInvalidSects: IJournalEntry[] = []
		//const cntImported = this.state._parsedSections.length

		// A:
		if (!this.props.dataFile || !this.props.dataFile.name) {
			console.log('ERROR: No file selected')
		}

		// B:
		this.setState({
			_invalidSections: [],
		})

		// C: flag entries with duplicate `entryDate` (already exists in selected journal)
		this.state._parsedSections.forEach((sect) => {
			if (this.props.dataFile.entries.filter((entry) => entry.entryDate === sect.entryDate).length > 0) {
				arrInvalidSects.push(sect)
			}
		})

		// D: mark invalid entries, or do import if no errors
		if (arrInvalidSects.length > 0) {
			this.setState({ _invalidSections: arrInvalidSects })
		} else {
			// STEP 1: Add all entry (this only adds entry to current JSON file)
			this.state._parsedSections.forEach((sect) => this.props.appdataSvc.doEntryAdd(sect))

			// STEP 2: Write changes to cloud
			this.props.appdataSvc.doSaveDataFile()
				.then(() => {
					// A:
					alert(`SUCCESS!\nAdded ${this.state._parsedSections.length} new entries into selected journal.`)
					console.log('All entries successfully added!');

					// B: Clear import text and parsed results
					this.setState({
						_importHTML: '<br>',
						_importText: '',
						_parsedSections: [],
					})

					// C:
					setTimeout(() => {
						localStorage.setItem('import-config', JSON.stringify(this.state))
					}, 100)
				})
				.catch((error) => {
					// Handle any errors if one of the promises fails
					console.error('Error adding entries:', error)
					alert('ERROR: ' + error)
					console.error(error)
					// TODO: what to do about expired session?
					// `save` can can oauthLogin, but file still needs ot be saved - show a save button?
				})
		}
	}

	/* ======================================================================== */

	render() {
		const contHeaderCard: JSX.Element = (
			<div className='card mb-5'>
				<div className='card-header bg-info'>
					<h5 className='card-title text-white mb-0'>Import Dream Journal Entries</h5>
				</div>
				{window.location.href.toLowerCase().indexOf('localhost') === -1 &&
					<div className='card-body'>
						<div className='row align-items-center'>
							<div className='col-auto px-4'>
								<Cloud size='48' className='d-block mb-3' />
								<Upload size='48' className='d-block mt-3' />
							</div>
							<div className='col px-4'>
								<h5 className='text-primary'>Current</h5>
								<p className='card-text'>
									It&apos;s likely that you are already keeping a dream journal in another format, such a Document (Google Docs, Microsoft Word), spreadsheet
									(Google Sheets, Microsoft Excel), or just plain text.
								</p>
								<h5 className='text-success'>Journal</h5>
								<p className='card-text'>
									The importer interface allows you to import your free-form journal into the well-formatted Brain Cloud JSON format which is a universal,
									plain text, flat-file database readable by a myriad of apps (databases, text editors, etc.)
								</p>
							</div>
						</div>
					</div>
				}
			</div>
		)

		const contDemoData: JSX.Element = (
			<section className='bg-black p-4 border border-dark'>
				<h5 className='text-success text-uppercase mb-3'>Sample Journal Entry</h5>
				<ContentEditable
					innerRef={this.refDemoData}
					html={this.state._demoHTML} // innerHTML of the editable div
					disabled={false} // use true to disable editing
					onChange={(event) => {
						this.setState({
							_demoText: event.currentTarget.innerText,
							_demoHTML: event.target.value,
						})
						setTimeout(this.updateOptionResults, 100)
					}} // handle innerHTML change
					className='form-control mb-2'
					style={{ minHeight: '300px', height: 'auto' }}
				/>
			</section>
		)

		const contStep1: JSX.Element = (
			<section>
				<div className='row align-items-top gx-4 mb-4' data-desc="alert headings">
					<div className='col-8'>
						<div className="alert alert-info mb-0" role="alert">
							<h5 className="alert-heading">Field Parsing</h5>
							<p className='mb-0'>Map your dream journal fields below using live feedback to see the results.</p>
						</div>
					</div>
					<div className='col-4'>
						<div className="alert alert-success mb-0" role="alert">
							<h5 className="alert-heading">Journal Format</h5>
							<p className='mb-0'>Paste a journal entry from your current journal below.</p>
						</div>
					</div>
				</div>
				<div className='row align-items-top gx-4 mb-4' data-desc="form-fields | sample-input">
					<div className='col-8' id='contMapDemo'>
						<div className='bg-black p-4 border border-dark'>
							<h5 className='text-info mb-3'>JOURNAL ENTRY</h5>
							<section className='form-color-info'>
								<div className='row mb-3'>
									<div className='col-3'>
										<label className='required'>Entry Date</label>
									</div>
									<div className='col form-border'>
										<div className='row g-0'>
											<div className='col'>
												<select id='_selEntryType' className='form-select' onChange={this.handleSelectChange} value={this.state._selEntryType}>
													<option value='match'>Regex</option>
													<option value='first'>First line is the Entry Date</option>
												</select>
											</div>
											<div className={this.state._selEntryType === 'first' ? 'd-none' : 'col-7 ps-1'}>
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
										<div className='form-output'>{this.state.entryDate}</div>
										<div className={this.state._entryDateInvalidMsg ? 'invalid-feedback d-block' : 'invalid-feedback'}>{this.state._entryDateInvalidMsg}</div>
									</div>
								</div>
								<div className='row mb-3'>
									<div className='col-3'>
										<label>Bed Time</label>
									</div>
									<div className='col form-border'>
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
										<div className='form-output'>{this.state.bedTime}</div>
									</div>
								</div>
								<div className='row mb-3'>
									<div className='col-3'>
										<label>Prep Notes</label>
									</div>
									<div className='col form-border'>
										<div className='row g-0'>
											<div className='col-auto'>
												<select id='_selNotePrepType' className='form-select' onChange={this.handleSelectChange} value={this.state._selNotePrepType}>
													<option value='single'>Single-line</option>
													<option value='multi'>Multi-line</option>
												</select>
											</div>
											<div className='col ps-1'>
												<input
													name='_notesPrep'
													value={this.state._notesPrep}
													type='text'
													className='form-control'
													onChange={this.handleInputChange}
													placeholder='PREP'
												/>
											</div>
										</div>
										<div className={this.state._selNotePrepType === 'multi' ? 'row g-0 mt-1' : 'd-none'}>
											<input
												name='_notesPrepEnd'
												value={this.state._notesPrepEnd}
												type='text'
												className='form-control'
												onChange={this.handleInputChange}
												placeholder='("Prep Notes" ends with)'
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-output' style={{ whiteSpace: 'pre-line' }}>
											{this.state.notesPrep}
										</div>
									</div>
								</div>
								<div className='row mb-3'>
									<div className='col-3'>
										<label>Wake Notes</label>
									</div>
									<div className='col form-border'>
										<div className='row g-0'>
											<div className='col-auto'>
												<select id='_selNoteWakeType' className='form-select' onChange={this.handleSelectChange} value={this.state._selNoteWakeType}>
													<option value='single'>Single-line</option>
													<option value='multi'>Multi-line</option>
												</select>
											</div>
											<div className='col ps-1'>
												<input
													name='_notesWake'
													value={this.state._notesWake}
													type='text'
													className='form-control'
													onChange={this.handleInputChange}
													placeholder='WAKES'
												/>
											</div>
										</div>
										<div className={this.state._selNoteWakeType === 'multi' ? 'row g-0 mt-1' : 'd-none'}>
											<input
												name='_notesWakeEnd'
												value={this.state._notesWakeEnd}
												type='text'
												className='form-control'
												onChange={this.handleInputChange}
												placeholder='("Wake Notes" ends with)'
											/>
										</div>
									</div>
									<div className='col'>
										<div className='form-output'>{this.state.notesWake}</div>
									</div>
								</div>
							</section>

							<h5 className='text-success mb-3 mt-4'>ENTRY DREAMS: (1 or more)</h5>
							<section className='form-color-success'>
								<div className='row mb-3'>
									<div className='col-3'>
										<label className='required'>Dream Start</label>
									</div>
									<div className='col form-border'>
										<input
											name='_dreamBreak'
											value={this.state._dreamBreak}
											type='text'
											className='form-control'
											onChange={this.handleInputChange}
											placeholder='DREAM \d+:'
											required
										/>
									</div>
									<div className='col'>
										<div className='form-output'>
											{(this.state.dreamBreak || []).map((dream, idx) => (
												<div key={'dreambreak' + idx}>
													{idx + 1}:&nbsp;{dream}
												</div>
											))}
										</div>
									</div>
								</div>
								<div className='row mb-3'>
									<div className='col-3'>
										<label>Lucid Dream?</label>
									</div>
									<div className='col form-border'>
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
										<div className='form-output'>{this.state.isLucidDream && <div className='badge bg-success font-weight-light p-2'>YES</div>}</div>
									</div>
								</div>
								<div className='row mb-3'>
									<div className='col-3'>
										<label>Dream Signs</label>
									</div>
									<div className='col form-border'>
										<div className='row g-0'>
											<div className='col pe-2'>
												<input
													name='_dreamSigns'
													type='text'
													value={this.state._dreamSigns}
													placeholder='DREAMSIGNS'
													onChange={this.handleInputChange}
													className='form-control'
												/>
											</div>
											<div className='col-2' style={{ minWidth: 60 }}>
												<select
													id='_dreamSignsDelim'
													value={this.state._dreamSignsDelim}
													onChange={this.handleSelectChange}
													className='form-select'
												>
													<option value=','>,</option>
													<option value=';'>;</option>
													<option value=' '>(space)</option>
												</select>
											</div>
										</div>
									</div>
									<div className='col'>
										<div className='form-output'>{this.state.dreamSigns}</div>
									</div>
								</div>
								<div className='row mb-3'>
									<div className='col-3'>
										<label>Dream Title</label>
									</div>
									<div className='col form-border'>
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
										<div className='form-output'>{this.state.title}</div>
									</div>
								</div>
								<div className='row mb-0'>
									<div className='col-3'>
										<label>Dream Notes</label>
									</div>
									<div className='col form-border'>
										<div className='row g-0'>
											<div className='col'>
												<select id='_selDreamNotes' className='form-select' onChange={this.handleSelectChange} value={this.state._selDreamNotes}>
													<option value='match'>Regex</option>
													<option value='after'>All text after Dream Title</option>
												</select>
											</div>
											<div className={this.state._selDreamNotes === 'after' ? 'd-none' : 'col-7 ps-2'}>
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
										<div className='form-output'>
											{this.state.notes.map((note, idx) => (
												<div key={'note' + idx}>{note}</div>
											))}
										</div>
									</div>
								</div>
							</section>
						</div>
					</div>
					<div className='col-4'>
						{contDemoData}
					</div>
				</div>
			</section>
		)

		const contStep2: JSX.Element = (
			<section>
				<h3 className='text-primary'>Parsing Options</h3>
				<div className='row align-items-center py-4'>
					<div className='col'>
						<h5 className='text-info'>Section Break</h5>
						<div className="form-floating">
							<select id="_selBreakType" className="form-select" onChange={this.handleSelectChange} value={this.state._selBreakType}>
								<option value='blankLine'>Empty Line (paragraph style)</option>
								<option value='entryDate'>Entry Date</option>
							</select>
							<label htmlFor="_selBreakType">Type of break your journal uses between entries</label>
						</div>
					</div>
					<div className='col'>
						<h5 className='text-info'>Default Year</h5>
						<div className="form-floating">
							<select id="_defaultYear" className="form-select" onChange={this.handleSelectChange} value={this.state._defaultYear}>
								<option value='2024'>2024</option>
								<option value='2023'>2023</option>
								<option value='2022'>2022</option>
								<option value='2021'>2021</option>
								<option value='2020'>2020</option>
							</select>
							<label htmlFor="_defaultYear">Used when no year is available (ex: &quot;Date: 10/31&quot;)</label>
						</div>
					</div>
				</div>
				<div className='row align-items-center py-4'>
					<div className='col'>
						<h5 className='text-info'>Bed Time Format</h5>
						<div className='py-2 px-3 rounded border' style={{ backgroundColor: 'var(--bs-body-bg)' }}>
							<label className='text-muted mb-1'>
								Used to parse &quot;12:30&quot; in am/pm or 24-hour time
							</label>
							<div className='form-check form-switch'>
								<input
									id='flexSwitch_isTime24Hour'
									className='form-check-input'
									type='checkbox'
									role='switch'
									checked={this.state._isTime24Hour}
									onChange={(ev) => this.setState({ _isTime24Hour: ev.currentTarget.checked })}
								/>
								<label
									htmlFor="flexSwitch_isTime24Hour"
									className="form-check-label"
								>{this.state._isTime24Hour ? '24-Hour Format' : 'AM/PM Format'}</label>
							</div>
						</div>
					</div>
					<div className='col'>
						<h5 className='text-info'>Default Bed Time</h5>
						<div className='py-2 px-3 rounded border' style={{ backgroundColor: 'var(--bs-body-bg)' }}>
							<label>The time to use when no value is found</label>
							<div className='row'>
								<div className='col'>
									<div className="form-check form-switch">
										<input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault" />
										<label className="form-check-label" htmlFor="flexSwitchCheckDefault">Default switch checkbox input</label>
									</div>
									{/* FIXME:
									<BootstrapSwitchButton
										onChange={(checked: boolean) => {
											this.setState({ _useDefaultTime: checked })
										}}
										checked={this.state._useDefaultTime}
										onlabel='Use Default Time'
										onstyle='primary'
										offlabel='No Default Time'
										offstyle='secondary'
										style='w-100'
									/>*/}
								</div>
								<div className='col'>
									<input
										name='_defaultBedTime'
										type='time'
										className='form-control'
										onChange={this.handleInputChange}
										value={this.state._defaultBedTime}
										disabled={!this.state._useDefaultTime}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		)

		const importSetup: JSX.Element = (
			<section>
				<div className='row align-items-center mb-4'>
					<div className='col'>
						<h3 className='text-primary mb-0'>Import Config</h3>
					</div>
					<div className='col-auto'>
						<button className='btn btn-primary btn-lg' disabled>
							<ChevronRight className='me-2' />Next Step
						</button>
					</div>
				</div>
				{contStep1}
				{contStep2}
			</section>
		)

		const importParse: JSX.Element = (
			<section>
				<div className='row align-items-center'>
					<div className='col'>
						<h3 className='text-warning mb-0'>Instructions</h3>
					</div>
					<div className='col-auto'>
						<button
							disabled={(this.state._importText || '').length === 0}
							onClick={this.handleParse}
							className='btn btn-warning btn-lg'
						>
							Parse Journal Entries
						</button>
					</div>
				</div>
				<ul>
					<li>Copy one or more entries from your Dream Journal, then paste them below and click the Parse button</li>
					<li>The options in the Setup tab will be used to parse your existing entries into a new, well-structured format</li>
					<li>Review the results, make any changes, then click Import to add them to your Brain Cloud journal</li>
				</ul>
				<ContentEditable
					innerRef={this.refContentEditable}
					html={this.state._importHTML} // innerHTML of the editable div
					disabled={false} // use true to disable editing
					onChange={(event) =>
						this.setState({
							_importText: event.currentTarget.innerText,
							_importHTML: event.target.value,
						})
					} // handle innerHTML change
					className='form-control mb-2'
					style={{ minHeight: '300px', height: 'auto' }}
				/>
				<div className='text-secondary'>({(this.state._importText || '').length} characters)</div>
			</section>
		)

		const importResults: JSX.Element = (
			<form>
				<div className='row align-items-center mb-4'>
					<div className='col'>
						<h3 className='text-success mb-0'>{'Parse Results: ' + this.state._parsedSections.length + ' daily entries'}</h3>
					</div>
					<div className='col-auto'>
						<button type='button' className='btn btn-success btn-lg' onClick={this.handleImport} disabled={this.state._parsedSections.length === 0}>
							Import Journal Entries
						</button>
					</div>
				</div>
				{this.state._invalidSections.length === 0 ?
					<div className='alert alert-success'>
						Review the results below and make changes as needed, then click Import Entries to add these new entries to your current Dream Journal.
					</div>
					:
					<div className='alert alert-warning'>
						Invalid fields shown below.
					</div>
				}

				{this.state._parsedSections.map((sect, idx) => (
					<div key={`parsedsect${idx}`} className='card mt-5'>
						<div className='card-header bg-success'>
							<div className='row align-items-center'>
								<div className='col'>
									<h2 className='text-white mb-0'>Entry {idx + 1}</h2>
								</div>
								<div className='col-auto'>
									<button type='button' className='btn btn-danger' onClick={() => this.handleDeleteEntry(idx)} ><Trash className='me-2' />Delete</button>
								</div>
							</div>
						</div>
						<div className='card-body form-label'>
							<div className='row'>
								<div className='col-auto'>
									<label>Entry Date</label>
									<input
										name='entryDate'
										type='date'
										className={this.state._invalidSections.indexOf(sect) > -1 ? 'form-control is-invalid' : 'form-control'}
										value={sect.entryDate}
										onChange={(event) => this.handleResultChange(event, idx)}
										required
									/>
									<div className='invalid-feedback'>A journal entry with this date already exists.</div>
								</div>
								<div className='col-auto'>
									<label>Bed Time</label>
									<input
										name='bedTime'
										type='time'
										className='form-control'
										value={sect.bedTime}
										onChange={(event) => this.handleResultChange(event, idx)}
									/>
								</div>
								<div className='col'>
									<label>Prep Notes</label>
									<textarea
										name='notesPrep'
										value={sect.notesPrep}
										className='form-control'
										onChange={(event) => this.handleResultChange(event, idx)}
										rows={2}
									/>
								</div>
								<div className='col'>
									<label>Wake Notes</label>
									<textarea
										name='notesWake'
										className='form-control'
										value={sect.notesWake}
										onChange={(event) => this.handleResultChange(event, idx)}
										rows={2}
									/>
								</div>
							</div>
							{sect.dreams.map((dream, idy) => (
								<div key={'parsedsectdream' + idx + idy} className='mx-3'>
									<div className='row mt-4 bg-black p-3'>
										<div className='col-auto' style={{ minWidth: 50 }}>
											<div className='badge bg-info p-2 w-100 h-100'>DREAM<h3 className='mb-0'>{idy + 1}</h3></div>
										</div>
										<div className='col'>
											<div className='row mb-3' data-desc="top-row">
												<div className='col'>
													<label>Title</label>
													<input
														name='title'
														type='text'
														className='form-control'
														value={dream.title}
														onChange={(event) => this.handleResultChange(event, idx, idy)}
													/>
												</div>
												<div className='col-auto'>
													<label>Dream Signs</label>
													<input
														name='dreamSigns'
														type='text'
														className='form-control'
														value={dream.dreamSigns}
														onChange={(event) => this.handleResultChange(event, idx, idy)}
													/>
												</div>
												<div className='col-auto'>
													<label>Lucid Dream?</label>
													<div className="form-check form-switch">
														<input
															type="checkbox"
															role="switch"
															className="form-check-input"
															id={`${sect.entryDate}${idy}`}
															name="isLucidDream"
															checked={dream.isLucidDream}
															onChange={(ev) => {
																const newState = this.state._parsedSections
																newState[idx].dreams[idy].isLucidDream = ev.currentTarget.checked
																this.setState({ _parsedSections: newState })
															}}
														/>
														<label
															htmlFor={`${sect.entryDate}${idy}`}
															className="form-check-label"
														>{dream.isLucidDream ? 'Yes' : 'No'}</label>
													</div>
												</div>
												<div className='col-auto'>
													<label>Lucid Method</label>
													<select
														name='lucidMethod'
														value={dream.lucidMethod || InductionTypes.dild}
														disabled={!dream.isLucidDream}
														onChange={(event) => this.handleResultChange(event, idx, idy)}
														className='form-select'
													>
														{Object.entries(InductionTypes).map(([key, value]) => (
															<option key={'lucid-' + key + '-' + idx + '-' + idy} value={key}>
																{value}
															</option>
														))}
													</select>
												</div>
											</div>
											<div className='row'>
												<div className='col'>
													<textarea
														name='notes'
														value={dream.notes}
														onChange={(event) => this.handleResultChange(event, idx, idy)}
														className='form-control w-100'
														rows={5}
													/>
												</div>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</form>
		)

		return (
			<main className='m-4'>
				{contHeaderCard}
				<ul className='nav nav-tabs nav-fill' id='importTab' role='tablist'>
					<li className='nav-item' role='presentation'>
						<button
							className='nav-link active'
							id='setup-tab'
							data-bs-toggle='tab'
							data-bs-target='#setup'
							type='button'
							role='tab'
							aria-controls='setup'
							aria-selected='true'>
							<span className="badge text-bg-primary me-2">STEP 1</span>Set Import Options
						</button>
					</li>
					<li className='nav-item'>
						<button
							className='nav-link'
							id='parse-tab'
							data-bs-toggle='tab'
							data-bs-target='#parse'
							type='button'
							role='tab'
							aria-controls='parse'
							aria-selected='false'>
							<span className="badge text-bg-warning me-2">STEP 2</span>Parse Journal Entries
						</button>
					</li>
					<li className='nav-item'>
						<button
							className='nav-link'
							id='results-tab'
							data-bs-toggle='tab'
							data-bs-target='#results'
							type='button'
							role='tab'
							aria-controls='results'
							aria-selected='false'>
							<span className="badge text-bg-success me-2">STEP 3</span>Import Journal Entries
						</button>
					</li>
				</ul>
				<div className='tab-content'>
					<div className='tab-pane p-4 active' id='setup' role='tabpanel' aria-labelledby='setup-tab'>
						{importSetup}
					</div>
					<div className='tab-pane p-4' id='parse' role='tabpanel' aria-labelledby='parse-tab'>
						{importParse}
					</div>
					<div className='tab-pane p-4' id='results' role='tabpanel' aria-labelledby='results-tab'>
						{importResults}
					</div>
				</div>
			</main>
		)
	}
}
