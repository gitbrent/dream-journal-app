import React from 'react'
import { IDriveFile, ISearchMatch } from './types'
import Alert from 'react-bootstrap/Alert'
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
}

interface ITag {
	title: string
	total: number
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
	componentDidUpdate(_prevProps: any) {
		if (this.props.dataFile && this.props.dataFile.entries && !this.state.isDataLoaded) {
			this.compileTags(this.props.dataFile)
		}
	}

	/* ======================================================================== */

	private compileTags(dataFile: IDriveFile) {
		let tagsAllUnique: ITag[] = []
		;(dataFile.entries || []).forEach(entry => {
			entry.dreams.forEach(dream => {
				dream.dreamSigns.forEach(sign => {
					let thisTag = tagsAllUnique.filter(tag => {
						return tag.title.toLowerCase() === sign.toLowerCase()
					})[0]
					if (thisTag) thisTag.total++
					else tagsAllUnique.push({ title: sign, total: 1 })
				})
			})
		})

		this.setState({
			isDataLoaded: true,
			tagsAllUnique: tagsAllUnique,
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
					.sort((a,b) => { return a.total < b.total ? 1 : -1 })
					.map((tag, idx) => {
					return (
						<div key={idx + tag.title} className='d-inline-block mr-3 mb-3'>
							<div className='d-inline-block bg-dark px-2 py-1 text-light text-lowercase rounded-left'>
								{tag.title}
							</div>
							<div className='d-inline-block bg-info px-2 py-1 text-white rounded-right'>{tag.total}</div>
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
					<div className='card my-5'>
						<div className='card-header bg-primary'>
							<h5 className='card-title text-white mb-0'>Dream Journal Tags</h5>
						</div>
						<div className='card-body bg-light'>
							<this.renderTags />
						</div>
					</div>
				</header>
			</div>
		)
	}
}
