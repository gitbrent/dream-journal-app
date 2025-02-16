import React, { useState, useEffect, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { gapi } from 'gapi-script';

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
	const [userProfile, setUserProfile] = useState<gapi.auth2.BasicProfile | null>(null)

	useEffect(() => {
		try {
			const auth = gapi.auth2.getAuthInstance();
			if (auth) {
				setIsSignedIn(auth.isSignedIn.get());
				auth.isSignedIn.listen(setIsSignedIn);
			} else {
				console.error('gapi.auth2.getAuthInstance() returned null');
			}
		} catch (error) {
			console.error('Error accessing gapi.auth2:', error);
		}
	}, []);

	useEffect(() => {
		if (isSignedIn) {
			setUserProfile(fetchUserProfile())
		}
		else {
			setUserProfile(null)
		}
	}, [isSignedIn]);

	const signIn = () => {
		gapi.auth2.getAuthInstance().signIn();
	};

	const signOut = () => {
		gapi.auth2.getAuthInstance().signOut();
	};

	const fetchUserProfile = (): gapi.auth2.BasicProfile | null => {
		const authInstance = gapi.auth2.getAuthInstance();
		return authInstance ? authInstance.currentUser.get().getBasicProfile() : null;
	};

	return (
		<AuthContext.Provider value={{ isSignedIn, signIn, signOut, userProfile }}>
			{children}
		</AuthContext.Provider>
	);
};
