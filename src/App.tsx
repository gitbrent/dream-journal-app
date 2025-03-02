import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import { AuthProvider } from './api-google/AuthProvider';
import { DataProvider } from './api-google/DataProvider';
import { initClient } from './api-google';
import AppMain from './app/appmain';
import ErrorBoundary from './ErrorBoundary';

const CLIENT_ID = import.meta.env.VITE_GDRIVE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GDRIVE_API_KEY;
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

const App: React.FC = () => {
	const [gapiInitialized, setGapiInitialized] = useState<boolean>(false);

	useEffect(() => {
		const start = () => {
			initClient({
				apiKey: API_KEY,
				clientId: CLIENT_ID,
				discoveryDocs: DISCOVERY_DOCS,
				scope: SCOPES,
			}).then(() => {
				setGapiInitialized(true);
			});
		};
		gapi.load('client:auth2', start);
	}, []);

	return !gapiInitialized
		? <div className='text-center m-5'>
			<div className='alert alert-info'>Initializing GAPI...</div>
		</div>
		: <AuthProvider>
			<DataProvider>
				<ErrorBoundary>
					<AppMain />
				</ErrorBoundary>
			</DataProvider>
		</AuthProvider>
}

export default App;
