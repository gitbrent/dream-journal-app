export interface TokenClientConfig {
	client_id: string,
	scope: string,
	callback: (tokenResponse: TokenResponse) => void
}

/**
 * @see https://developers.google.com/identity/oauth2/web/reference/js-reference#TokenResponse
 */
export interface TokenResponse {
	/**
	 * The access token of a successful token response.
	 * @example "ya19.a1AVvZVpp-Wrh8bljS4Le-TqdKEckRS6udcii[...]"
	 */
	access_token: string,
	/**
	 * The lifetime in seconds of the access token.
	 * @example 3599
	 */
	expires_in: number,
	/**
	 * The prompt value that was used from the possible list of values specified by TokenClientConfig or OverridableTokenClientConfig.
	 * @example "none"
	*/
	prompt: string,
	/**
	 * A space-delimited list of scopes that are approved by the user.
	 * @example "email profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/drive.file"
	 */
	scope: string,
	/**
	 * The type of the token issued.
	 * @example "Bearer"
	 */
	token_type: string,
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
	kind: 'drive#file',
	/**
	 * id
	 * @example "1l5mVFTysjVoZ14_unp5F8F3tLH7Vkbtc"
	 */
	id: string
	/**
	 * created time (ISO format)
	 * @example "2022-11-21T14:54:14.453Z"
	 */
	createdDate: string
	/**
	 * file size (bytes)
	 * - only populated for files
	 * @example "3516911"
	 */
	fileSize?: string
	/**
	 * mime type
	 * @example "application/json"
	 */
	mimeType: string
	/**
	 * modified time (ISO format)
	 * @example "2022-11-21T14:54:14.453Z"
	 */
	modifiedDate: string
	/**
	 * file name
	 * @example "corp-logo.png"
	 */
	title: string
}

export interface IGapiFileListResp {
	files: IGapiFile[]
}
