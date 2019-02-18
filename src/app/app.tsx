/**
* Dream Journal App
*/
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import APP_LOGO_BASE64 from '../img/logo_base64';
//import Modal from 'react-bootstrap/Button';

/*
interface IDream {
	title?: string;
	notes?: string;
	lucidType?: 'dild' | 'mild' | 'wbtb' | 'other';
}
interface IDailyEntry {
	entryDate: string;
	bedTime?: string;
	prepNotes?: string;
	wakeNotes?: string;
	dreamSigns?: Array<string>;
	dreams?: Array<IDream>;
}
*/

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

class AppNavBar extends React.Component {
	constructor(props) {
		super(props);

		// This binding is necessary to make `this` work in the callback
	    this.handleClick = this.handleClick.bind(this);
	}

	handleClick = () => {
  		console.log('doSomething!');
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
					<button type="button" onClick={this.handleClick} className="btn btn-outline-primary mr-2">Load Data File</button>
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
							<img src={APP_LOGO_BASE64} width="75" height="75" className="mr-4" alt="" />Dream Journal
						</h1>
						<p className="lead">Record your daily dream journal entries into well-formatted JSON.</p>
						<hr className="my-4" />
						<p>This enables metrics, keyword searches and much more so you can make the best of your dreams.</p>
						<a className="btn btn-primary btn-lg" href="#" role="button">Get Started</a>
					</div>
					<FormNewEntry />
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

class FormNewEntry extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>
				<h5 className="text-primary">Daily Entry</h5>
				<div className="container bg-light p-3">
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
					<div className="row mb-3">
						<div className="col-12 col-md-6">
							<label className="text-muted text-uppercase text-sm">Prep Notes</label>
							<textarea id="notesPrep" className="form-control" style={{ height:"80px" }}></textarea>
						</div>
						<div className="col-12 col-md-6">
							<label className="text-muted text-uppercase text-sm">Wake Notes</label>
							<textarea id="notesWake" className="form-control" style={{ height:"80px" }}></textarea>
						</div>
					</div>
					<div className="row mb-3">
						<div className="col">
							<label className="text-muted text-uppercase text-sm">Dream(s)</label>
							<div className="row mb-3" data-dreamidx="0">
								<div className="col-auto">
									<h5 className="text-primary">1</h5>
								</div>
								<div className="col">
									<label className="text-muted text-uppercase text-sm">Title</label>
									<input id="title" type="text" className="form-control" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

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

// AppMain
const AppMain: React.SFC<{ compiler: string, framework: string }> = (props) => {
  return (
    <main>
		<AppNavBar />
		<ShowAppTab />
	</main>
  );
}

ReactDOM.render(
  <AppMain compiler="TypeScript" framework="React" />,
  document.getElementById("root")
);
