import { createContext } from "react";

interface DataContextProps {
	userProfile: gapi.auth2.BasicProfile | null;
	refreshData: () => void;
	isLoading: boolean;
}

export const DataContext = createContext<DataContextProps>({
	userProfile: null,
	refreshData: () => { },
	isLoading: false,
});
