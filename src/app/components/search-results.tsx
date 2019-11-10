import React from 'react'
import { ISearchMatch, SearchScopes, SearchMatchTypes } from '../types'
import moment from 'moment'

export interface ISearchResultsProps {
	handleEntryEdit: Function
	searchMatches: ISearchMatch[]
	searchOptMatchType: SearchMatchTypes
	searchOptScope: SearchScopes
	searchTerm: string
}
export interface ISearchResultsState {}

export default class SearchResults extends React.Component<ISearchResultsProps, ISearchResultsState> {
	constructor(props: Readonly<ISearchResultsProps>) {
		super(props)
	}

	/**
	 * @see: https://stackoverflow.com/questions/29652862/highlight-text-using-reactjs
	 */
	getHighlightedText(text: string, highlight: string) {
		// Split on highlight term and include term into parts, ignore case
		//let parts = text.split(new RegExp(`(${highlight})`, 'gi'));
		let parts = []
		try {
			if (this.props.searchOptMatchType === SearchMatchTypes.contains)
				parts = text.split(new RegExp('(' + highlight + ')', 'gi'))
			else if (this.props.searchOptMatchType === SearchMatchTypes.whole)
				parts = text.split(new RegExp('\\b(' + highlight + ')\\b', 'gi'))
			else if (this.props.searchOptMatchType === SearchMatchTypes.starts)
				parts = text.split(new RegExp('\\b(' + highlight + ')', 'gi'))
		} catch (ex) {
			//this.setState({ searchTermInvalidMsg: ex }) // TODO: FIXME: cannot set state bc were called inside `render()` !!
			console.warn(ex)
		}
		return (
			<span>
				{' '}
				{parts.map((part, i) => (
					<span
						key={i}
						className={part.toLowerCase() === highlight.toLowerCase() ? 'badge badge-warning' : ''}>
						{part}
					</span>
				))}{' '}
			</span>
		)
	}

	public render() {
		return (
			<div>
				{this.props.searchMatches.map((entry, idx) => {
					return (
						<div className='card' key={'searchResultCard' + idx}>
							<div className='row'>
								<div className='col'>
									<h5 className='card-header'>
										<a
											href='javascript:void(0)'
											title='View Entry'
											className={'card-link' + (entry.dream.isLucidDream ? ' text-success' : '')}
											onClick={() => this.props.handleEntryEdit(entry.entryDate)}>
											{entry.dream.title}
										</a>
									</h5>
								</div>
								<div className='col-auto'>
									{entry.starred && <div className='iconSvg size16 star-on mt-2 mx-2' />}
									{entry.dream.isLucidDream && (
										<div className='iconSvg size24 circle check mt-2 mx-2' />
									)}
								</div>
							</div>
							{(this.props.searchOptScope === SearchScopes.all ||
								this.props.searchOptScope === SearchScopes.notes) && (
								<div className='card-body'>
									<p className='card-text' style={{ whiteSpace: 'pre-line' }}>
										{this.getHighlightedText(entry.dream.notes, this.props.searchTerm)}
									</p>
								</div>
							)}
							<div className='card-footer text-info'>
								{(this.props.searchOptScope === SearchScopes.all ||
									this.props.searchOptScope === SearchScopes.signs) && (
									<div>
										{entry.dream.dreamSigns && Array.isArray(entry.dream.dreamSigns)
											? entry.dream.dreamSigns.map((sign, idx) => {
													return (
														<div
															className='badge badge-info text-lowercase p-2 mr-2 mb-2'
															key={'sign' + idx}>
															{sign}
														</div>
													)
											  })
											: ''}
									</div>
								)}
								<small>
									{new Date(entry.entryDate).toLocaleDateString()}
									<span className='ml-2'>
										(
										{Math.abs(
											Math.round(moment(entry.entryDate).diff(moment(new Date()), 'months', true))
										)}{' '}
										months ago)
									</span>
								</small>
							</div>
						</div>
					)
				})}
			</div>
		)
	}
}
