/**
 * perform data engine functions
 * - acts as interface between app ("edit entry", "save data file") requests and googlegsi.ts
 */
import { AuthState, IAuthState, IDriveConfFile, IDriveDataFile, IJournalEntry } from './app.types'
import { googlegsi } from './googlegsi'

export class appdata {
	private readonly DEF_AUTH_STATE: IAuthState = {
		status: AuthState.Unauthenticated,
		userName: '',
		userPhoto: '',
	}
	private readonly DEF_CONF_FILE: IDriveConfFile = {
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
		id: '',
		entries: [],
		modifiedTime: '',
		name: '',
		size: '',
	}
	private driveAuthState: IAuthState = this.DEF_AUTH_STATE
	private driveConfFile: IDriveConfFile = this.DEF_CONF_FILE
	private driveDataFile: IDriveDataFile = this.DEF_DATA_FILE
	private googleapi: googlegsi | undefined
	private clientCallback: () => void

	constructor(callbackFunc: (() => void)) {
		this.clientCallback = callbackFunc
		if (!this.googleapi) this.googleapi = new googlegsi(this.doUpdateAndCallback)
		else this.doUpdateAndCallback()
	}

	private doUpdateAndCallback = () => {
		if (!this.googleapi) {
			throw new Error('googleapi is not initialized');
		}

		// A: Set vars
		this.driveAuthState = this.googleapi.authState
		if (this.googleapi.confFile) this.driveConfFile = this.googleapi.confFile
		if (this.googleapi.dataFile) this.driveDataFile = this.googleapi.dataFile
		// B: Notify caller
		this.clientCallback()
	}

	// -------------------------------------------------------------

	get confFile(): IDriveConfFile {
		return this.driveConfFile
	}

	get dataFile(): IDriveDataFile {
		return this.driveDataFile
	}

	get authState(): IAuthState {
		return this.driveAuthState
	}

	// -------------------------------------------------------------

	public doAuthSignIn = async () => {
		return this.googleapi?.doAuthSignIn()
	}

	public doAuthSignOut = async () => {
		return this.googleapi?.doAuthSignOut()
	}

	public doRefreshDataFile = async () => {
		if (!this.googleapi) return
		await this.googleapi.doReadDataFile()
		this.doUpdateAndCallback()
		return
	}

	public doEntryAdd = async (entry: IJournalEntry) => {
		if (!this.dataFile || !this.dataFile.entries) throw new Error('No datafile!')
		this.dataFile.entries.push(entry)
		this.dataFile.entries.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
	}

	public doSaveDataFile = async () => {
		if (!this.googleapi) return
		await this.googleapi.doSaveDataFile()
		this.doUpdateAndCallback()
		return
	}

	// TODO: move to `modal-entry.tsx`!
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
		if (!this.dataFile?.entries) {
			throw new Error('No datafile!');
		}

		const editEntry = this.dataFile.entries.find((item) =>
			item.entryDate === (origEntryDate && origEntryDate !== entry.entryDate ? origEntryDate : entry.entryDate)
		);

		if (!editEntry) {
			throw new Error('Unable to find entry!');
		}

		// Update the existing entry with the new entry data
		Object.assign(editEntry, entry);
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

	// TODO: methods from prev library not implemented as of yet (2023-02)
	// PUBLIC METHODS: CONF FILE -------------------------------------------------
	/*
	public doEditConf_DreamIdeas(dreamIdeas: IConfMetaCats[]) {
		if (!gConfFile || !gConfFile.id) throw new Error('No ConfFile!')
		gConfFile.dreamIdeas = dreamIdeas
	}

	public doEditConf_LucidGoals(lucidGoals: IConfMetaCats) {
		if (!gConfFile || !gConfFile.id) throw new Error('No ConfFile!')
		gConfFile.lucidGoals = lucidGoals
	}

	public doEditConf_MildAffirs(mildAffirs: IConfMetaCats[]) {
		if (!gConfFile || !gConfFile.id) throw new Error('No ConfFile!')
		gConfFile.mildAffirs = mildAffirs
	}

	public doEditTagTypes(type: SignInventoryType, tags: string[]) {
		if (!gConfFile || !gConfFile.id) throw new Error('No ConfFile!')
		gConfFile[`tagType${type}`] = tags
	}
	*/
}
