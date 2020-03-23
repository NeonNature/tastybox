import React, { Component } from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/assets/styles/scss/styles.scss';

import Home from './pages/Unique/Home';
import Register from './pages/Unique/Register';
import Lobby from './pages/Shared/Lobby';
import Order from './pages/Shared/Order';

import AdminConfig from './pages/Unique/AdminConfig';
import QueueDisplay from './pages/Shared/QueueDisplay';
import Branch from './pages/Unique/Branch';
import ManageBranch from './pages/Unique/ManageBranch';

import Recipe from './pages/Unique/Recipe';
import Record from './pages/Unique/Record';
import Account from './pages/Unique/Account';

class App extends Component {
	render() {
		return (
			// <HashRouter history={piwik.connectToHistory(history)}>
			<BrowserRouter>
				<Switch>
					<Route path="/" exact component={Home} />
					<Route path="/register" exact component={Register} />

					<Route path="/lobby/:id" exact component={Lobby} />
					<Route path="/order/:id" exact component={Order} />

					
					<Route path="/config" exact component={AdminConfig} />
					<Route path="/branch" exact component={Branch} />
					<Route path="/branch/:id" exact component={ManageBranch} />

					<Route path="/order/:id" exact component={Order} />

					<Route path="/queue/:id" exact component={QueueDisplay} />

					<Route path="/menu/:id" exact component={Recipe} />
					<Route path="/record/:id" exact component={Record} />
					<Route path="/account/:id" exact component={Account} />

				</Switch>
			</BrowserRouter>
		);
	}
}

export default App;