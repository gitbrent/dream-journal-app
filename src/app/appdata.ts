/**
 * perform data engine functions
 * - acts as interface between app ("edit entry", "save data file") requests and googlegsi.ts
 */
import { IAuthState, IDriveConfFile, IDriveDataFile, IJournalEntry } from './app.types'
import { googlegsi } from './googlegsi'

export class appdata {
	private readonly DEF_CONF_FILE: IDriveConfFile = {
		_isLoading: false,
		_isSaving: false,
		id: '',
		dreamIdeas: [],
		lucidGoals: [],
		mildAffirs: [],
		tagTypeAW: [],
		tagTypeCO: [],
		tagTypeFO: [],
		tagTypeAC: [],
	}
	private readonly DEF_DATA_FILE: IDriveDataFile = {
		_isLoading: false,
		_isSaving: false,
		id: '',
		entries: [],
		modifiedTime: '',
		name: '',
		size: '',
	}
	private driveConfFile: IDriveConfFile = this.DEF_CONF_FILE
	private driveDataFile: IDriveDataFile = this.DEF_DATA_FILE
	private driveAuthState: IAuthState
	private googleapi: googlegsi
	private clientCallback: () => void

	constructor(callbackFunc: (() => void)) {
		this.clientCallback = callbackFunc
		if (!this.googleapi) this.googleapi = new googlegsi(this.gapiCallback)
		else this.gapiCallback()
	}

	private gapiCallback = () => {
		this.driveAuthState = this.googleapi?.authState
		this.driveConfFile = this.googleapi?.confFile
		this.driveDataFile = this.googleapi?.dataFile
	}

	//#region getters
	get confFile(): IDriveConfFile {
		return this.googleapi.confFile
	}

	get dataFile(): IDriveDataFile {
		return this.googleapi.dataFile
	}

	get authState(): IAuthState {
		return this.googleapi.authState
	}
	//#endregion

	public doAuthSignIn = () => {
		console.log('TODO: doAuthSignIn')
	}

	public doAuthSignOut = () => {
		console.log('TODO: doAuthSignIn')
	}

	public doEntryAdd = async (entry: IJournalEntry) => {
		console.log('TODO:')
		console.log(entry)
	}

	public doSaveDataFile = async () => {
		console.log('TODO:')
	}

	public getUniqueDreamTags = (): string[] => {
		const arrTags: string[] = []

		if (!this.dataFile?.entries) return []

		this.dataFile.entries
			.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
			.forEach((entry) =>
				entry.dreams.forEach((dream) =>
					dream.dreamSigns?.forEach((tag) => {
						if (arrTags.indexOf(tag) === -1) arrTags.push(tag)
					})
				)
			)

		return arrTags.sort()
	}

	public doEntryEdit = (entry: IJournalEntry, origEntryDate?: IJournalEntry['entryDate']) => {
		if (!this.dataFile?.entries) throw new Error('No datafile!')

		const editEntry = this.dataFile.entries.filter((item) => item.entryDate === (origEntryDate && origEntryDate !== entry.entryDate ? origEntryDate : entry.entryDate))[0]
		if (!editEntry) throw new Error('Unable to find entry!')

		Object.keys(entry).forEach((key) => {
			editEntry[key] = entry[key]
		})
	}

	public doEntryDelete = (entryDate: IJournalEntry['entryDate']) => {
		if (!this.dataFile.entries) throw new Error('No datafile!')

		const delIdx = this.dataFile.entries.findIndex((item) => item.entryDate === entryDate)
		if (delIdx === -1) throw new Error('Unable to find entry!')

		this.dataFile.entries.splice(delIdx, 1)
	}

	public doesEntryDateExist = (checkDate: string): boolean => {
		return this.dataFile.entries.filter((item) => item.entryDate === checkDate).length > 0 ? true : false
	}
}
