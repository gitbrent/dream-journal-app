import { gapi } from 'gapi-script';

export const initClient = async (config: {
	apiKey: string;
	clientId: string;
	discoveryDocs: string[];
	scope: string;
}): Promise<void> => {
	await gapi.client.init(config);
};

export const signIn = () => {
	return gapi.auth2.getAuthInstance().signIn();
};

export const signOut = () => {
	return gapi.auth2.getAuthInstance().signOut();
};

export const isSignedIn = (): boolean => {
	const authInstance = gapi.auth2.getAuthInstance();
	return authInstance ? authInstance.isSignedIn.get() : false;
};

export const getCurrentUserProfile = (): gapi.auth2.BasicProfile | null => {
	const authInstance = gapi.auth2.getAuthInstance();
	return authInstance ? authInstance.currentUser.get().getBasicProfile() : null;
};
