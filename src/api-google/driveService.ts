import { IDriveConfFile, IDriveDataFile } from "../app/app.types"
import { IGapiFile } from "../app/googlegsi.types"

const gapiConfFile: IGapiFile | undefined | null = null
const gapiDataFile: IGapiFile | undefined | null = null
const driveConfFile: IDriveConfFile | undefined | null = null
const driveDataFile: IDriveDataFile | undefined | null = null

/*
driveConfFile = {
		id: '',
		dreamIdeas: [],
		lucidGoals: [],
		mildAffirs: [],
		tagTypeAW: [],
		tagTypeCO: [],
		tagTypeFO: [],
		tagTypeAC: [],
	}
*/

export const listFiles = async (): Promise<gapi.client.drive.File[]> => {
	try {
		const response = await gapi.client.drive.files.list({
			q: "trashed=false and mimeType = 'application/json'"
		});

		const files = response.result.files || [];

		console.log('Files:', files);

		return files || [];
	} catch (error) {
		console.error('Error fetching files:', error);
		throw error;
	}
};
