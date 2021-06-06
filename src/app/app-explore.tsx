import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { IDriveDataFile, IJournalDream, IJournalEntry, ISearchMatch, MONTHS, SearchMatchTypes, SearchScopes } from './app.types'
import HeaderMetrics from './components/header-metrics'
import AlertGdriveStatus from './components/alert-gstat'
import ModalEntry from './modal-entry'
import { Box, ChatText, CheckCircle, ExclamationCircle, Eye, Globe, Heart, Image, Lightning, PersonCircle, Smartwatch } from 'react-bootstrap-icons'

/**
 * TODO:
 * - ability to take a tag and chart it over years
 * CHART
 * | ---- | ---- | ---- |
 * | 2010 | 2011 | 2012 |
 * | ---- | ---- | ---- |
 * | Drm1 | drm6 | drm8 |
 * | Drm1 | drm6 | drm8 |
 * | Drm1 |      |      |
 */

export interface ITabStateExplore {
	searchMatches: ISearchMatch[]
	searchOptMatchType: SearchMatchTypes
	searchOptScope: SearchScopes
	searchTerm: string
	searchTermInvalidMsg: string
	showAlert: boolean
}
export interface Props {
	dataFile: IDriveDataFile
	isBusyLoad: boolean
	setTabState: Function
	tabState: ITabStateExplore
}

interface LucidDream {
	entry: IJournalEntry
	lucidDream: IJournalDream
}

export default function TabExplore(props: Props) {
	const [showModal, setShowModal] = useState(false)
	const [currEntry, setCurrEntry] = useState<IJournalEntry>(null)
	const [allLucids, setAllLucids] = useState<LucidDream[]>([])
	const [randLucids, setRandLucids] = useState<LucidDream[]>([])

	useEffect(() => {
		let allLucids: LucidDream[] = []

		if (props.dataFile && props.dataFile.entries && props.dataFile.entries.length > 0) {
			props.dataFile.entries.forEach((entry) => {
				let succDreams = [...entry.dreams.filter((dream) => dream.isLucidDream)]
				succDreams.forEach((dream) => allLucids.push({ entry: entry, lucidDream: dream }))
			})
		}

		setAllLucids(allLucids)
	}, [props.dataFile])

	useEffect(() => {
		if (allLucids && allLucids.length > 0) {
			let randLucids: LucidDream[] = []

			for (let idx = 0; idx < 3; idx++) {
				randLucids.push(allLucids[Math.round(Math.random() * allLucids.length)])
			}

			setRandLucids(randLucids)
		}
	}, [allLucids])

	// -----------------------------------------------------------------------

	function renderTabPrep(): JSX.Element {
		return (
			<section>
				{/*
					<div className='alert alert-secondary mb-4' role='alert'>
						<div className='row align-items-center'>
							<div className='col-auto'>
								<h4 className='mb-0' >
									<CheckCircle size={32} />
								</h4>
							</div>
							<div className='col'>
								<h5 className='mb-0'>GO BRENT! We can do this!</h5>
							</div>
						</div>
					</div>
				*/}
				<div className='row row-cols-12 row-cols-md-3 g-4'>
					<div className='col'>
						<div className='card h-100'>
							<div className='card-header bg-primary text-white'>
								<h5 className='card-title mb-0'>MILD Affirmations</h5>
							</div>
							<div className='card-body bg-black'>
								<ul>
									<li>Tonight I will recognize that I am dreaming</li>
									<li>I want to Lucid Dream. I will find what works for me. You cant stop me!</li>
									<li>Ok, i'm ready, willing and able to have an LD tonight.</li>
									<li>I WILL LUCID DREAM TONIGHT!!!</li>
									<li>If i am outside, then i am dreaming.</li>
									<li>I see clues every single night in my dreams. I will get better at recognizing them as dream symbols.</li>
									<li>My only impediment to success is my brain and my attitude.</li>
									<li>I will continue to practice and refine my ADA (All Day Awareness) technique</li>
									<li>GO BRENT!!! WE CAN DO THIS!!!</li>
								</ul>
							</div>
						</div>
					</div>
					<div className='col'>
						<div className='card h-100'>
							<div className='card-header bg-success text-white'>
								<h5 className='card-title mb-0'>Visualize Success</h5>
							</div>
							<div className='card-body bg-black'>
								<ul>
									<li>Imagine flying through the sky</li>
									<li>Imagine talking to George Carlin</li>
									<li>Try to connect with others</li>
									<li>Nail Sasha Grey</li>
									<li>Have an LD for more than 5 minutes</li>
								</ul>
							</div>
						</div>
					</div>
					<div className='col'>
						<div className='card h-100'>
							<div className='card-header bg-info text-white'>
								<h5 className='card-title mb-0'>Random Lucid Dreams</h5>
							</div>
							<div className='card-body bg-black'>
								{randLucids.map((rand, idx) => (
									<div
										key={`rand${idx}`}
										onClick={(_ev) => {
											setCurrEntry(rand.entry)
											setShowModal(true)
										}}
										className='bg-light p-2 mb-4'>
										<div className='row g-0 align-items-center bg-light'>
											<div className='col-auto px-0'>
												<div
													title={Math.abs(Math.round(moment(rand.entry.entryDate).diff(moment(new Date()), 'months', true))) + ' months ago'}
													className='col cursor-link text-center text-sm user-select-none'
													style={{ minWidth: '65px' }}>
													<div className='bg-danger px-2 py-1 text-white align-text-middle rounded-top'>
														<h6 className='mb-0'>{moment(rand.entry.entryDate).format('YYYY')}</h6>
													</div>
													<div className='bg-white px-2 py-3 rounded-bottom'>
														{MONTHS[Number(moment(rand.entry.entryDate).format('M')) - 1]} {moment(rand.entry.entryDate).format('DD')}
													</div>
												</div>
											</div>
											<div className='col ps-2'>
												<h6 className='mb-0'>{rand.lucidDream.title}</h6>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>
		)
	}

	function renderTabInv(): JSX.Element {
		return (
			<section>
				<div className='row row-cols-1 row-cols-md-2 g-4'>
					<div className='col'>
						<div className='card h-100'>
							<div className='card-header bg-success text-white'>
								<div className='row align-items-middle'>
									<div className='col'>
										<h5 className='card-title mb-0'>AWARENESS</h5>
									</div>
									<div className='col-auto'>
										<Eye size={28} />
									</div>
								</div>
							</div>
							<div className='card-body bg-black'>
								<p className='card-text'>You have a peculiar thought, a strong emotion, feel an unusual sensation, or have altered perceptions.</p>
								<dl className='row'>
									<dt className='col-sm-3'>Thoughts</dt>
									<dd className='col-sm-9'>
										can be things that are unusual, that could occur only in a dream, or that "magically" affects the dream world.
									</dd>

									<dt className='col-sm-3'>Sensations</dt>
									<dd className='col-sm-9'>
										can include the feeling of paralysis, of leaving your body, as well as unusual physical feelings and unexpectedly sudden or intense
										sexual arousal.
									</dd>

									<dt className='col-sm-3'>Perceptions</dt>
									<dd className='col-sm-9'>
										may be unusually clear or fuzzy, or you may be able to see or hear something you wouldn't be able to in waking life.
									</dd>

									<dt className='col-sm-3'>Emotions</dt>
									<dd className='col-sm-9'>can be inappropriate or oddly overwhelming.</dd>
								</dl>

								<hr />

								<h6 className='card-subtitle mt-3 mb-2'>
									<ChatText size={20} className='me-2' />
									Thoughts
								</h6>
								<ul>
									<li>"I'm trying to figure out where the house and furnishings are from, and I realize this is an odd thing to be thinking about."</li>
									<li>"When I thought I didn't want to crash, the car swerved back on the road."</li>
									<li>"When I found the door locked, I 'wished' it open."</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Heart size={20} className='me-2' />
									Emotions
								</h6>
								<ul>
									<li>"I am filled with extreme anxiety and remorse."</li>
									<li>"I was rhapsodized over G."</li>
									<li>"I am so unbelievably angry at my sister that I throw something from her into the sea."</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Lightning size={20} className='me-2' />
									Sensations
								</h6>
								<ul>
									<li>"I seem to lift 'out of body,' am caught in the covers, but shake free."</li>
									<li>"A strong wave of sexual arousal comes over me."</li>
									<li>"It feels like there's a giant hand squeezing my head."</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Eye size={20} className='me-2' />
									Perceptions
								</h6>
								<ul>
									<li>"Somehow I could see perfectly without my glasses."</li>
									<li>"Everything looks as though I have taken LSD."</li>
									<li>"I somehow can hear two men talking even though they are far away."</li>
								</ul>
							</div>
						</div>
					</div>
					<div className='col'>
						<div className='card h-100'>
							<div className='card-header bg-warning text-white'>
								<div className='row align-items-middle'>
									<div className='col'>
										<h5 className='card-title mb-0'>CONTEXT</h5>
									</div>
									<div className='col-auto'>
										<Image size={28} />
									</div>
								</div>
							</div>
							<div className='card-body bg-black'>
								<p className='card-text'>
									The place or situation in the dream is strange. You may be somewhere that you are unlikely to be in wak ing life, or involved in a strange
									social situation.
								</p>
								<p className='card-text'>
									Also, you or another dream character could be playing an unaccustomed role. Objects or characters may be out of place, or the dream could
									occur in the past or future.
								</p>
								<hr />

								<h6 className='card-subtitle mt-3 mb-2'>
									<ChatText size={20} className='me-2' />
									Ego role
								</h6>
								<ul>
									<li>"We're fugitives from the law."</li>
									<li>"I was James Bond in a movie in the starring role."</li>
									<li>"I'm a commando behind enemy lines in World War II."</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<PersonCircle size={20} className='me-2' />
									Character role
								</h6>
								<ul>
									<li>"My friend is assigned to be my husband."</li>
									<li>"My father is behaving like R, my lover."</li>
									<li>"Reagan, Bush, and Nixon are flying jets."</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<PersonCircle size={20} className='me-2' />
									Character place
								</h6>
								<ul>
									<li>"My coworkers and former high school friends are together."</li>
									<li>"Madonna was seated on a chair in my room."</li>
									<li>"My brother, who is dead, was in the kitchen with me."</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Globe size={20} className='me-2' />
									Object place
								</h6>
								<ul>
									<li>"My bed was in the street."</li>
									<li>"There was a phone in my room."</li>
									<li>"The wall had cream cheese and vegetables in it."</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Image size={20} className='me-2' />
									Setting place
								</h6>
								<ul>
									<li>"I'm in a colony on Mars."</li>
									<li>"I'm in an amusement park."</li>
									<li>"I'm on the ocean, by myself, at night."</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Smartwatch size={20} className='me-2' />
									Setting time
								</h6>
								<ul>
									<li>"I am in grade school."</li>
									<li>"I'm at my twenty-fifth high school reunion."</li>
									<li>"I'm with my horse in his prime."</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<ExclamationCircle size={20} className='me-2' />
									Situation
								</h6>
								<ul>
									<li>"I'm in an odd ceremony."</li>
									<li>"A commercial is being filmed at my house."</li>
									<li>"Two mafia families are brought together for talks."</li>
								</ul>
							</div>
						</div>
					</div>
					<div className='col'>
						<div className='card h-100'>
							<div className='card-header bg-info text-white'>
								<div className='row align-items-middle'>
									<div className='col'>
										<h5 className='card-title mb-0'>FORM</h5>
									</div>
									<div className='col-auto'>
										<Box size={28} />
									</div>
								</div>
							</div>
							<div className='card-body bg-black'>
								<p className='card-text'>
									Your shape, the shape of a dream character, or that of a dream object is oddly formed, deformed, or transforms. Unusual clothing and hair
									count as anomalies of form.
								</p>
								<p className='card-text'>Also, the place you are in (the setting) in the dream may be different than it would be in waking life.</p>
								<hr />

								<h6 className='card-subtitle mt-3 mb-2'>
									<ChatText size={20} className='me-2' />
									Ego form
								</h6>
								<ul>
									<li>"I am a man." (dreamed by a woman)</li>
									<li>"I am embodied in a stack of porcelain plates."</li>
									<li>"I am Mozart."</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<PersonCircle size={20} className='me-2' />
									Character form
								</h6>
								<ul>
									<li>"Her face changes as I look at her."</li>
									<li>"A creature with a giant head walks by."</li>
									<li>"Contrary to reality, G's hair is cut short."</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Image size={20} className='me-2' />
									Setting form
								</h6>
								<ul>
									<li>"The edge of the beach is like a pier with benches."</li>
									<li>"The drafting room was the wrong shape."</li>
									<li>"I get lost because the streets are not as I remember them."</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Box size={20} className='me-2' />
									Object form
								</h6>
								<ul>
									<li>"I see a tiny purple kitten."</li>
									<li>"One of the purses transforms completely."</li>
									<li>"My car keys read Toyama instead of Toyota."</li>
								</ul>
							</div>
						</div>
					</div>
					<div className='col'>
						<div className='card h-100'>
							<div className='card-header bg-danger text-white'>
								<div className='row align-items-middle'>
									<div className='col'>
										<h5 className='card-title mb-0'>ACTION</h5>
									</div>
									<div className='col-auto'>
										<ExclamationCircle size={28} />
									</div>
								</div>
							</div>
							<div className='card-body bg-black'>
								<p className='card-text'>
									You, another dream character, or a dream thing (including inanimate objects and animals) do something unusual or impossible in waking life.
								</p>
								<p className='card-text'>The action must occur in the dream environment, that is, not be a thought or feel ing in the dreamer's mind.</p>
								<p className='card-text'>Malfunctioning devices are examples of object action dreamsigns.</p>
								<hr />

								<h6 className='card-subtitle mt-3 mb-2'>
									<ChatText size={20} className='me-2' />
									Ego action
								</h6>
								<ul>
									<li>"I'm riding home on a unicycle."</li>
									<li>"I was underwater, yet I was breathing."</li>
									<li>"Doing pull-ups got easier and easier."</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<PersonCircle size={20} className='me-2' />
									Character action
								</h6>
								<ul>
									<li>"The staff throws slime worms at the audience."</li>
									<li>"D kisses me passionately in front of his wife."</li>
									<li>"The hairdresser refers to a blueprint to cut my hair."</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Box size={20} className='me-2' />
									Object action
								</h6>
								<ul>
									<li>"The bologna lights up."</li>
									<li>"A large flashlight floats past."</li>
									<li>"The car accelerates dangerously, and the brakes don't work."</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
				{/*
					<figcaption className='blockquote-footer mt-3'>
						Stephen LaBerge in <cite title='Source Title'>Exploring the World of Lucid Dreaming</cite>
					</figcaption>
				*/}
			</section>
		)
	}

	function renderTabGoals(): JSX.Element {
		return (
			<section>
				<h5 className='text-primary'>TODO:WIP:</h5>

				<div className='mt-4'>
					<div className='row row-cols-12 row-cols-md-2 g-4'>
						<div className='card h-100'>
							<div className='card-header bg-success text-white'>
								<h5 className='card-title mb-0'>GOALS</h5>
							</div>
							<div className='card-body bg-black'>
								<ul>
									<li>I will continue to practice and refine my ADA (All Day Awareness) technique</li>
									<li>Return to my training construct (giant parking lot and UNIT HQ bldg) for more skill training!!!</li>
									<li>Have more LD's</li>
									<li>Find my dream guide: Stabilize an LD, then ask, "Can I See My Dream Guide?"</li>
									<li>Try to connect with others</li>
									<li>Nail Sasha Grey</li>
									<li>Have an LD for more than 5 minutes</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>
		)
	}

	return !props.dataFile || !props.dataFile.entries ? (
		<AlertGdriveStatus isBusyLoad={props.isBusyLoad} />
	) : (
		<main className='container my-auto my-md-5'>
			<header>
				<ModalEntry currEntry={currEntry} showModal={showModal} setShowModal={setShowModal} />
				<HeaderMetrics dataFile={props.dataFile} isBusyLoad={props.isBusyLoad} showStats={true} />
			</header>

			<ul className='nav nav-tabs nav-fill' id='exploreTab' role='tablist'>
				<li className='nav-item' role='presentation'>
					<a className='nav-link active' id='1-tab' data-toggle='tab' href='#tab1' role='tab' aria-controls='tab1' aria-selected='true'>
						Bedtime Prep
					</a>
				</li>
				<li className='nav-item' role='presentation'>
					<a className='nav-link' id='2-tab' data-toggle='tab' href='#tab2' role='tab' aria-controls='tab2' aria-selected='false'>
						My Goals
					</a>
				</li>
				<li className='nav-item' role='presentation'>
					<a className='nav-link' id='3-tab' data-toggle='tab' href='#tab3' role='tab' aria-controls='tab3' aria-selected='false'>
						Dreamsign Inventory
					</a>
				</li>
			</ul>
			<div className='tab-content' id='bsTabContent'>
				<div className='tab-pane bg-light p-4 show active' id='tab1' role='tabpanel' aria-labelledby='1-tab'>
					{renderTabPrep()}
				</div>
				<div className='tab-pane bg-light p-4' id='tab2' role='tabpanel' aria-labelledby='2-tab'>
					{renderTabGoals()}
				</div>
				<div className='tab-pane bg-light p-4' id='tab3' role='tabpanel' aria-labelledby='3-tab'>
					{renderTabInv()}
				</div>
			</div>
		</main>
	)
}
