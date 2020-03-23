import React, { Component } from 'react';
import moment from 'moment';
import { FormControl, TextField, Select, InputLabel } from '@material-ui/core/';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { withFirestore } from 'react-firestore';
import { Modal, ModalBody } from "reactstrap";
import { O2A } from 'object-to-array-convert';
var passwordHash = require('password-hash');

class Home extends Component {

    state = {
        id: '',
        email: '',
        password: '',
        role: 'admin',
        username: '',
        branch: '',

        error: '',
        modal_invalid: false,
        modal_success: false
    }

    componentDidMount() {
    }

    toggleInvalidModal = () => {
        const val = this.state.modal_invalid;

        this.setState({
            modal_invalid: !val
        })
    }

    toggleSuccessModal = () => {
        const val = this.state.modal_success;

        this.setState({
            modal_success: !val
        })
    }

    navigate = (url) => {
        this.props.history.push(url)
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    login = () => {
        const state = this.state;

        if (state.role === "admin") {
            if (
                !state.id ||
                !state.email ||
                !state.password
            ) {
                this.setState({
                    error: 'Please fill all the fields!'
                });
                this.toggleInvalidModal();
                return;
            }

            this.props.firestore
                .collection(state.id).doc('admin')
                .get()
                .then((res) => {
                    if (res.exists) {
                        const data = res.data();

                        if (
                            (data.email !== state.email) ||
                            !(passwordHash.verify(state.password, data.password))
                        ) {
                            this.setState({
                                error: 'Invalid Credentials! Please retry again!'
                            });
                            this.toggleInvalidModal();
                            return;
                        }
                        else {
                            this.props.firestore
                                .collection(state.id).doc('info')
                                .get()
                                .then((res2) => {
                                    const data2 = res2.data();

                                    localStorage.setItem('admin', JSON.stringify(data));
                                    localStorage.setItem('info', JSON.stringify(data2));
                                    localStorage.setItem('role', 'admin');

                                    this.toggleSuccessModal();
                            });
                        }
                    }
                    else {
                        this.setState({
                            error: 'Account does not exist! Please ensure all fields are correct!'
                        });
                        this.toggleInvalidModal();
                    }
                });
        }
        else {
            if (
                !state.id ||
                !state.branch ||
                !state.username ||
                !state.password
            ) {
                this.setState({
                    error: 'Please fill all the fields!'
                });
                this.toggleInvalidModal();
                return;
            }

            this.props.firestore
                .collection(state.id).doc('branch_'+state.branch)
                .get()
                .then((res) => {
                    if (res.exists) {
                        const data = res.data();

                        data.accountList.map((i) => {
                            if (state.username === i.accountName && state.password === i.password) {
                                this.props.firestore
                                .collection(state.id).doc('info')
                                .get()
                                .then((res2) => {
                                    const data2 = res2.data();

                                    localStorage.setItem('info', JSON.stringify(data2));
                                    localStorage.setItem('role', i.accountType);
                                    localStorage.setItem('serviceType', data.serviceType);
                                    localStorage.setItem('branch', 'branch_' + state.branch)

                                    this.toggleSuccessModal();
                            });
                            } 
                            else {
                                this.setState({
                                    error: 'Invalid Credentials! Please retry again!'
                                });
                                this.toggleInvalidModal();
                            }
                        })
                    }
                    else {
                        this.setState({
                            error: 'Account does not exist! Please ensure all fields are correct!'
                        });
                        this.toggleInvalidModal();
                    }
                });
        }
    }

    redirectLogin = () => {
        let serviceType = localStorage.getItem('serviceType'),
        role =  localStorage.getItem('role'),
        id = this.state.branch;

        if (role === 'admin') {
            this.props.history.push('/branch');
        }
        if (role === 'server') {
            if (serviceType === '1') {
                this.setState({
                    error: "Sorry! Unable to redirect to a function due to the service type of the branch!"
                })
                this.toggleInvalidModal();
                this.toggleSuccessModal();
            }
            if (serviceType === '2') {
                this.props.history.push('/lobby/'+id);
            }
            if (serviceType === '3') {
                this.setState({
                    error: "Sorry! Unable to redirect to a function due to the service type of the branch!"
                })
                this.toggleInvalidModal();
                this.toggleSuccessModal();
            }
            if (serviceType === '4') {
                this.props.history.push('/lobby/'+id);
            }
            if (serviceType === '5') {
                this.props.history.push('/lobby/'+id);
            }
        }
        if (role === 'clerk') {
            if (serviceType === '1') {
                this.props.history.push('/order/new');
            }
            if (serviceType === '2') {
                this.props.history.push('/lobby/'+id);
            }
            if (serviceType === '3') {
                this.props.history.push('/order/new');
            }
            if (serviceType === '4') {
                this.props.history.push('/lobby/'+id);
            }
            if (serviceType === '5') {
                this.props.history.push('/lobby/'+id);
            }
        }
        if (role === 'manager') {
            this.props.history.push('/record/'+id);
        }
    }

    render() {
        const state = this.state;

        return (
            <>
                <div className="home-container">
                    <div className="home-wrap">
                        <a target="_blank" className="shared-link-wrapper" href="/docs">
                            <HelpOutlineIcon className="home-help" />
                        </a>
                        <div className="home-title">TastyBox</div>
                        <div className="home-form">
                            <TextField
                                type="text"
                                className="home-input-input"
                                value={state.id}
                                onChange={this.handleChange}
                                color="secondary"
                                name="id"
                                label="TastyBox ID" />
                            <FormControl color="secondary" className="home-input-input">
                                <InputLabel htmlFor="input-role">Role</InputLabel>
                                <Select
                                    native
                                    value={state.country}
                                    onChange={this.handleChange}
                                    color="secondary"
                                    inputProps={{
                                        name: 'role',
                                        id: 'input-role'
                                    }}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="clerk">Clerk</option>
                                    <option value="server">Server</option>
                                </Select>
                            </FormControl>
                            {
                                state.role === "admin" ?
                                    <TextField
                                        type="text"
                                        className="home-input-input"
                                        value={state.email}
                                        onChange={this.handleChange}
                                        color="secondary"
                                        name="email"
                                        label="Email" /> :
                                    <>
                                        <TextField
                                            type="text"
                                            className="home-input-input"
                                            value={state.branch}
                                            onChange={this.handleChange}
                                            color="secondary"
                                            name="branch"
                                            label="Branch" />
                                        <TextField
                                            type="text"
                                            className="home-input-input"
                                            value={state.username}
                                            onChange={this.handleChange}
                                            color="secondary"
                                            name="username"
                                            label="Name" />
                                    </>
                            }
                            <TextField
                                type="password"
                                className="home-input-input"
                                value={state.password}
                                onChange={this.handleChange}
                                color="secondary"
                                name="password"
                                label="Password" />

                            <div className="home-input-btn-login" onClick={this.login}>LOGIN</div>
                            <div className="home-input-btn-register" onClick={() => this.navigate('/register')}>REGISTER</div>
                        </div>
                    </div>
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
                                    OK
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


                <Modal
                    backdropClassName={"shared-modal-backdrop"}
                    centered
                    isOpen={state.modal_success}
                    toggle={this.toggleSuccessModal}
                    className="shared-modal-container shared-modal-wrap"
                >
                    <ModalBody>
                        <div className="shared-modal-close" onClick={this.redirectLogin}>
                            <span>&#10005;</span>
                        </div>
                        <div className="shared-modal-content">
                            <p>Login successfully!</p>
                            <div className="shared-modal-btn-wrap">
                                <div
                                    className="shared-modal-btn-main"
                                    onClick={this.redirectLogin}
                                >
                                    OK
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




export default withFirestore(Home);
