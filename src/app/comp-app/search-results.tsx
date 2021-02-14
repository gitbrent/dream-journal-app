import React from 'react'
import moment from 'moment'
import { ISearchMatch, SearchScopes, SearchMatchTypes, MONTHS } from '../app.types'

interface Props {
	setCurrEntry: Function
	setShowModal: Function
	searchMatch: ISearchMatch
	searchTerm?: string
	searchOptMatchType?: SearchMatchTypes
	searchOptScope: SearchScopes
}
export interface ISearchResultsState {}

export default function SearchResults(props: Props) {
	/**
	 * @see: https://stackoverflow.com/questions/29652862/highlight-text-using-reactjs
	 */
	function getHighlightedText(text: string, highlight: string) {
		// Split on highlight term and include term into parts, ignore case
		//let parts = text.split(new RegExp(`(${highlight})`, 'gi'));
		let parts = []
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
					<span key={i} className={part.toLowerCase() === highlight.toLowerCase() ? 'badge badge-warning' : ''}>
						{part}
					</span>
				))}
			</span>
		)
	}

	return (
		<div key={`searchResultCard${props.searchMatch.entry.entryDate}`} className='card mb-4'>
			<div className={props.searchMatch.entry.dreams[props.searchMatch.dreamIdx].isLucidDream ? 'card-header bg-success' : 'card-header bg-light'}>
				<div className='row no-gutters'>
					<div className='col-auto'>
						<div
							className='text-center'
							style={{ cursor: 'help', userSelect: 'none' }}
							title={Math.abs(Math.round(moment(props.searchMatch.entry.entryDate).diff(moment(new Date()), 'months', true))) + ' months ago'}>
							<div className='bg-danger px-2 pb-1 text-white rounded-top'>{moment(props.searchMatch.entry.entryDate).format('YYYY')}</div>
							<div className='bg-white px-2 py-1 rounded-bottom'>
								<h6 className='mb-0'>{MONTHS[Number(moment(props.searchMatch.entry.entryDate).format('M')) - 1]}</h6>
							</div>
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
									props.setShowModal(true)
								}}>
								{props.searchMatch.entry.dreams[props.searchMatch.dreamIdx].title}
							</a>
						</h5>
					</div>
					<div className='col-auto'>{props.searchMatch.entry.starred && <div className='iconSvg size24 star-on' />}</div>
				</div>
			</div>
			{(props.searchOptScope === SearchScopes.all || props.searchOptScope === SearchScopes.notes) && (
				<div className='card-body bg-black'>
					<p className='card-text' style={{ whiteSpace: 'pre-line' }}>
						{props.searchTerm ? getHighlightedText(props.searchMatch.entry.dreams[props.searchMatch.dreamIdx].notes, props.searchTerm) : props.searchMatch.entry.dreams[props.searchMatch.dreamIdx].notes}
					</p>
				</div>
			)}
			<div className='card-footer bg-black'>
				{(props.searchOptScope === SearchScopes.all || props.searchOptScope === SearchScopes.signs) && (
					<div>
						{props.searchMatch.entry.dreams[props.searchMatch.dreamIdx].dreamSigns && Array.isArray(props.searchMatch.entry.dreams[props.searchMatch.dreamIdx].dreamSigns)
							? props.searchMatch.entry.dreams[props.searchMatch.dreamIdx].dreamSigns.map((sign, idx) => {
									return (
										<div className='badge badge-info text-lowercase p-2 mr-2 mb-2' key={'sign' + idx}>
											{sign}
										</div>
									)
							  })
							: ''}
					</div>
				)}
			</div>
		</div>
	)
}
