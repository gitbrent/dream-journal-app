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
	 * **CUSTOM FIELD** The lifetime in seconds of the access token.
	 * - stored as `Date.now() + this.tokenResponse.expires_in * 1000` so its easy to calc expire time
	 * @example 3599
	 */
	expiresTime: number,
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

/*
	const responsePayload = decodeJwt(response.credential)
	if (IS_LOCALHOST) {
		console.log('\nGSI-STEP-1: responsePayload:')
		console.log('- ID.........: ' + responsePayload.sub)
		// console.log('- Full Name..: ' + responsePayload.name)
		// console.log('- Given Name.: ' + responsePayload.given_name)
		// console.log('- Family Name: ' + responsePayload.family_name)
		// console.log('- Image URL..: ' + responsePayload.picture)
		// console.log('- Email......: ' + responsePayload.email)

		// TODO: create interface

		{
			"iss": "https://accounts.google.com",
			"nbf": 1676348859,
			"aud": "300205784774-vt1v8lerdaqlnmo54repjmtgo5ckv3c3.apps.googleusercontent.com",
			"sub": "101280436360833726869",
			"email": "gitbrent@gmail.com",
			"email_verified": true,
			"azp": "300205784774-vt1v8lerdaqlnmo54repjmtgo5ckv3c3.apps.googleusercontent.com",
			"name": "Git Brent",
			"picture": "https://lh3.googleusercontent.com/a/AEdFTp4Tw1g8xUq1u8crhAHVBR87CSJNzBTFVN593txN=s96-c",
			"given_name": "Git",
			"family_name": "Brent",
			"iat": 1676349159,
			"exp": 1676352759,
			"jti": "b9d7558a6fda4870c20d68ac47e5f5e3eebf51f9"
		}

	}
*/
