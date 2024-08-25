import { ISearchMatch, SearchScopes, SearchMatchTypes, MetaType, IJournalEntry } from '../app.types'
import { DateTime } from 'luxon'

interface Props {
	setCurrEntry: (entry: IJournalEntry) => void
	setDreamIdx: (index: number) => void
	setShowModal: (show: boolean) => void
	searchMatch: ISearchMatch
	searchTerm?: string
	searchOptMatchType?: SearchMatchTypes
	searchOptScope: SearchScopes
}

export default function SearchResults(props: Props) {
	const dateEntry = DateTime.fromISO(props.searchMatch?.entry.entryDate)

	/**
	 * @see: https://stackoverflow.com/questions/29652862/highlight-text-using-reactjs
	 */
	function getHighlightedText(text: string, highlight: string) {
		// Split on highlight term and include term into parts, ignore case
		//let parts = text.split(new RegExp(`(${highlight})`, 'gi'));
		let parts: string[] = []
		try {
			if (props.searchOptMatchType === SearchMatchTypes.contains) parts = text.split(new RegExp('(' + highlight + ')', 'gi'))
			else if (props.searchOptMatchType === SearchMatchTypes.whole) parts = text.split(new RegExp('\\b(' + highlight + ')\\b', 'gi'))
			else if (props.searchOptMatchType === SearchMatchTypes.starts) parts = text.split(new RegExp('\\b(' + highlight + ')', 'gi'))
		} catch (ex) {
			//setState({ searchTermInvalidMsg: ex }) // TODO: FIXME: cannot set state bc were called inside `render()` !!
			console.warn(ex)
		}
		return (
			<span>
				{parts.map((part, i) => (
					<span key={i} className={part.toLowerCase() === highlight.toLowerCase() ? 'badge bg-warning' : ''}>
						{part}
					</span>
				))}
			</span>
		)
	}

	return (
		props.searchMatch?.entry ?
			<div key={`searchResultCard${props.searchMatch.entry.entryDate}`} className='col'>
				<div className='card'>
					<div className={`card-header p-3 ${props.searchMatch.entry.dreams[props.searchMatch.dreamIdx].isLucidDream ? 'bg-success' : 'bg-black-90'}`}>
						<div className='row g-0 align-items-center'>
							<div className='col-auto'>
								<div
									className='text-center'
									style={{ cursor: 'help', userSelect: 'none' }}
									title={Math.abs(Math.round(dateEntry.diff(DateTime.now(), 'months').months)) + ' months ago'}>
									<div className='bg-danger p-2 rounded-top text-white h5 mb-0'>{dateEntry.toFormat('yyyy')}</div>
									<div className='bg-white px-2 py-1 rounded-bottom text-sm text-muted mb-0'>{dateEntry.toFormat('LLL dd')}</div>
								</div>
							</div>
							<div className='col mx-3'>
								<h5 className='mb-0'>
									<a
										href='#!'
										title='View Entry'
										className={props.searchMatch.entry.dreams[props.searchMatch.dreamIdx].isLucidDream ? 'card-link text-white' : 'card-link'}
										onClick={() => {
											props.setCurrEntry(props.searchMatch.entry)
											props.setDreamIdx(props.searchMatch.dreamIdx || -1)
											props.setShowModal(true)
										}}>
										{props.searchMatch.entry.dreams[props.searchMatch.dreamIdx].title}
									</a>
								</h5>
							</div>
							<div className='col-auto'>
								{props.searchMatch.entry.dreams.filter((dream) => dream.dreamSigns?.some((tag) => tag === MetaType.star)).length > 0 && (
									<div className='iconSvg size24 star-on' />
								)}
							</div>
						</div>
					</div>
					{(props.searchOptScope === SearchScopes.all || props.searchOptScope === SearchScopes.signs) && (
						<div className='card-footer bg-black p-3'>
							<div className='row row-cols-auto g-2'>
								{props.searchMatch.entry.dreams[props.searchMatch.dreamIdx].dreamSigns &&
									Array.isArray(props.searchMatch.entry.dreams[props.searchMatch.dreamIdx].dreamSigns)
									? props.searchMatch.entry.dreams[props.searchMatch.dreamIdx].dreamSigns?.map((sign, idx) => {
										return (
											<div className='col' key={`${sign}${idx}`}>
												<div className='badge bg-info text-lowercase p-2'>{sign}</div>
											</div>
										)
									})
									: ''}
							</div>
						</div>
					)}
					{(props.searchOptScope === SearchScopes.all || props.searchOptScope === SearchScopes.notes) && (
						<div className='card-body bg-black'>
							<p className='card-text' style={{ whiteSpace: 'pre-line' }}>
								{props.searchTerm
									? getHighlightedText(props.searchMatch.entry.dreams[props.searchMatch.dreamIdx].notes || '', props.searchTerm)
									: props.searchMatch.entry.dreams[props.searchMatch.dreamIdx].notes}
							</p>
						</div>
					)}
				</div>
			</div>
			:
			<div>(loading...?)</div>
	)
}
