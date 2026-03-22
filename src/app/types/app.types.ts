import { AuthState, InductionTypes } from './app.enums'

export interface IConfMetaCats {
	iconName?: string
	headClass?: string
	bodyClass?: string
	title: string
	bullets: string[]
}

export interface IAuthState {
	status: AuthState
	userName: string
	userPhoto: string
}

/**
 * Google Drive Conf file in JSON format
 */
export interface IDriveConfFile {
	id: string
	dreamIdeas: IConfMetaCats[]
	lucidGoals: IConfMetaCats[] // always has 1 item
	mildAffirs: IConfMetaCats[]
	tagTypeAW: string[]
	tagTypeCO: string[]
	tagTypeFO: string[]
	tagTypeAC: string[]
}

/**
 * Google Drive Data file in JSON format
 */
export interface IDriveDataFile {
	id: string
	entries: IJournalEntry[]
	modifiedTime: string
	name: string
	size: string
}

/**
 * A single dream entry - there are 1+ of these in every IJournalEntry
 */
export interface IJournalDream {
	title: string
	notes?: string
	/** FUTURE: TODO: rename to `dreamTags` */
	dreamSigns?: string[]
	dreamImages?: string[]
	isLucidDream: boolean
	lucidMethod?: InductionTypes
}

/**
 * A daily journal entry containing 1+ dreams
 */
export interface IJournalEntry {
	/**
	 * Date in `yyyy-MM-dd` format
	 * @example '2021-06-20'
	 */
	entryDate: string
	/**
	 * Bed time in hh24 format
	 * @example '23:30'
	 */
	bedTime?: string
	notesPrep?: string
	notesWake?: string
	dreams: IJournalDream[]
}

export interface IDreamSignTag {
	value: number
	label: string
}

/**
 * An IJournalDream dream with parent entry's date and starred status
 */
export interface ISearchMatch {
	entry: IJournalEntry
	dreamIdx: number
}

export interface IDreamSignTagGroup {
	dreamSign: string
	/** every journal entry this dreamSign appears in */
	dailyEntries: IJournalEntry[]
	/** sums `dreams` array under `dailyEntries` (save us time!) */
	totalOccurs: number
}

export interface IDreamTagByCat {
	/** @example 'action' */
	/** @example 'rude person' */
	dreamCat: string
	/** @example ['action', 'action:crime', 'action:military'] */
	/** @example ['rude person'] */
	dreamTagGroups: IDreamSignTagGroup[]
}
