import React from 'react'
import { IDriveFile, ISearchMatch, TagDisplayOptions, SearchScopes } from './app.types'
import Alert from 'react-bootstrap/Alert'
import SearchResults from './components/search-results'
//import SearchResults from './components/search-results'

export interface IAppTagsProps {
	dataFile: IDriveFile
	doSaveTagsState: Function
	onShowModal: Function
	tagsState: IAppTagsState
}
export interface IAppTagsState {
	isDataLoaded: boolean
	searchMatches: ISearchMatch[]
	showAlert: boolean
	tagsAllUnique: ITag[]
	totalDreams: number
	optionDisplay: SearchScopes
	optionScope: TagDisplayOptions
}

interface ITag {
	title: string
	dreams: ISearchMatch[]
}

export default class TabSearch extends React.Component<IAppTagsProps, IAppTagsState> {
	constructor(props: Readonly<IAppTagsProps>) {
		super(props)

		let localShowAlert = JSON.parse(localStorage.getItem('show-alert-search'))

		this.state = {
			isDataLoaded: false,
			searchMatches:
				this.props.tagsState && this.props.tagsState['searchMatches']
					? this.props.tagsState['searchMatches']
					: [],
			showAlert: typeof localShowAlert === 'boolean' ? localShowAlert : true,
			tagsAllUnique: [],
			totalDreams: 0,
			optionDisplay: SearchScopes.all,
			optionScope: TagDisplayOptions.all,
		}
	}

	/**
	 * this constructor is called whenever tab is hidden/shown, so state must be preserved by parent (lifting state up)
	 */
	componentWillUnmount = () => {
		this.props.doSaveTagsState(this.state)
	}

	/**
	 * Detect prop (data) changes, then re-render file list
	 */
	componentDidUpdate(prevProps: any) {
		if (this.props.dataFile && this.props.dataFile.entries && !this.state.isDataLoaded) {
			this.compileTags(this.props.dataFile)
		} else if (
			this.props.dataFile &&
			prevProps.dataFile &&
			this.props.dataFile.modifiedTime !== prevProps.dataFile.modifiedTime
		) {
			// TODO: this doesnt catch when data file is updated!
			console.log('REFRESH!')
			this.compileTags(this.props.dataFile)
		}
	}

	/* ======================================================================== */

	// TODO: convert this to a render func - its not refreshing correctly!
	private compileTags(dataFile: IDriveFile) {
		let tagsAllUnique: ITag[] = []
		;(dataFile.entries || []).forEach(entry => {
			entry.dreams.forEach(dream => {
				dream.dreamSigns.forEach(sign => {
					let thisTag = tagsAllUnique.filter(tag => {
						return tag.title.toLowerCase() === sign.toLowerCase()
					})[0]

					let searchDream = {
						entryDate: entry.entryDate,
						starred: entry.starred,
						dream: dream,
					}

					if (thisTag) thisTag.dreams.push(searchDream)
					else tagsAllUnique.push({ title: sign, dreams: [searchDream] })
				})
			})
		})

		let totalDreams = 0
		if (this.props.dataFile && this.props.dataFile.entries) {
			this.props.dataFile.entries.forEach(entry => {
				totalDreams += entry.dreams.length
			})
		}

		this.setState({
			isDataLoaded: true,
			tagsAllUnique: tagsAllUnique,
			totalDreams: totalDreams,
		})
	}

	/* ======================================================================== */

	handleHideAlert = () => {
		localStorage.setItem('show-alert-search', 'false')
		this.setState({ showAlert: false })
	}

	handleEntryEdit = (entryDate: string) => {
		this.props.onShowModal({
			show: true,
			editEntry: this.props.dataFile.entries.filter(entry => {
				return entry.entryDate === entryDate
			})[0],
		})
	}

	/* ======================================================================== */

	renderTags = (): JSX.Element => {
		return (
			<section>
				{this.state.tagsAllUnique
					.sort((a, b) => {
						return a.dreams.length < b.dreams.length
							? 1
							: a.dreams.length > b.dreams.length
							? -1
							: a.title > b.title
							? 1
							: -1
						//return a.dreams.length > b.dreams.length ? 1 : -1 || a.title > b.title ? 1 : -1
					})
					.filter((tag, idx) => {
						if (this.state.optionScope === TagDisplayOptions.all) return true
						else if (this.state.optionScope === TagDisplayOptions.top30 && idx < 30) return true
						else if (this.state.optionScope === TagDisplayOptions.singles && tag.dreams.length === 1)
							return true
					})
					.map((tag, idx) => {
						return (
							<div
								key={idx + tag.title}
								className='d-inline-block mr-3 mb-3'
								onClick={() => {
									this.setState({ searchMatches: tag.dreams })
								}}
								style={{ cursor: 'pointer', userSelect: 'none' }}>
								<div className='d-inline-block bg-dark px-2 py-1 text-light text-lowercase rounded-left'>
									{tag.title}
								</div>
								<div className='d-inline-block bg-info px-2 py-1 text-white rounded-right'>
									{tag.dreams.length}
								</div>
							</div>
						)
					})}
			</section>
		)
	}

	render() {
		return (
			<div>
				{this.state.showAlert && (
					<Alert variant='secondary'>
						<Alert.Heading>Make good use of your Dream Journal</Alert.Heading>
						<p>
							Analyze your journal to learn more about yourself, spot common themes/dreamsigns and improve
							your lucid dreaming ability.
						</p>
						<ul>
							<li>How many lucid dreams have you had?</li>
							<li>What are your common dream signs?</li>
							<li>How many times have you dreamed about school?</li>
						</ul>
						<p>Let's find out!</p>
						<hr />
						<div className='d-flex justify-content-end'>
							<button className='btn btn-light' onClick={this.handleHideAlert}>
								Dismiss
							</button>
						</div>
					</Alert>
				)}

				<header className='container my-5'>
					<div className='row'>
						<div className='col-12 col-lg-8'>
							<div className='card'>
								<div className='card-header bg-primary'>
									<h5 className='card-title text-white mb-0'>Dream Journal Tags</h5>
								</div>
								<div className='card-body bg-light'>
									<div className='row align-items-center'>
										<div className='col text-center'>
											<label className='text-primary text-uppercase'>Days</label>
											<h1 className='text-primary mb-1'>
												{this.props.dataFile && this.props.dataFile.entries
													? this.props.dataFile.entries.length
													: '-'}
											</h1>
										</div>
										<div className='col text-center'>
											<label className='text-primary text-uppercase'>Dreams</label>
											<h1 className='text-primary mb-1'>{this.state.totalDreams || '-'}</h1>
										</div>
										<div className='col text-center'>
											<label className='text-info text-uppercase'>DreamSigns</label>
											<h1 className='text-info mb-0'>{this.state.tagsAllUnique.length || '-'}</h1>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className='col-12 col-lg-4'>
							<div className='card h-100'>
								<div className='card-header bg-secondary'>
									<h5 className='card-title text-white mb-0'>Search Options</h5>
								</div>
								<div className='card-body bg-light'>
									<div className='row align-items-center'>
										<div className='col-12 col-md-6'>
											<label className='text-uppercase text-muted'>Scope</label>
											<select
												className='form-control mt-2'
												defaultValue={TagDisplayOptions.all}
												onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
													this.setState({
														optionScope:
															event.currentTarget.value === 'all'
																? TagDisplayOptions.all
																: event.currentTarget.value === 'top30'
																? TagDisplayOptions.top30
																: event.currentTarget.value === 'singles'
																? TagDisplayOptions.singles
																: TagDisplayOptions.all,
													})
												}}>
												<option value='all'>All</option>
												<option value='top30'>Top 30</option>
												<option value='singles'>Singles</option>
											</select>
										</div>
										<div className='col-12 col-md-6'>
											<label className='text-uppercase text-muted'>Display</label>
											<select
												className='form-control mt-2'
												defaultValue={SearchScopes.all}
												onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
													this.setState({
														optionDisplay:
															event.currentTarget.value === 'all'
																? SearchScopes.all
																: SearchScopes.signs,
													})
												}}>
												<option value='all'>Complete Dream</option>
												<option value='signs'>No Dream Notes</option>
											</select>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</header>

				<section className='container my-5'>
					<div className='card my-5'>
						<div className='card-header bg-info'>
							<h5 className='card-title text-white mb-0'>DreamSign Tags</h5>
						</div>
						<div className='card-body bg-light p-4'>
							<this.renderTags />

							{!this.props.dataFile && (
								<div className='text-center'>
									<h5 className='text-secondary'>(no Dream Journal is currently selected)</h5>
								</div>
							)}

							{this.props.dataFile && !this.state.isDataLoaded && (
								<div className='align-middle text-center text-warning mb-4'>
									<div className='spinner-border spinner-border-sm mr-2' role='status'>
										<span className='sr-only' />
									</div>
									Saving/Loading...
								</div>
							)}
						</div>
					</div>
				</section>

				{this.state.searchMatches && this.state.searchMatches.length > 0 && (
					<SearchResults
						handleEntryEdit={this.handleEntryEdit}
						searchMatches={this.state.searchMatches}
						searchOptScope={this.state.optionDisplay}
						totalDreams={this.state.totalDreams}
					/>
				)}
			</div>
		)
	}
}
