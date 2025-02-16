import React, { useState, ReactNode } from 'react'
import { IDriveConfFile, IDriveDataFile, IJournalEntry, log } from '../app/app.types'
import { DataContext } from './DataContext'

interface DataProviderProps {
	children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
	const [isLoading, setIsLoading] = useState<boolean>(false)

	let accessToken = "";
	let gapiConfFile: gapi.client.drive.File | undefined | null = null
	let gapiDataFile: gapi.client.drive.File | undefined | null = null
	let driveConfFile: IDriveConfFile | undefined | null = null
	let driveDataFile: IDriveDataFile | undefined | null = null

	const refreshData = async () => {
		log(2, `[DataProvider] refreshData!`)
		try {
			// STEP 1:
			setIsLoading(true)

			// STEP 2: Get file metadata for both app files
			accessToken = gapi.auth.getToken()?.access_token
			const response = await gapi.client.drive.files.list({
				q: "trashed=false and mimeType = 'application/json'"
			});
			const respFiles = response.result.files || [];

			// STEP 3: Download the conf file
			gapiConfFile = respFiles.filter(item => item.name === 'dream-journal-conf.json')[0]
			log(2, `[refreshData] gapiConfFile id = '${gapiConfFile.id}'`)
			driveConfFile = await downloadConfFile()
			log(2, `[refreshData] driveConfFile.id = ${driveConfFile.id}`)

			// STEP 4: Download the data file
			gapiDataFile = respFiles.filter(item => item.name === 'dream-journal-data.json')[0]
			log(2, `[refreshData] gapiDataFile id = '${gapiDataFile.id}'`)
			driveDataFile = await downloadDataFile()
			log(2, `[refreshData] driveDataFile.id = ${driveDataFile.id}`)

		} catch (error) {
			console.error('Error refreshing data:', error);
		} finally {
			setIsLoading(false);
		}
	}

	const downloadConfFile = async (): Promise<IDriveConfFile> => {
		const response = await fetch(`https://www.googleapis.com/drive/v3/files/${gapiConfFile?.id}?alt=media`, {
			method: 'GET',
			headers: { Authorization: `Bearer ${accessToken}` },
		})
		const buffer = await response.arrayBuffer()
		const decoded: string = new TextDecoder('utf-8').decode(buffer)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let json: Record<string, any> = {}

		// A:
		if (decoded?.length > 0) {
			try {
				// NOTE: Initial dream-journal file is empty!
				json = JSON.parse(decoded)
			} catch (ex) {
				if (ex instanceof Error) {
					alert(ex)
					console.error(ex)
				}
			}
		}

		// B:
		return {
			id: gapiConfFile?.id || '', // NOTE: gapiConfFile.id is never undefined
			dreamIdeas: json['dreamIdeas'] || [],
			lucidGoals: json['lucidGoals'] || [],
			mildAffirs: json['mildAffirs'] || [],
			tagTypeAW: json['tagTypeAW'] || [],
			tagTypeCO: json['tagTypeCO'] || [],
			tagTypeFO: json['tagTypeFO'] || [],
			tagTypeAC: json['tagTypeAC'] || [],
		}
	}

	/**
	 * `gapi.client.drive.files.get` can only get metadata, retrieving contents requires this
	 * @see https://developers.google.com/drive/api/v2/reference/files/get#javascript
	 * @returns
	 */
	const downloadDataFile = async (): Promise<IDriveDataFile> => {
		const response = await fetch(`https://www.googleapis.com/drive/v3/files/${gapiDataFile?.id}?alt=media`, {
			method: 'GET',
			headers: { Authorization: `Bearer ${accessToken}` },
		})
		const buffer = await response.arrayBuffer()
		const decoded: string = new TextDecoder('utf-8').decode(buffer)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let json: Record<string, any> = {}
		let entries: IJournalEntry[] = []

		// A:
		if (decoded && decoded.length > 0) {
			try {
				// NOTE: Initial dream-journal file is empty!
				json = JSON.parse(decoded)
				entries = json['entries']
			} catch (ex) {
				alert(ex)
				console.error(ex)
			}
		}

		// B:
		return {
			id: gapiDataFile?.id || '', // NOTE: gapiDataFile.id is never undefined
			entries: entries || [],
			modifiedTime: gapiDataFile?.modifiedTime || '',
			name: gapiDataFile?.name || '',
			size: gapiDataFile?.size?.toString() || '-1',
		}
	}


	return (
		<DataContext.Provider value={{ refreshData, isLoading }}>
			{children}
		</DataContext.Provider>
	)
}
