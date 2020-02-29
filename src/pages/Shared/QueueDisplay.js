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
        activeQueue: ''
    }

    componentDidMount() {
        this.setState({
            activeQueue: 1
        })

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

    render() {
        const state = this.state;

        return (
            <>
                <div className="queue-container" onClick={this.ringStart}>
                    <div className={"queue-no " +state.flash}>
                        {state.activeQueue}
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
