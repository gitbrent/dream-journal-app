// APP
export const APP_BLD = '20210214-2330'
export const APP_VER = `1.1.0-WIP-${APP_BLD}`

// CONST
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ENUMS
export enum AuthState {
	Authenticated = 'Authenticated',
	Unauthenticated = 'Unauthenticated',
	Expired = 'Expired',
}
export enum ImportTypes {
	'docx' = 'Document',
	'xlsx' = 'Spreadsheet',
}
export enum InductionTypes {
	'dild' = 'DILD',
	'mild' = 'MILD',
	'wbtb' = 'WBTB',
	'wild' = 'WILD',
	'other' = 'Other',
}
export enum SearchMatchTypes {
	contains = 'Contains',
	starts = 'Starts With',
	whole = 'Whole Word',
}
export enum SearchScopes {
	all = 'All Fields',
	signs = 'Dream Signs',
	notes = 'Dream Notes',
	title = 'Dream Title',
	_starred = 'starred',
	_isLucid = 'isLucidDream',
}
export enum TagDisplayOptions {
	all = 'All',
	top30 = 'Top 30',
	singles = 'Singles',
}
export enum CardDreamSignGrpViewType {
	lg = 'Large',
	md = 'Medium',
	sm = 'Small',
}

// INTERFACES
export interface IAuthState {
	status: AuthState
	userName: ''
	userPhoto: ''
}
/**
 * Google Drive file in JSON format
 */
export interface IDriveFile {
	_isLoading: boolean
	_isSaving: boolean
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
	dreamSigns?: Array<string>
	dreamImages?: Array<string>
	isLucidDream: boolean
	lucidMethod: InductionTypes
}

/**
 * A daily journal entry containing 1+ dreams
 */
export interface IJournalEntry {
	entryDate: string
	bedTime?: string
	notesPrep?: string
	notesWake?: string
	starred?: boolean
	dreams?: IJournalDream[]
}

export interface IDreamSignTag {
	id: number
	name: string
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
	/** sums `dream` array under `dailyEntries` (save us time!) */
	totalOccurs: number
}

export interface IDreamTagByCat {
	/** @example 'Action' */
	dreamCat: string
	/** @example ['Action:Crime', 'Action:Military'] */
	dreamTagGroups: IDreamSignTagGroup[]
}
