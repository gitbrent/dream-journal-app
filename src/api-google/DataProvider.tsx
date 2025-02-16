import React, { useState, ReactNode } from 'react'
import { IDriveConfFile, IDriveDataFile, IJournalEntry, log } from '../app/app.types'
import { DataContext } from './DataContext'

interface DataProviderProps {
	children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [gapiConfFile, setGapiConfFile] = useState<gapi.client.drive.File | undefined | null>(null)
	const [gapiDataFile, setGapiDataFile] = useState<gapi.client.drive.File | undefined | null>(null)
	const [driveConfFile, setDriveConfFile] = useState<IDriveConfFile | undefined | null>(null)
	const [driveDataFile, setDriveDataFile] = useState<IDriveDataFile | undefined | null>(null)

	const refreshData = async () => {
		log(2, `[DataProvider] refreshData!`)
		try {
			// STEP 1:
			setIsLoading(true)

			// STEP 2: Get file metadata for both app files
			const token = gapi.auth.getToken()?.access_token
			const response = await gapi.client.drive.files.list({
				q: "trashed=false and mimeType = 'application/json'",
				fields: "files(id, name, size, modifiedTime)"
			});
			const respFiles = response.result.files || [];

			// STEP 3: Download the conf file
			const confFile = respFiles.filter(item => item.name === 'dream-journal-conf.json')[0]
			setGapiConfFile(confFile)
			log(2, `[refreshData][conf] gapiConfFile id = ${confFile.id}`)
			const confFileData = await getConfFile(confFile, token || "")
			setDriveConfFile(confFileData)
			log(2, `[refreshData][conf]  driveConfFile.id = ${confFileData.id}`)

			// STEP 4: Download the data file
			const dataFile = respFiles.filter(item => item.name === 'dream-journal.json')[0]
			setGapiDataFile(dataFile)
			log(2, `[refreshData][data] gapiDataFile id = ${dataFile.id}`)
			const dataFileData = await getDataFile(dataFile, token || "")
			setDriveDataFile(dataFileData)
			log(2, `[refreshData][data] driveDataFile.id = ${dataFileData.id}`)
		} catch (error) {
			console.error('Error refreshing data:', error);
		} finally {
			setIsLoading(false);
		}
	}

	const getConfFile = async (file: gapi.client.drive.File, token: string): Promise<IDriveConfFile> => {
		const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
			method: 'GET',
			headers: { Authorization: `Bearer ${token}` },
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
			id: file.id || '', // NOTE: file.id is never undefined
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
	const getDataFile = async (file: gapi.client.drive.File, token: string): Promise<IDriveDataFile> => {
		const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
			method: 'GET',
			headers: { Authorization: `Bearer ${token}` },
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
			id: file.id || '', // NOTE: file.id is never undefined
			entries: entries || [],
			modifiedTime: file.modifiedTime || '',
			name: file.name || '',
			size: file.size?.toString() || '-1',
		}
	}

	// WIP: TODO: copy old code
	const getUniqueDreamTags = (): string[] => {
		return [];
	}

	// WIP: TODO: copy old code
	const doesEntryDateExist = (date: string): boolean => {
		return date ? true : false;
	}

	const doEntryAdd = async (entry: IJournalEntry) => {
		if (!driveDataFile || !driveDataFile.entries) throw new Error('No datafile!')
		driveDataFile.entries.push(entry)
		driveDataFile.entries.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
	}

	const doEntryEdit = (entry: IJournalEntry, origEntryDate?: IJournalEntry['entryDate']) => {
		if (!driveDataFile?.entries) {
			throw new Error('No datafile!');
		}

		const editEntry = driveDataFile.entries.find((item) =>
			item.entryDate === (origEntryDate && origEntryDate !== entry.entryDate ? origEntryDate : entry.entryDate)
		);

		if (!editEntry) {
			throw new Error('Unable to find entry!');
		}

		// Update the existing entry with the new entry data
		Object.assign(editEntry, entry);
	}

	const doEntryDelete = (entryDate: IJournalEntry['entryDate']) => {
		if (!driveDataFile?.entries) throw new Error('No datafile!')

		const delIdx = driveDataFile.entries.findIndex((item) => item.entryDate === entryDate)
		if (delIdx === -1) throw new Error('Unable to find entry!')

		driveDataFile.entries.splice(delIdx, 1)
	}


	// ------------------------------------------------------------------------

	return (
		<DataContext.Provider
			value={{
				refreshData, isLoading, driveDataFile,
				getUniqueDreamTags, doesEntryDateExist,
				doEntryAdd, doEntryEdit, doEntryDelete,
			}}>
			{children}
		</DataContext.Provider>
	)
}
