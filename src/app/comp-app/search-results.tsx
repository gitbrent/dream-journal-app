import React from 'react'
import { ISearchMatch, SearchScopes, SearchMatchTypes, MONTHS } from '../app.types'
import moment from 'moment'

export interface ISearchResultsProps {
	handleEntryEdit: Function
	searchMatches: ISearchMatch[]
	searchOptMatchType?: SearchMatchTypes
	searchOptScope: SearchScopes
	searchTerm?: string
	totalDreams: number
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
				{parts.map((part, i) => (
					<span
						key={i}
						className={part.toLowerCase() === highlight.toLowerCase() ? 'badge badge-warning' : ''}>
						{part}
					</span>
				))}
			</span>
		)
	}

	public render() {
		return (
			<main className='container my-5'>
				<h3 className='text-center text-primary pt-0 pb-3 mb-3'>
					Search Results: {this.props.searchMatches.length} Dreams (
					{((this.props.searchMatches.length / this.props.totalDreams) * 100).toFixed(1)}%)
				</h3>

				<div className='card-columns'>
					{this.props.searchMatches.map((entry, idx) => {
						return (
							<div className='card mb-4' key={'searchResultCard' + idx}>
								<div
									className={
										entry.dream.isLucidDream ? 'card-header bg-success' : 'card-header bg-light'
									}>
									<div className='row no-gutters'>
										<div className='col-auto'>
											<div
												className='text-center'
												style={{ cursor: 'help', userSelect: 'none' }}
												title={
													Math.abs(
														Math.round(
															moment(entry.entryDate).diff(
																moment(new Date()),
																'months',
																true
															)
														)
													) + ' months ago'
												}>
												<div className='bg-danger px-2 pb-1 text-white rounded-top'>
													{new Date(entry.entryDate).getFullYear()}
												</div>
												<div className='bg-white px-2 py-1 rounded-bottom'>
													<h5 className='mb-0'>{MONTHS[new Date(entry.entryDate).getMonth()]}</h5>
												</div>
											</div>
										</div>
										<div className='col mx-3'>
											<h5 className='mb-0'>
												<a
													href='#!'
													title='View Entry'
													className={
														entry.dream.isLucidDream ? 'card-link text-white' : 'card-link'
													}
													onClick={() => this.props.handleEntryEdit(entry.entryDate)}>
													{entry.dream.title}
												</a>
											</h5>
										</div>
										<div className='col-auto'>
											{entry.starred && <div className='iconSvg size24 star-on' />}
										</div>
									</div>
								</div>
								{(this.props.searchOptScope === SearchScopes.all ||
									this.props.searchOptScope === SearchScopes.notes) && (
									<div className='card-body bg-black'>
										<p className='card-text' style={{ whiteSpace: 'pre-line' }}>
											{this.props.searchTerm
												? this.getHighlightedText(entry.dream.notes, this.props.searchTerm)
												: entry.dream.notes}
										</p>
									</div>
								)}
								<div className='card-footer bg-black'>
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
								</div>
							</div>
						)
					})}
				</div>
			</main>
		)
	}
}
