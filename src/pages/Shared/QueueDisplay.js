import React, { Component } from 'react';
import moment from 'moment';
import { FormControl, TextField, Select, InputLabel } from '@material-ui/core/';
import firebase from '../../assets/scripts/firebase';
import { withFirestore } from 'react-firestore';
import { Modal, ModalBody } from 'reactstrap';
import Header from '../../components/Header';

import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import AddIcon from '@material-ui/icons/Add';

var passwordHash = require('password-hash');
require('firebase/auth');

class QueueDisplay extends Component {

    state = {
        activeQueue: '',
        clicked: false
    }

    componentDidMount() {
        // if (localStorage.getItem('role') !== 'admin') {
        //     this.props.history.push('/')
        //     return;
        // }

        const state = this.state;

        let storageInfo = JSON.parse(localStorage.getItem('info')),
            branch = localStorage.getItem('branch');

        this.setState({
            displayName: storageInfo.name
        })

        // if (storageInfo === null || adminInfo === null) {
        //     this.props.history.push('/')
        //     return;
        // }

        this.props.firestore.collection(storageInfo.id).doc(branch).onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();

                this.setState({
                    activeQueue: data.queue
                },
                () => {
                    this.ringStart();
                })
            }
        });

    }

    ringStart = () => {
        const audioEl = document.getElementById("queue-sound")
        audioEl.play();

        this.setState({
            flash: true
        }, () => {
            setTimeout(() => {
                this.setState({
                    flash: false
                })
            }, 5000)
        })
    }

    initiate = () => {
        this.setState({
            clicked: true
        },
        () => {
            this.ringStart();
        })
    }

    render() {
        const state = this.state;

        return (
            <>
                <div className="queue-container" onClick={this.initiate}>
                    <div className={"queue-no " +state.flash}>
                        {state.clicked ? state.activeQueue : state.displayName}
                    </div>
                </div>
                <audio id="queue-sound">
                    <source src={require("../../assets/audio/ring.ogg")} type='audio/ogg; codecs="vorbis"'></source>
                </audio>
            </>
        );
    }
}




export default withFirestore(QueueDisplay);
