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
export enum NightlyAffirmations {
	'SMALL1' = 'Tonight, I will recognize my Dream Symbols and become aware I am dreaming.',
	'SMALL2' = 'I will become aware during all of my dreams tonight, and retain control for as long as I wish.',
	'MILD (Naiya-Style)' = 'Relax and completely de-stress.' +
		'Visualize as best you can the last vivid dream - now imagine yourself becoming Lucid in the dream.' +
		'Repeat to yourself, "I will have a lucid dream tonight."',
	'MILD 1' = 'I resolve to become aware in my dreams tonight and have a Lucid Dream.' +
		'Tonight, I will recognize my Dream-Signs and become aware I am dreaming.' +
		'I can see myself becoming aware in my dreams and I can see myself surrounded by Dream-Signs.',
	'MILD 2' = 'I WILL LUCID DREAM SOON' + 'I EXPECT TO LD MUCH MORE OFTEN' + 'I love myself and my abilities.' + 'I am NOT SCARED of any dream situations.',
	'MILD 3' = 'I will Lucid Dream tonight.\n' +
		'I will practice my Kung Fu in the Matrix construct with Morpheus.\n' +
		'I will spin around in a circle if the dream starts to become unstable.\n' +
		'I will wake up after 03:00 and perform affirmations, then meditate back to sleep.\n',
}
