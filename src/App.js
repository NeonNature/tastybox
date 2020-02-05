import React, { Component } from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/assets/styles/scss/styles.scss';

import Home from './pages/Common/Home';

class App extends Component {
	render() {
		return (
			// <HashRouter history={piwik.connectToHistory(history)}>
			<BrowserRouter>
				<Switch>
					<Route path="/" exact component={Home} />
				</Switch>
			</BrowserRouter>
		);
	}
}

export default App;