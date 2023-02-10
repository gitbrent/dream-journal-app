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

// ==========

export interface IGapiCurrUser {
	'le': {
		'wt': {
			/**
			 * Full Name
			 * @example "Git Brent"
			 */
			'Ad': string,
			/**
			 * First Name
			 * @example "Git"
			 */
			'rV': string,
			/**
			 * Last Name
			 * @example "Brent"
			 */
			'uT': string,
			/**
			 * Account Picture
			 * @example "https://lh3.googleusercontent.com/a/ALm5wu3R_tKI4hZd9DbwPh8SShfBYgaNN95WZYZYvfwy=s96-c"
			 */
			'hK': string,
			/**
			 * Email
			 * @example "gitbrent@gmail.com"
			 */
			'cu': string
		}
	},
}

export interface IGapiFile {
	/**
	 * id
	 * @example "1l5mVFTysjVoZ14_unp5F8F3tLH7Vkbtc"
	 */
	id: string
	/**
	 * created time (ISO format)
	 * @example "2022-11-21T14:54:14.453Z"
	 */
	createdTime: string
	/**
	 * mime type
	 * @example "application/json"
	 */
	mimeType: string
	/**
	 * modified time (ISO format)
	 * @example "2022-11-21T14:54:14.453Z"
	 */
	modifiedTime: string
	/**
	 * file name
	 * @example "corp-logo.png"
	 */
	name: string
	/**
	 * file size (bytes)
	 * - only populated for files
	 * @example "3516911"
	 */
	size?: string
	/**
	 * blob from google drive
	 * - custom property (not in GAPI API)
	 * @example "blob:http://localhost:3000/2ba6f9a8-f8cf-4242-af53-b89418441b53"
	 */
	imageBlobUrl: string
	imageW: number
	imageH: number
	/**
	 * FUTURE: show parent folder
	 * `application/vnd.google-apps.folder`
	 * @example ["1jjOs28hGj3as3vorJveCI00NY1PmDbTr"]
	 */
	// parents: string[]
}
