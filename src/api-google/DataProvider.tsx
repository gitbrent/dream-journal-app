import React, { useState, ReactNode } from 'react'
import { IDriveConfFile, IDriveDataFile, IJournalEntry, log } from '../app/app.types'
import { DataContext } from './DataContext'

interface DataProviderProps {
	children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
	const [isLoading, setIsLoading] = useState<boolean>(false)
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
			log(2, `[refreshData][conf] gapiConfFile id = ${confFile.id}`)
			const confFileData = await getConfFile(confFile, token || "")
			setDriveConfFile(confFileData)
			log(2, `[refreshData][conf]  driveConfFile.id = ${confFileData.id}`)

			// STEP 4: Download the data file
			const dataFile = respFiles.filter(item => item.name === 'dream-journal.json')[0]
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

	const getUniqueDreamTags = (): string[] => {
		const arrTags: string[] = []

		if (driveDataFile?.entries) {
			driveDataFile.entries
				.sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
				.forEach((entry) =>
					entry.dreams.forEach((dream) =>
						dream.dreamSigns?.forEach((tag) => {
							if (arrTags.indexOf(tag) === -1) arrTags.push(tag)
						})
					)
				)
		}

		return arrTags.sort()
	}

	const doesEntryDateExist = (date: string): boolean => {
		return driveDataFile && driveDataFile.entries.filter((item) => item.entryDate === date).length > 0 ? true : false
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

	const doSaveDataFile = async (): Promise<boolean> => {
		// DATA FIXES: (20191101):
		/*
			newState.entries.forEach(entry => {
				entry.dreams.forEach(dream => {
					// WORKED! if (typeof dream.dreamSigns === 'string') dream.dreamSigns = (dream.dreamSigns as string).split(',')
					// WORKED! dream.dreamSigns = dream.dreamSigns.map(sign=>{ return sign.trim() })
					// WORKED (20210127) dream.dreamSigns = dream.dreamSigns.map((sign) => sign.toLowerCase().trim())
				})
			})
		*/

		if (!driveDataFile) return Promise.resolve(false);

		// A: fix [null] dates that can be created by import data/formatting, etc.
		const entriesFix = driveDataFile.entries;
		entriesFix.forEach((entry, idx) => (entry.entryDate = entry.entryDate ? entry.entryDate : `1999-01-0${idx + 1}`));

		// B: sort all entries by `entryDate`
		const jsonBody: object = {
			entries: entriesFix.sort((a, b) => (a.entryDate > b.entryDate ? 1 : -1)),
		};

		// C: create file body
		const reqHead = { name: 'dream-journal.json', description: 'Brain Cloud Dream Journal data file', mimeType: 'application/json' };
		const reqBody: string = `--foo_bar_baz\nContent-Type: application/json; charset=UTF-8\n\n${JSON.stringify(reqHead)}\n` +
			`--foo_bar_baz\nContent-Type: application/json\n\n${JSON.stringify(jsonBody, null, 2)}\n--foo_bar_baz--`;
		const reqEnd = encodeURIComponent(reqBody).match(/%[89ABab]/g) || '';

		// D: upload file
		const token = gapi.auth.getToken()?.access_token;
		const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${driveDataFile.id}?uploadType=multipart`, {
			method: 'PATCH',
			body: reqBody,
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'multipart/related; boundary=foo_bar_baz',
				'Content-Length': `${reqBody.length + reqEnd.length}`,
			},
		});
		log(3, `[uploadDataFile] response === ${response.status}`);

		// LAST: Done
		return response.ok
	}

	// ------------------------------------------------------------------------

	return (
		<DataContext.Provider
			value={{
				refreshData, isLoading, driveConfFile, driveDataFile,
				getUniqueDreamTags, doesEntryDateExist,
				doEntryAdd, doEntryEdit, doEntryDelete, doSaveDataFile
			}}>
			{children}
		</DataContext.Provider>
	)
}
