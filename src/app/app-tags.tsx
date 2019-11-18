/*\
|*|  :: Brain Cloud Dream Journal ::
|*|
|*|  Dream Journal App - Record and Search Daily Dream Entries
|*|  https://github.com/gitbrent/dream-journal-app
|*|
|*|  This library is released under the MIT Public License (MIT)
|*|
|*|  Dream Journal App (C) 2019-present Brent Ely (https://github.com/gitbrent)
|*|
|*|  Permission is hereby granted, free of charge, to any person obtaining a copy
|*|  of this software and associated documentation files (the "Software"), to deal
|*|  in the Software without restriction, including without limitation the rights
|*|  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
|*|  copies of the Software, and to permit persons to whom the Software is
|*|  furnished to do so, subject to the following conditions:
|*|
|*|  The above copyright notice and this permission notice shall be included in all
|*|  copies or substantial portions of the Software.
|*|
|*|  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
|*|  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
|*|  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
|*|  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
|*|  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
|*|  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
|*|  SOFTWARE.
\*/

import React from 'react'
import { IDriveFile, ISearchMatch, SearchScopes, TagDisplayOptions } from './app.types'
import Alert from 'react-bootstrap/Alert'
import SearchResults from './components/search-results'

export interface IAppTagsProps {
	dataFile: IDriveFile
	doSaveTagsState: Function
	onShowModal: Function
	tagsState: IAppTagsState
}
export interface IAppTagsState {
	dataFileModDate: string
	searchMatches: ISearchMatch[]
	selectedTagTitle: string
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
			dataFileModDate:
				this.props.dataFile && this.props.dataFile.modifiedTime ? this.props.dataFile.modifiedTime : '',
			searchMatches: [],
			selectedTagTitle:
				this.props.tagsState && this.props.tagsState.selectedTagTitle
					? this.props.tagsState.selectedTagTitle
					: '',
			showAlert: typeof localShowAlert === 'boolean' ? localShowAlert : true,
			tagsAllUnique: [],
			totalDreams: 0,
			optionDisplay:
				this.props.tagsState && this.props.tagsState.optionDisplay
					? this.props.tagsState.optionDisplay
					: SearchScopes.all,
			optionScope:
				this.props.tagsState && this.props.tagsState.optionScope
					? this.props.tagsState.optionScope
					: TagDisplayOptions.all,
		}
	}

	/**
	 * this constructor is called whenever tab is hidden/shown, so state must be preserved by parent (lifting state up)
	 */
	componentWillUnmount = () => {
		this.props.doSaveTagsState(this.state)
	}

	/**
	 * Detect prop (data) changes, to trigger re-render
	 */
	componentDidUpdate(prevProps: any) {
		if (
			this.props.dataFile &&
			prevProps.dataFile &&
			this.props.dataFile.modifiedTime !== prevProps.dataFile.modifiedTime
		) {
			this.setState({
				dataFileModDate: this.props.dataFile.modifiedTime,
			})
		}
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

	compileTagPiles = () => {
		let tagsAllUnique: ITag[] = []
		;(this.props.dataFile && this.props.dataFile.entries ? this.props.dataFile.entries : []).forEach(entry => {
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

		// Handle tag deselect/reselect (we save term but not matches) (b/c when dreams are editted, we dont want to show old data on screen)
		if (this.state.selectedTagTitle && this.state.searchMatches.length === 0) {
			this.setState({
				searchMatches: tagsAllUnique.filter(tag => {
					return tag.title === this.state.selectedTagTitle
				})[0].dreams,
			})
		}

		return tagsAllUnique
	}

	renderTags = (): JSX.Element => {
		let tagsAllUnique = this.compileTagPiles()

		return (
			<section>
				{tagsAllUnique
					.sort((a, b) => {
						return a.dreams.length < b.dreams.length
							? 1
							: a.dreams.length > b.dreams.length
							? -1
							: a.title > b.title
							? 1
							: -1
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
									this.setState({
										searchMatches: tag.dreams,
										selectedTagTitle: tag.title,
									})
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
		let totalDreams = 0
		let totalDays = 0
		if (this.props.dataFile && this.props.dataFile.entries) {
			this.props.dataFile.entries.forEach(entry => {
				totalDreams += entry.dreams.length
			})
			totalDays = this.props.dataFile.entries.length
		}

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
									<h5 className='card-title text-white mb-0'>Dream Journal Analysis</h5>
								</div>
								<div className='card-body bg-light'>
									<div className='row align-items-center'>
										<div className='col text-center'>
											<label className='text-primary text-uppercase'>Dreams</label>
											<h1 className='text-primary mb-1'>{totalDreams}</h1>
										</div>
										<div className='col text-center'>
											<label className='text-primary text-uppercase'>Days</label>
											<h1 className='text-primary mb-1'>{totalDays}</h1>
										</div>
										<div className='col text-center'>
											<label className='text-info text-uppercase'>DreamSigns</label>
											<h1 className='text-info mb-0'>{this.state.tagsAllUnique.length || '0'}</h1>
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
										<div className='col-12 col-md-5'>
											<label className='text-uppercase text-muted'>Scope</label>
											<select
												className='form-control mt-2'
												value={this.state.optionScope}
												onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
													this.setState({
														optionScope:
															event.currentTarget.value === TagDisplayOptions.all
																? TagDisplayOptions.all
																: event.currentTarget.value === TagDisplayOptions.top30
																? TagDisplayOptions.top30
																: event.currentTarget.value ===
																  TagDisplayOptions.singles
																? TagDisplayOptions.singles
																: TagDisplayOptions.all,
													})
												}}>
												<option value='All'>All</option>
												<option value='Top 30'>Top 30</option>
												<option value='Singles'>Singles</option>
											</select>
										</div>
										<div className='col-12 col-md-7'>
											<label className='text-uppercase text-muted'>Display</label>
											<select
												className='form-control mt-2'
												defaultValue={this.state.optionDisplay}
												onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
													this.setState({
														optionDisplay:
															event.currentTarget.value === SearchScopes.all
																? SearchScopes.all
																: SearchScopes.signs,
													})
												}}>
												<option value='All Fields'>Complete Dream</option>
												<option value='Dream Signs'>No Dream Notes</option>
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
						</div>
					</div>
				</section>

				{this.state.searchMatches && this.state.searchMatches.length > 0 && (
					<SearchResults
						handleEntryEdit={this.handleEntryEdit}
						searchMatches={this.state.searchMatches}
						searchOptScope={this.state.optionDisplay}
						totalDreams={totalDreams}
					/>
				)}
			</div>
		)
	}
}
