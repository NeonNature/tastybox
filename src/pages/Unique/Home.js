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
                !state.name ||
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
        this.props.history.push('/config');
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
