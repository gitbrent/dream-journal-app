import React, { useState, useEffect, ReactNode, useContext } from 'react'
import { listFiles, getCurrentUserProfile } from '.'
import { log } from '../app/app.types'
import { AuthContext } from './AuthContext'
import { DataContext } from './DataContext'

interface DataProviderProps {
	children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
	const [userProfile, setUserProfile] = useState<gapi.auth2.BasicProfile | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const { isSignedIn } = useContext(AuthContext)

	const refreshData = async () => {
		log(2, `[DataProvider] refreshData!`)
		try {
			setIsLoading(true);
			const gapiFiles = await listFiles();
			console.log(`[DataProvider] gapiFiles =`, gapiFiles)
			const profile = getCurrentUserProfile();
			setUserProfile(profile);
		} catch (error) {
			console.error('Error refreshing data:', error);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		log(2, `[DataProvider] isSignedIn = ${isSignedIn}`)
		if (isSignedIn) refreshData();
	}, [isSignedIn])

	return (
		<DataContext.Provider
			value={{ userProfile, refreshData, isLoading }}>
			{children}
		</DataContext.Provider>
	)
}
