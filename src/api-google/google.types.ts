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
