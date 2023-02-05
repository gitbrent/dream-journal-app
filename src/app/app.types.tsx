// APP
export const APP_BLD = '20230205-1400'
//export const APP_VER = `1.3.0-WIP ${APP_BLD}`
export const APP_VER = '1.3.0-WIP'

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

export enum MetaType {
	first = 'meta:first',
	star = 'meta:star',
}

// TODO: allow grouping of TAGS by overall types
//export type SIGN_INVENTORY_TYPE = 'AWARENESS' | 'CONTEXT' | 'FORM' | 'ACTION'
export enum SignInventoryType {
	aw = 'AWARENESS',
	co = 'CONTEXT',
	fo = 'FORM',
	ac = 'ACTION',
}

export interface IConfMetaCats {
	iconName?: string
	headClass?: string
	bodyClass?: string
	title: string
	bullets: string[]
}

// INTERFACES
export interface IAuthState {
	status: AuthState
	userName: ''
	userPhoto: ''
}
/**
 * Google Drive Conf file in JSON format
 */
export interface IDriveConfFile {
	_isLoading: boolean
	_isSaving: boolean
	id: string
	dreamIdeas: IConfMetaCats[]
	lucidGoals: IConfMetaCats
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
	/** FUTURE: TODO: rename to `dreamTags` */
	dreamSigns?: string[]
	dreamImages?: string[]
	isLucidDream: boolean
	lucidMethod: InductionTypes
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
