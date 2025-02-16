import { createContext } from "react";
import { IDriveConfFile, IDriveDataFile, IJournalEntry } from "../app/app.types";

interface DataContextProps {
	isLoading: boolean;
	driveConfFile: IDriveConfFile | undefined | null;
	driveDataFile: IDriveDataFile | undefined | null;
	refreshData: () => void;
	getUniqueDreamTags: () => string[];
	doesEntryDateExist: (date: string) => boolean;
	doEntryAdd: (entry: IJournalEntry) => void;
	doEntryEdit: (entry: IJournalEntry, origEntryDate?: IJournalEntry['entryDate']) => void;
	doEntryDelete: (entryDate: IJournalEntry['entryDate']) => void;
}

export const DataContext = createContext<DataContextProps>({
	isLoading: false,
	driveConfFile: null,
	driveDataFile: null,
	refreshData: () => { },
	getUniqueDreamTags: () => [],
	doesEntryDateExist: () => false,
	doEntryAdd: () => { },
	doEntryEdit: () => { },
	doEntryDelete: () => { },
});
