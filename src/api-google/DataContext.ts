import { createContext } from "react";

interface DataContextProps {
	refreshData: () => void;
	isLoading: boolean;
}

export const DataContext = createContext<DataContextProps>({
	refreshData: () => { },
	isLoading: false,
});
