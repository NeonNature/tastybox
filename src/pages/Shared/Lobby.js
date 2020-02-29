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
        seatList: [
            {
                seatId: 1,
                free: false
            },
            {
                seatId: 1,
                free: false
            },
            {
                seatId: 1,
                free: false
            },
            {
                seatId: 1,
                free: false
            },
            {
                seatId: 1,
                free: false
            },
            {
                seatId: 1,
                free: false
            },
            {
                seatId: 1,
                free: false
            },
            {
                seatId: 1,
                free: false
            }
        ]
    }

    componentDidMount() {
        this.setState({
            time: {
                month: moment().format('MMM').toUpperCase(),
                year: moment().format('YYYY')
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

    register = () => {
        const state = this.state;

        this.props.firestore
						.collection('/users').doc(state.id)
						.set({
                            id: state.id,
                            email: state.email,
                            password: passwordHash.generate(state.password),
                            name: state.name,
                            country: state.country
						}).then(() => {
                            console.log('test')
						}).catch((err) => console.log(err));
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    toggleInvalidModal = () => {
        const val = this.state.modal_invalid;

        this.setState({
            modal_invalid: !val
        })
    }

    render() {
        const state = this.state;

        return (
            <>
            <Header />
            <div className="lobby-container">
                {
                    state.seatList.map((i, idx) => 
                    <>
                    <div key={idx} className={"lobby-seat " + i.free}>
                        {i.seatId}
                    </div>
                    </>
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
