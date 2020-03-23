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

class ManageBranch extends Component {

    state = {
        modal_invalid: false,
        modal_order: false,
        modal_update: false,
        modal_success: false,

        error: '',

        activeCategory: 1,
        categoryList: [],

        id: '',
        branchName: '',
        serviceType: '',
        menuList: [],
        accountList: [],
        recordList: [],
        seatList: '',
        queue: ''

    }

    componentDidMount() {
        if (localStorage.getItem('role') !== 'admin') {
            this.props.history.push('/')
            return;
        }

        const state = this.state;

        let storageInfo = JSON.parse(localStorage.getItem('info')),
            adminInfo = JSON.parse(localStorage.getItem('admin'));

        if (storageInfo === null || adminInfo === null) {
            this.props.history.push('/')
            return;
        }

        this.props.firestore
            .collection(storageInfo.id).doc('branch_' + this.props.match.params.id)
            .get()
            .then((res) => {

                if (!res.exists) {
                    this.props.history.push('/branch');
                    return;
                }
                const data = res.data();

                this.setState({
                    id: data.branchId,
                    branchName: data.branchName,
                    serviceType: data.serviceType,
                    menuList: data.menuList,
                    accountList: data.accountList,
                    recordList: data.recordList,
                    seatList: data.seatList.length,
                    queue: data.queue
                })
            });
    }

    navigate = (url) => {
        this.props.history.push(url)
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    redirectLogin = () => {
        this.props.history.push('/branch')
    }

    toggleInvalidModal = () => {
        const val = this.state.modal_invalid;

        this.setState({
            modal_invalid: !val
        })
    }

    toggleOrderModal = () => {
        const val = this.state.modal_order;

        this.setState({
            modal_order: !val
        })
    }

    toggleUpdateModal = () => {
        const val = this.state.modal_update;

        this.setState({
            modal_update: !val
        })
    }

    toggleSuccessModal = () => {
        const val = this.state.modal_success;

        this.setState({
            modal_success: !val
        })
    }

    confirmUpdate = () => {
        this.toggleUpdateModal();


        const state = this.state;

        if (
            !state.branchName ||
            !state.serviceType ||
            !state.seatList
        ) {
            this.setState({
                error: 'Please fill necessary fields.'
            });
            this.toggleInvalidModal();
            return;
        }

        if (parseInt(state.seatList) > 50 || parseInt(state.seatList) < 1) {
            this.setState({
                error: 'Only a minimum of 1 and a maximum of 50 seatList are allowed.'
            });
            this.toggleInvalidModal();
            return;
        }


        let storageInfo = JSON.parse(localStorage.getItem('info')),
            adminInfo = JSON.parse(localStorage.getItem('admin'));

            this.props.firestore.collection(storageInfo.id).doc('info')
                .get()
                .then((doc) => 
                {
                    if (doc.exists) {
                        const data = doc.data();

                        let branchList = data.branchList;

                        if (data.branchList.some( i => i['branchName'] == state.branchName )
                        ) {
                            if (state.branchName !== this.props.match.params.id) {
                                this.setState({
                                    error: 'Branch name already exists! Please use a different name!'
                                });
                                this.toggleInvalidModal();
                                return;
                            }
                        }

                        let initialService = '';

                       data.branchList.map((i) => {
                            if (i.branchName === this.props.match.params.id) {
                                initialService = i.serviceType
                            }
                        })

                        console.log(this.props.firestore)

                        this.props.firestore
                            .collection(storageInfo.id).doc('info')
                            .update({
                                branchList: branchList.filter( o => o.branchName !== this.props.match.params.id)
                            })

                        let seatList = []

                        const n = parseInt(state.seatList);
                
                        [...Array(n)].map((e, i) => {
                            seatList.push({
                                seatId: i + 1,
                                isOccupied: false
                            })
                        })
                    

                        this.props.firestore
                            .collection(storageInfo.id).doc('info')
                            .update({
                                branchList: firebase.firestore.FieldValue.arrayUnion({
                                    branchId: state.id,
                                    branchName: state.branchName,
                                    serviceType: state.serviceType,
                                    accountList: state.accountList,
                                    recordList: state.recordList,
                                    menuList: state.menuList,
                                    seatList: [...seatList],
                                    queue: state.queue
                                })
                            })
                            .then(() => {

                                this.props.firestore.collection(storageInfo.id).doc('branch_' + this.props.match.params.id)
                                .delete()
                                .then(() => {

                                                let seatList = []

                                                const n = parseInt(state.seatList);
                                        
                                                [...Array(n)].map((e, i) => {
                                                    seatList.push({
                                                        seatId: i + 1,
                                                        isOccupied: false
                                                    })
                                                })

                                            this.props.firestore
                                            .collection(storageInfo.id).doc('branch_' + state.branchName)
                                            .set({
                                                branchId: state.id,
                                                branchName: state.branchName,
                                                serviceType: state.serviceType,
                                                menuList: state.menuList,
                                                recordList: state.recordList,
                                                accountList: state.accountList,
                                                seatList: [...seatList],
                                                queue: state.queue
                                            }, { merge: true }).then(() => {
                                                this.toggleSuccessModal();
                                            }).catch((e) => {
                                                this.setState({
                                                    error: 'An error has encountered! Please retry later!'
                                                });
                                                this.toggleInvalidModal();
                                                console.log(e);
                                            });
                                })
                                .catch((e) => {
                                    this.setState({
                                        error: 'An error has encountered! Please retry later!'
                                    });
                                    this.toggleInvalidModal();
                                    console.log(e);
                                });

                            })
                            .catch((e) => {
                                this.setState({
                                    error: 'An error has encountered! Please retry later!'
                                });
                                this.toggleInvalidModal();
                                console.log(e);
                            });

                    }
                }).catch((e) => {
                    this.setState({
                        error: 'An error has encountered! Please retry later!'
                    });
                    this.toggleInvalidModal();
                    console.log(e);
                });

    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    render() {
        const state = this.state;

        return (
            <>
                <Header logout branch activeRoute="Edit Branch" />
                <div className="admin-container">

                    <TextField
                        type="text"
                        className="admin-input-input"
                        value={state.branchName}
                        onChange={this.handleChange}
                        color="secondary"
                        name="branchName"
                        label="Branch Name"
                        variant="outlined" />

                    <FormControl variant="outlined" color="secondary" className="admin-input-input">
                        <InputLabel htmlFor="input-serviceType" className="admin-label-country">Service Type</InputLabel>
                        <Select
                            native
                            value={state.serviceType}
                            onChange={this.handleChange}
                            color="secondary"
                            name="serviceType"
                            inputProps={{
                                name: 'serviceType',
                                id: 'input-serviceType'
                            }}
                        >
                            <option value="1">Self Service</option>
                            <option value="2">Semi Self Service</option>
                            <option value="3">Queue Service</option>
                            <option value="4">Waiter Service</option>
                            <option value="5">Buffet Service</option>
                        </Select>
                    </FormControl>

                    <TextField
                        type="number"
                        className="admin-input-input"
                        value={state.seatList}
                        onChange={this.handleChange}
                        color="secondary"
                        name="seatList"
                        label="Seats"
                        variant="outlined" />




                    <div className="text-center">
                        <div
                            className="admin-btn-confirm"
                            onClick={this.toggleUpdateModal}
                        >
                            Update
                                </div>
                    </div>


                </div>


                {/* <div className="admin-add" onClick={this.toggleOrderModal}>
                    <AddIcon />
                </div> */}

                <Modal
                    backdrop={"static"}
                    backdropClassName={"shared-modal-backdrop"}
                    centered
                    isOpen={state.modal_order}
                    toggle={this.toggleOrderModal}
                    className="shared-modal-container shared-modal-wrap admin-modal-category-wrap"
                >
                    <ModalBody>
                        <div className="shared-modal-close" onClick={this.toggleOrderModal}>
                            <span>&#10005;</span>
                        </div>
                        <div className="shared-modal-content">

                            {/* 

                            <div className="shared-modal-btn-wrap">
                                <div
                                    className="shared-modal-btn-main"
                                    onClick={this.toggleOrderModal}
                                >
                                    Add
                            </div>
                                <div
                                className="shared-modal-btn-secondary"
                                onClick={this.toggleInvalidModal}
                            >
                                Cancel
                            </div>
                            </div> */}
                        </div>
                    </ModalBody>
                </Modal>


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



                {/* Confirm Modal */}

                <Modal
                    backdropClassName={"shared-modal-backdrop"}
                    centered
                    isOpen={state.modal_update}
                    toggle={this.toggleUpdateModal}
                    className="shared-modal-container shared-modal-wrap"
                >
                    <ModalBody>
                        <div className="shared-modal-close" onClick={this.toggleUpdateModal}>
                            <span>&#10005;</span>
                        </div>
                        <div className="shared-modal-content">
                            <p>Are you sure you want to update the info?</p>
                            <div className="shared-modal-btn-wrap">
                                <div
                                    className="shared-modal-btn-main"
                                    onClick={this.confirmUpdate}
                                >
                                    Confirm
                            </div>
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
                            <p>Updated successfully!</p>
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




export default withFirestore(ManageBranch);
