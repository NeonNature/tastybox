import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './assets/scripts/serviceWorker';
import { FirestoreProvider } from 'react-firestore';
import firebase from './assets/scripts/firebase';

ReactDOM.render(
        <FirestoreProvider firebase={firebase}>
            <App />
        </FirestoreProvider>,
 document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
