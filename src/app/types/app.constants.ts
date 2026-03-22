/**
 * As of early 2023, Google now uses Google Identity Services (GSI)
 * @see https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow // (!!!)
 * @see https://developers.google.com/identity/oauth2/web/guides/overview
 * @see https://stackoverflow.com/a/71394671/12519131
 * @see https://developers.google.com/identity/oauth2/web/guides/migration-to-gis#gis-and-gapi
 * @see https://developers.google.com/identity/oauth2/web/guides/migration-to-gis#the_new_way // HERE IS GOOGLE USING BOTH GIS AND GAPI
 * @see https://github.com/BurakGur/google-one-tap/blob/master/index.js
 * @see https://jwt.io/#debugger
 * @note Add both http://localhost and http://localhost:<port_number> to the Authorized JavaScript origins box for local tests or development. [google console]
 */

// TODO: rotate client secrets
// @see https://support.google.com/cloud/answer/6158849?hl=en#zippy=%2Cstep-create-a-new-client-secret

export const APP_BLD = '20260322-1612'
export const APP_VER = `2.2.0`
export const IS_LOCALHOST = window.location.href.toLowerCase().indexOf('localhost') > -1
export const VERBOSE_IMPORT = true

export const getLogLevel = (): number => {
	const urlParams = new URLSearchParams(window.location.search)
	const mode = urlParams.get('mode')

	switch (mode) {
		case 'debug': return 3
		case 'api': return 2
		case 'core': return 1
		default: return 0
	}
}
export const LOG_LEVEL = getLogLevel()

export const log = (level: number, message: string) => {
	if (level <= LOG_LEVEL) {
		console.log(message)
	}
}
