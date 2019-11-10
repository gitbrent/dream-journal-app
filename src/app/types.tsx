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
	'none' = '(n/a)',
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

export interface IAuthState {
	status: AuthState
	userName: ''
	userPhoto: ''
}
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
	dreams?: Array<IJournalDream>
}

export interface IDreamSignTag {
	id: number
	name: string
}

export interface ISearchMatch {
	entryDate: IJournalEntry['entryDate']
	starred: IJournalEntry['starred']
	dream: IJournalDream
}
