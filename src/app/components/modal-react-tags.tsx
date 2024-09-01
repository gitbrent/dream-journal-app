/**
 * @see https://github.com/i-like-robots/react-tag-autocomplete/blob/HEAD/migration-guide.md
 */
import { useCallback } from 'react'
import { IJournalEntry } from '../app.types'
import { ReactTags, TagSuggestion } from 'react-tag-autocomplete'

interface Props {
	currEntry: IJournalEntry
	setCurrEntry: (entry: IJournalEntry) => void
	dreamIdx: number
	uniqueTags: string[]
}

export default function ModalReactTags({ currEntry, setCurrEntry, dreamIdx, uniqueTags }: Props) {
	const onAdd = useCallback(
		(newTag: TagSuggestion) => {
			// Update the currEntry state with the new tag
			const newState = { ...currEntry }
			newState.dreams[dreamIdx].dreamSigns?.push(newTag.label)
			setCurrEntry(newState)
		},
		[currEntry, dreamIdx, setCurrEntry]
	);

	const onDelete = useCallback(
		(index: number) => {
			const newState = { ...currEntry }
			newState.dreams[dreamIdx].dreamSigns?.splice(index, 1)
			setCurrEntry(newState)
		},
		[currEntry, dreamIdx, setCurrEntry]
	);

	return (
		<ReactTags
			ariaDescribedBy="custom-validity-description"
			ariaErrorMessage="error"
			id="modal-react-tags"
			labelText="Select dream tags"
			allowNew={true}
			allowBackspace={false}
			selected={
				currEntry.dreams[dreamIdx].dreamSigns?.sort().map((sign) => ({ value: sign, label: sign })) as TagSuggestion[]
			}
			suggestions={
				uniqueTags.map((sign) => ({ value: sign, label: sign })) as TagSuggestion[]
			}
			onAdd={onAdd}
			onDelete={onDelete}
		/>
	)
}
