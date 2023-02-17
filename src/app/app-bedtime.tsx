/*
 *  :: Brain Cloud Dream Journal ::
 *
 *  Dream Journal App - Record and Search Daily Dream Entries
 *  https://github.com/gitbrent/dream-journal-app
 *
 *  This library is released under the MIT Public License (MIT)
 *
 *  Dream Journal App (C) 2019-present Brent Ely (https://github.com/gitbrent)
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

import React, { useState, useEffect, useMemo } from 'react'
import { IConfMetaCats, IDriveConfFile, IDriveDataFile, IJournalEntry, ISearchMatch, SearchScopes } from './app.types'
import {
	ArrowDown,
	ArrowUp,
	Box,
	BrightnessHighFill,
	ChatText,
	ExclamationCircle,
	Eye,
	Globe,
	Heart,
	HeartFill,
	Image,
	Lightning,
	LightningFill,
	PersonCircle,
	PlusSquare,
	Save,
	ShieldFillCheck,
	Smartwatch,
	StarFill,
	Translate,
	Trash,
} from 'react-bootstrap-icons'
import HeaderMetrics from './components/header-metrics'
import AlertGdriveStatus from './components/alert-gstat'
import SearchResults from './components/search-results'
import ModalEntry from './modal-entry'
import { appdata } from './appdata'
//import LocalAdminBrent from './z.admin.local'

export interface Props {
	appdataSvc: appdata
	confFile?: IDriveConfFile
	dataFile?: IDriveDataFile
	isBusyLoad: boolean
}

export default function TabBedtime(props: Props) {
	const isBusySave = false
	//const [isBusySave, setIsBusySave] = useState(false)
	const [showModal, setShowModal] = useState(false)
	const [currEntry, setCurrEntry] = useState<IJournalEntry>()
	const [currDreamIdx, setCurrDreamIdx] = useState(0)
	const [lucidGoals, setLucidGoals] = useState<IConfMetaCats[]>()

	useEffect(() => {
		if (props?.confFile?.lucidGoals) setLucidGoals(props.confFile.lucidGoals)
	}, [props.confFile])

	const allLucids = useMemo(() => {
		const allLucids: ISearchMatch[] = []

		if (props.dataFile && props.dataFile.entries && props.dataFile.entries.length > 0) {
			props.dataFile.entries.forEach((entry) => {
				entry.dreams.forEach((dream, idx) => {
					if (dream.isLucidDream) allLucids.push({ entry: entry, dreamIdx: idx })
				})
			})
		}

		return allLucids
	}, [props.dataFile])

	const randLucids = useMemo(() => {
		if (allLucids && allLucids.length > 0) {
			const randLucids: ISearchMatch[] = []

			for (let idx = 0; idx < 3; idx++) {
				randLucids.push(allLucids[Math.round(Math.random() * allLucids.length)])
			}

			return randLucids
		}
	}, [allLucids])

	const randDreams = useMemo(() => {
		const tempDreams: ISearchMatch[] = []
		const randDreams: ISearchMatch[] = []

		if (props.dataFile && props.dataFile.entries && props.dataFile.entries.length > 0) {
			props.dataFile.entries.forEach((entry) => {
				entry.dreams.forEach((dream, idx) => {
					if (!dream.isLucidDream) tempDreams.push({ entry: entry, dreamIdx: idx })
				})
			})
		}

		for (let idx = 0; idx < 3; idx++) {
			randDreams.push(tempDreams[Math.round(Math.random() * tempDreams.length)])
		}

		return randDreams
	}, [props.dataFile])

	// -----------------------------------------------------------------------

	function renderTabMild(): JSX.Element {
		return (
			<section>
				<div className='card h-100'>
					<div className='card-header bg-primary h5 text-white'>Affirmations</div>
					<div className='card-body bg-black p-4'>
						<div className='row row-cols-2 g-4'>
							{props.confFile?.mildAffirs.map((item, idx) => (
								<div className='col' key={`goalTitle${idx}`}>
									<h5 className='text-primary text-uppercase'>{item.title}</h5>
									<ul className='mb-0'>
										{item.bullets.map((item, idy) => (
											<li key={`goalBullet${idx}${idy}`}>{item}</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>
		)
	}

	function renderTabRandom(): JSX.Element {
		return (
			<section>
				<div className='row row-cols-1 row-cols-md-2 g-4'>
					<div className='col'>
						<div className='card h-100'>
							<div className='card-header bg-primary h5 text-white'>Random Dreams</div>
							<div className='card-body bg-black p-4'>
								<div className='row row-cols-1 g-4'>
									{randDreams.map((match, idx) => (
										<SearchResults
											key={`dream${idx}`}
											setCurrEntry={(entry: IJournalEntry) => setCurrEntry(entry)}
											setDreamIdx={(index: number) => setCurrDreamIdx(index)}
											setShowModal={(show: boolean) => setShowModal(show)}
											searchMatch={match}
											searchOptScope={SearchScopes.title}
										/>
									))}
								</div>
							</div>
						</div>
					</div>
					<div className='col'>
						<div className='card h-100'>
							<div className='card-header bg-success h5 text-white'>Random Lucid Dreams</div>
							<div className='card-body bg-black p-4'>
								<div className='row row-cols-1 g-4'>
									{randLucids?.map((match, idx) => (
										<SearchResults
											key={`random${idx}`}
											setCurrEntry={(entry: IJournalEntry) => setCurrEntry(entry)}
											setDreamIdx={(index: number) => setCurrDreamIdx(index)}
											setShowModal={(show: boolean) => setShowModal(show)}
											searchMatch={match}
											searchOptScope={SearchScopes.title}
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		)
	}

	function renderTabGoals(): JSX.Element {
		const arrIcons: JSX.Element[] = [
			<LightningFill key='icon1' size={20} className='me-2' />,
			<ShieldFillCheck key='icon2' size={20} className='me-2' />,
			<StarFill key='icon3' size={20} className='me-2' />,
			<BrightnessHighFill key='icon4' size={20} className='me-2' />,
			<HeartFill key='icon5' size={20} className='me-2' />,
			<Translate key='icon6' size={20} className='me-2' />,
		]

		return (
			<section>
				<div className='row row-cols-1 g-4 mb-4'>
					<div className='col'>
						<div className='card h-100'>
							<div className='card-header bg-success h5 text-white'>Visualize Success</div>
							<div className='card-body bg-black p-4'>
								<div className='row row-cols-1 row-cols-md-3 g-4'>
									{props.confFile?.dreamIdeas.map((item, idx) => (
										<section key={`ideaTitle${idx}`} className='col'>
											<h6 className={`card-subtitle mb-2 ${item.headClass}`}>
												{arrIcons[idx]}
												{item.title}
											</h6>
											<ul>
												{item.bullets.map((bull, idy) => (
													<li key={`ideaBullet${idx}${idy}`}>{bull}</li>
												))}
											</ul>
										</section>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>

				{lucidGoals && lucidGoals[0]?.bullets?.map((item, idx) => (
					<div key={`goal${idx}`} className='row g-2 align-items-center mb-3'>
						<div className='col-auto'>
							<div className='btn-group border' role='group'>
								<button
									type='button'
									className='btn btn-light py-1'
									disabled={isBusySave || idx === 0}
									title='move up'
									aria-label='move up'
									onClick={() => {
										const chgItem = [...lucidGoals][0]
										chgItem?.bullets.splice(idx - 1, 0, chgItem.bullets.splice(idx, 1)[0])
										setLucidGoals([chgItem])
									}}>
									<ArrowUp />
								</button>
								<button
									type='button'
									className='btn btn-light py-1'
									disabled={isBusySave || idx === lucidGoals[0]?.bullets.length - 1}
									title='move down'
									aria-label='move down'
									onClick={() => {
										const chgItem = [...lucidGoals][0]
										chgItem?.bullets.splice(idx - 1, 0, chgItem.bullets.splice(idx, 1)[0])
										setLucidGoals([chgItem])
									}}>
									<ArrowDown />
								</button>
							</div>
						</div>
						<div className='col'>
							<input
								type='text'
								disabled={isBusySave}
								value={item}
								onChange={() => {
									const chgItem = [...lucidGoals][0]
									chgItem?.bullets.splice(idx - 1, 0, chgItem.bullets.splice(idx, 1)[0])
									setLucidGoals([chgItem])
								}}
								className='form-control'
							/>
						</div>
						<div className='col-auto'>
							<div className='btn-group border' role='group'>
								<button
									type='button'
									className='btn btn-light py-1'
									disabled={isBusySave}
									title='delete goal'
									aria-label='delete goal'
									onClick={() => {
										if (confirm(`Delete Goal ${idx + 1}?`)) {
											const chgItem = [...lucidGoals][0]
											chgItem?.bullets.splice(idx, 1)
											setLucidGoals([chgItem])
										}
									}}>
									<Trash />
								</button>
							</div>
						</div>
					</div>
				))}

				<div className='row justify-content-center mb-0'>
					<div className='col-auto text-center'>
						<button
							className='btn btn-primary'
							title='Add Goal'
							onClick={() => {
								const chgItem = typeof lucidGoals !== 'undefined' ? [...lucidGoals][0] : null
								if (chgItem) {
									chgItem.bullets.push('')
									setLucidGoals([chgItem])
								}
							}}>
							<PlusSquare size='16' className='me-2' />
							Add
						</button>
					</div>
					<div className='col-auto text-center'>
						<button
							className='btn btn-success'
							title='Save Goals'
							onClick={async () => {
								console.log('TODO: GSI')
								/*
								setIsBusySave(true)
								GDrive.doEditConf_LucidGoals(lucidGoals)
								await GDrive.doSaveConfFile()
								setIsBusySave(false)
								*/
							}}>
							<Save size='16' className='me-2' />
							Save
						</button>
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
										can be things that are unusual, that could occur only in a dream, or that &quot;magically&quot; affects the dream world.
									</dd>

									<dt className='col-sm-3'>Sensations</dt>
									<dd className='col-sm-9'>
										can include the feeling of paralysis, of leaving your body, as well as unusual physical feelings and unexpectedly sudden or intense
										sexual arousal.
									</dd>

									<dt className='col-sm-3'>Perceptions</dt>
									<dd className='col-sm-9'>
										may be unusually clear or fuzzy, or you may be able to see or hear something you wouldn&apos;t be able to in waking life.
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
									<li>&quot;I&apos;m trying to figure out where the house and furnishings are from, and I realize this is an odd thing to be thinking about.&quot;</li>
									<li>&quot;When I thought I didn&apos;t want to crash, the car swerved back on the road.&quot;</li>
									<li>&quot;When I found the door locked, I &apos;wished&apos; it open.&quot;</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Heart size={20} className='me-2' />
									Emotions
								</h6>
								<ul>
									<li>&quot;I am filled with extreme anxiety and remorse.&quot;</li>
									<li>&quot;I was rhapsodized over G.&quot;</li>
									<li>&quot;I am so unbelievably angry at my sister that I throw something from her into the sea.&quot;</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Lightning size={20} className='me-2' />
									Sensations
								</h6>
								<ul>
									<li>&quot;I seem to lift &apos;out of body,&apos; am caught in the covers, but shake free.&quot;</li>
									<li>&quot;A strong wave of sexual arousal comes over me.&quot;</li>
									<li>&quot;It feels like there&apos;s a giant hand squeezing my head.&quot;</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Eye size={20} className='me-2' />
									Perceptions
								</h6>
								<ul>
									<li>&quot;Somehow I could see perfectly without my glasses.&quot;</li>
									<li>&quot;Everything looks as though I have taken LSD.&quot;</li>
									<li>&quot;I somehow can hear two men talking even though they are far away.&quot;</li>
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
									<li>&quot;We&apos;re fugitives from the law.&quot;</li>
									<li>&quot;I was James Bond in a movie in the starring role.&quot;</li>
									<li>&quot;I am a commando behind enemy lines in World War II.&quot;</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<PersonCircle size={20} className='me-2' />
									Character role
								</h6>
								<ul>
									<li>&quot;My friend is assigned to be my husband.&quot;</li>
									<li>&quot;My father is behaving like R, my lover.&quot;</li>
									<li>&quot;Reagan, Bush, and Nixon are flying jets.&quot;</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<PersonCircle size={20} className='me-2' />
									Character place
								</h6>
								<ul>
									<li>&quot;My coworkers and former high school friends are together.&quot;</li>
									<li>&quot;Madonna was seated on a chair in my room.&quot;</li>
									<li>&quot;My brother, who is dead, was in the kitchen with me.&quot;</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Globe size={20} className='me-2' />
									Object place
								</h6>
								<ul>
									<li>&quot;My bed was in the street.&quot;</li>
									<li>&quot;There was a phone in my room.&quot;</li>
									<li>&quot;The wall had cream cheese and vegetables in it.&quot;</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Image size={20} className='me-2' />
									Setting place
								</h6>
								<ul>
									<li>&quot;I&apos;m in a colony on Mars.&quot;</li>
									<li>&quot;I&apos;m in an amusement park.&quot;</li>
									<li>&quot;I&apos;m on the ocean, by myself, at night.&quot;</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Smartwatch size={20} className='me-2' />
									Setting time
								</h6>
								<ul>
									<li>&quot;I&apos;m in grade school.&quot;</li>
									<li>&quot;I&apos;m at my twenty-fifth high school reunion.&quot;</li>
									<li>&quot;I&apos;m with my horse in his prime.&quot;</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<ExclamationCircle size={20} className='me-2' />
									Situation
								</h6>
								<ul>
									<li>&quot;I&apos;m in an odd ceremony.&quot;</li>
									<li>&quot;A commercial is being filmed at my house.&quot;</li>
									<li>&quot;Two mafia families are brought together for talks.&quot;</li>
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
									<li>&quot;I am a man.&quot; (dreamed by a woman)</li>
									<li>&quot;I am embodied in a stack of porcelain plates.&quot;</li>
									<li>&quot;I am Mozart.&quot;</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<PersonCircle size={20} className='me-2' />
									Character form
								</h6>
								<ul>
									<li>&quot;Her face changes as I look at her.&quot;</li>
									<li>&quot;A creature with a giant head walks by.&quot;</li>
									<li>&quot;Contrary to reality, G&apos;s hair is cut short.&quot;</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Image size={20} className='me-2' />
									Setting form
								</h6>
								<ul>
									<li>&quot;The edge of the beach is like a pier with benches.&quot;</li>
									<li>&quot;The drafting room was the wrong shape.&quot;</li>
									<li>&quot;I get lost because the streets are not as I remember them.&quot;</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Box size={20} className='me-2' />
									Object form
								</h6>
								<ul>
									<li>&quot;I see a tiny purple kitten.&quot;</li>
									<li>&quot;One of the purses transforms completely.&quot;</li>
									<li>&quot;My car keys read Toyama instead of Toyota.&quot;</li>
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
								<p className='card-text'>The action must occur in the dream environment, that is, not be a thought or feel ing in the dreamer&apos;s mind.</p>
								<p className='card-text'>Malfunctioning devices are examples of object action dreamsigns.</p>
								<hr />

								<h6 className='card-subtitle mt-3 mb-2'>
									<ChatText size={20} className='me-2' />
									Ego action
								</h6>
								<ul>
									<li>&quot;I&apos;m riding home on a unicycle.&quot;</li>
									<li>&quot;I was underwater, yet I was breathing.&quot;</li>
									<li>&quot;Doing pull-ups got easier and easier.&quot;</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<PersonCircle size={20} className='me-2' />
									Character action
								</h6>
								<ul>
									<li>&quot;The staff throws slime worms at the audience.&quot;</li>
									<li>&quot;D kisses me passionately in front of his wife.&quot;</li>
									<li>&quot;The hairdresser refers to a blueprint to cut my hair.&quot;</li>
								</ul>

								<h6 className='card-subtitle mt-3 mb-2'>
									<Box size={20} className='me-2' />
									Object action
								</h6>
								<ul>
									<li>&quot;The bologna lights up.&quot;</li>
									<li>&quot;A large flashlight floats past.&quot;</li>
									<li>&quot;The car accelerates dangerously, and the brakes don&apos;t work.&quot;</li>
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

	return !props.dataFile || !props.dataFile.entries ? (
		<AlertGdriveStatus isBusyLoad={props.isBusyLoad} />
	) : (
		<main className='container my-auto my-md-5'>
			<header>
				<ModalEntry currEntry={currEntry} currDreamIdx={currDreamIdx} showModal={showModal} setShowModal={setShowModal} appdataSvc={props.appdataSvc} />
				<HeaderMetrics dataFile={props.dataFile} isBusyLoad={props.isBusyLoad} showStats={true} />
			</header>
			{/*<LocalAdminBrent confFile={props.confFile} />*/}
			<ul className='nav nav-tabs nav-fill' id='bedtimeTab' role='tablist'>
				<li className='nav-item' role='presentation'>
					<button
						className='nav-link active'
						id='bedNavMild'
						data-bs-toggle='tab'
						data-bs-target='#bedTabMild'
						type='button'
						role='tab'
						aria-controls='bedTabMild'
						aria-selected='true'>
						MILD
					</button>
				</li>
				<li className='nav-item' role='presentation'>
					<button
						className='nav-link'
						id='bedNavRandom'
						data-bs-toggle='tab'
						data-bs-target='#bedTabRandom'
						type='button'
						role='tab'
						aria-controls='bedTabRandom'
						aria-selected='false'>
						Random Dreams
					</button>
				</li>
				<li className='nav-item' role='presentation'>
					<button
						className='nav-link'
						id='bedNavGoals'
						data-bs-toggle='tab'
						data-bs-target='#bedTabGoals'
						type='button'
						role='tab'
						aria-controls='bedTabGoals'
						aria-selected='false'>
						My Goals
					</button>
				</li>
				<li className='nav-item' role='presentation'>
					<button
						className='nav-link'
						id='bedNavSigns'
						data-bs-toggle='tab'
						data-bs-target='#bedTabSigns'
						type='button'
						role='tab'
						aria-controls='bedTabSigns'
						aria-selected='false'>
						Dreamsign Inventory
					</button>
				</li>
			</ul>
			<div className='tab-content'>
				<div className='tab-pane bg-light p-4 active' id='bedTabMild' role='tabpanel' aria-labelledby='bedNavMild'>
					{renderTabMild()}
				</div>
				<div className='tab-pane bg-light p-4' id='bedTabRandom' role='tabpanel' aria-labelledby='bedNavRandom'>
					{renderTabRandom()}
				</div>
				<div className='tab-pane bg-light p-4' id='bedTabGoals' role='tabpanel' aria-labelledby='bedNavGoals'>
					{renderTabGoals()}
				</div>
				<div className='tab-pane bg-light p-4' id='bedTabSigns' role='tabpanel' aria-labelledby='bedNavSigns'>
					{renderTabInv()}
				</div>
			</div>
		</main>
	)
}
