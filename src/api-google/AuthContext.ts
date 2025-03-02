import { createContext } from "react";

interface AuthContextProps {
	isSignedIn: boolean;
	signIn: () => void;
	signOut: () => void;
	userProfile: gapi.auth2.BasicProfile | null;
}

export const AuthContext = createContext<AuthContextProps>({
	isSignedIn: false,
	signIn: () => { },
	signOut: () => { },
	userProfile: null,
});
