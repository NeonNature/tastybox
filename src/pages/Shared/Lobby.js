import React, { Component } from 'react';
import moment from 'moment';
import {FormControl, TextField, Select, InputLabel } from '@material-ui/core/';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import firebase from '../../assets/scripts/firebase';
import { withFirestore } from 'react-firestore';
import { Modal, ModalBody } from "reactstrap";
import Header from '../../components/Header';

var passwordHash = require('password-hash');
require('firebase/auth');

class Lobby extends Component {

    state = {
        id: '',
        email: '',
        password: '',
        confirm: '',
        name: '',
        country : '',
        
        modal_invalid: false,
        error: '',
        seatList: []
    }

    componentDidMount() {
        // if (localStorage.getItem('role') !== 'admin') {
        //     this.props.history.push('/')
        //     return;
        // }

        const state = this.state;

        let storageInfo = JSON.parse(localStorage.getItem('info')),
            serviceType = localStorage.getItem('serviceType');

        if (storageInfo === null) {
            this.props.history.push('/')
            return;
        }

        this.props.firestore.collection(storageInfo.id).doc('branch_'+ this.props.match.params.id).onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();

                this.setState({
                    seatList: data.seatList
                })
            }
        });
    }

    navigate = (url) => {
        this.props.history.push(url)
    }

    togglePassword = () => {
        this.setState({
            showPassword: !this.state.showPassword
        })
    };

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    toggleInvalidModal = () => {
        const val = this.state.modal_invalid;

        this.setState({
            modal_invalid: !val
        })
    }

    toggleSeat = (seatId, isOccupied) => {
        let seatList = [];
        let storageInfo = JSON.parse(localStorage.getItem('info'));

        this.state.seatList.map((i) => {
            if (i.seatId === seatId) {
                seatList.push({
                    seatId: i.seatId,
                    isOccupied: !isOccupied
                })
            }
            else {
                seatList.push(i)
            }
        })

        this.props.firestore
            .collection(storageInfo.id).doc('branch_' + this.props.match.params.id)
            .set({
                seatList
            }, {merge: true}).catch((e) => {
                this.setState({
                    error: 'An error has encountered! Please retry later!'
                });
                this.toggleInvalidModal();
                console.log(e);
            });
       
    }

    render() {
        const state = this.state;

        return (
            <>
            <Header activeRoute="Lobby"/>
            <div className="lobby-container">
                {
                    state.seatList.map((i, idx) => 
                    <div key={idx} className={ true ? "lobby-seat clickable " + !i.isOccupied : "lobby-seat " + !i.isOccupied } onClick={true ? () => this.toggleSeat(i.seatId, i.isOccupied) : null}>
                        {i.seatId}
                    </div>
                    )
                }
            </div>


            <Modal
                    backdropClassName={"shared-modal-backdrop"}
                    centered
                    isOpen={state.modal_invalid}
                    toggle={this.toggleInvalidModal}
                    className="shared-modal-container shared-modal-wrap"
                >
                    <ModalBody>
                        <div className="shared-modal-close" onClick={this.toggleInvalidModal}>
                            <span>&#10005;</span>
                        </div>
                        <div className="shared-modal-content">
                            <p>{state.error}</p>
                            <div className="shared-modal-btn-wrap">
                            <div
                                className="shared-modal-btn-main"
                                onClick={this.toggleInvalidModal}
                            >
                                Confirm
                            </div>
                            {/* <div
                                className="shared-modal-btn-secondary"
                                onClick={this.toggleInvalidModal}
                            >
                                Cancel
                            </div> */}
                        </div>
                        </div>
                    </ModalBody>
                </Modal>
            </>
        );
    }
}




export default withFirestore(Lobby);
