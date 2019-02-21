/*\
|*|  :: Dream Journey ::
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

// TODO: https://github.com/FortAwesome/react-fontawesome

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import APP_LOGO_BASE64 from '../img/logo_base64';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

interface IDream {
	dreamTitle: string;
	dreamDetails?: string;
	lucidType?: 'dild' | 'mild' | 'wbtb' | 'other';
}
interface IDailyEntry {
	entryDate: Date;
	bedTime?: Date;
	notesPrep?: string;
	notesWake?: string;
	dreamSigns?: Array<string>;
	dreams?: Array<IDream>;
}

var dreamsJson = null;
try {
	dreamsJson = require('../data/dreams.json');
}
catch(ex) {
	console.log('FYI: Unable to open `dreams.json` data file. (probably okay is this is first run)');
	console.log(ex);
}

// TODO: https://reactjs.org/docs/forms.html
// FYI: https://stackoverflow.com/questions/24502898/show-or-hide-element-in-react

class AppNavBar extends React.Component<{ onChange?: Function }> {
	constructor(props: Readonly<{ onChange?: Function; }>) {
		super(props);
	}

	changeHandler = (e) => {
        if (typeof this.props.onChange === 'function') {
			//this.props.onChange(e.target.value);
			//this.props.onChange('TAB1');
            this.props.onChange(true);
        }
    }

	render() {
		return (
			<nav className="navbar navbar-expand-lg navbar-light bg-light">
				<a className="navbar-brand" href="#">
					<img src={APP_LOGO_BASE64} width="30" height="30" className="d-inline-block align-top mr-3" alt="" />
					Dream Journal App
				</a>
				<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
					<span className="navbar-toggler-icon"></span>
				</button>
				<div className="collapse navbar-collapse" id="navbarNav">
					<ul className="navbar-nav">
						<li className="nav-item active">
							<a className="nav-link" href="#Home">Home <span className="sr-only">(current)</span></a>
						</li>
						<li className="nav-item">
							<a className="nav-link" href="#Search">Search Dreams</a>
						</li>
						<li className="nav-item">
							<a className="nav-link" href="#Add">Add New Dreams</a>
						</li>
					</ul>
				</div>
				<form className="form-inline mb-0">
					<button type="button" onClick={this.changeHandler} className="btn btn-outline-primary mr-2">Load Data File</button>
					<button className="btn btn-outline-success" type="button" disabled>Save Data File</button>
				</form>
			</nav>
		);
	}
}

class TabHome extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		if ( !dreamsJson ) {
			return (
				<div className="container mt-5">
					<div className="jumbotron">
						<h1 className="display-4 text-primary mb-3">
							<img src={APP_LOGO_BASE64} width="150" height="150" className="mr-4" alt="Logo" />Dream Journal App
						</h1>
						<p className="lead">Record your daily dream journal entries into well-formatted JSON.</p>
						<hr className="my-4" />
						<p>This enables metrics, keyword searches and much more so you can make the best of your dreams.</p>
						<a className="btn btn-primary btn-lg" href="#" role="button">Get Started</a>
					</div>
				</div>
			);
		}
		else {
			return (
				<h1>You Are a Dream God!</h1>
			)
		}
	}
}

class TabSearch extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="row align-items-end justify-content-between">
				<div className="col-auto">
					<h1 className="text-primary">Dream Journal App</h1>
				</div>
				<div className="col-auto">
					<h6 id="appVer" className="text-black-50 font-weight-light"></h6>
				</div>
			</div>
		);
	}
}

class AppModal extends React.Component<{ show?: boolean }, { show: boolean }> {
	private dreams: [{}];

	constructor(props: Readonly<{ show?: boolean; }>) {
		super(props);

		this.state = {
			show: props.show
		};
	}

	// React-Design: Allow `props` changes from other Components to change state/render
	componentWillReceiveProps(nextProps) {
		const newName = nextProps.show;
		if ( this.state.show !== newName ) {
			this.setState({ show:newName });
		}
	}

	// TODO: handle "new dream row" button click
	changeHandler = (e) => {
		console.log('click!');
		// TODO: (here): 1-add node to dreams, 2-render()

		// for `return` below
		/*
		<div className="blocks_loop">
          {this.props.dreams.map(block => (
            <div className="block" />
          ))}
        </div>
		*/
	}

	render() {
		let modalClose = () => {
			this.setState({ show: false });
		}

		return (
			<Modal size="lg" show={ this.state.show } onHide={ modalClose } >
			  <Modal.Header className="bg-primary" closeButton>
			  	<Modal.Title className="text-white">Journal Entry</Modal.Title>
			  </Modal.Header>

			  <Modal.Body className="bg-light">
				  <div className="container mb-3">
					  <div className="row mb-3">
						  <div className="col-12 col-md-6">
							  <label className="text-muted text-uppercase text-sm">Entry Date</label>
							  <input id="entryDate" type="date" className="form-control w-50" />
						  </div>
						  <div className="col-12 col-md-6">
							  <label className="text-muted text-uppercase text-sm">Bed Time</label>
							  <input id="bedTime" type="time" className="form-control w-50" />
						  </div>
					  </div>
					  <div className="row">
						  <div className="col-12 col-md-6">
							  <label className="text-muted text-uppercase text-sm">Prep Notes</label>
							  <textarea id="notesPrep" className="form-control" style={{ height:"80px" }}></textarea>
						  </div>
						  <div className="col-12 col-md-6">
							  <label className="text-muted text-uppercase text-sm">Wake Notes</label>
							  <textarea id="notesWake" className="form-control" style={{ height:"80px" }}></textarea>
						  </div>
					  </div>
				  </div>

				  <div className="container">
				  	<h5 className="text-primary">Dream(s)</h5>
/* start loop over `dreams` */
					  <div className="row">
						  <div className="col">
							  <label className="text-black-50 text-sm">Add new dreams as needed</label>
							  <div className="row mb-3" data-dreamidx="0">
								  <div className="col-auto">
								  	<button className="btn btn-sm btn-outline-info" onClick={this.changeHandler}>Add</button>
								  </div>
								  <div className="col">
									  <label className="text-muted text-uppercase text-sm">Title</label>
									  <input id="title" type="text" className="form-control" />
								  </div>
							  </div>
						  </div>
					  </div>
/* end loop */
				  </div>
			  </Modal.Body>

			  <Modal.Footer>
			    <Button variant="secondary" className="px-4 mr-2" onClick={modalClose}>Close</Button>
			    <Button variant="primary" className="w-25">Submit</Button>
			  </Modal.Footer>
	        </Modal>
		);
	}
}

// TODO: move to Component and accept a PROP for which tab to show!!!
function ShowAppTab() {
	if ( window.location.href.toLowerCase().indexOf('#search') > -1 ) {
		return <TabSearch />;
	}
	else if ( window.location.href.toLowerCase().indexOf('#new') > -1 ) {
		//return <TabNew />;
	}
	else {
		return <TabHome />;
	}
}

// APP UI
class AppUI extends React.Component<{}, { showModal: boolean }> {
	constructor(props) {
		super(props);

		this.state = {
			showModal: props.showModal || false
		};
	}

    chgShowModal = (value) => {
		this.setState({
			showModal: value
		});
    }

    render() {
		console.log("MAIN-RENDER: this.state.showModal = "+ this.state.showModal);
		return (
			<main>
				<AppNavBar onChange={this.chgShowModal} />
				<ShowAppTab />
				<AppModal show={this.state.showModal} />
			</main>
		);
	}
}

// AppMain
const AppMain: React.SFC<{ compiler: string, framework: string }> = (props) => {
	return (<AppUI />);
}

ReactDOM.render(
	<AppMain compiler="TypeScript" framework="React" />,
	document.getElementById("root")
);
