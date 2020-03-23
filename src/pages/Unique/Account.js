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
import EditIcon from '@material-ui/icons/Edit';
import ListAltIcon from '@material-ui/icons/ListAlt';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import RestaurantIcon from '@material-ui/icons/Restaurant';

var passwordHash = require('password-hash');
require('firebase/auth');

class Account extends Component {

    state = {
        modal_invalid: false,
        modal_order: false,
        modal_update: false,
        modal_delete: false,

        error: '',

        addAccount: '',
        addType: '',
        editType: '',

        deleteInput: '',
        deleteData: {},
        accountList: [],

        editAccount: '',
        editName: '',

        addPassword: '',
        editPassword: ''
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

        this.props.firestore.collection(storageInfo.id).doc('branch_'+ this.props.match.params.id).onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();

                this.setState({
                    accountList: data.accountList
                })
            }
        });
    }

    navigate = (url) => {
        this.props.history.push(url)
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

    toggleOrderModal = () => {
        const val = this.state.modal_order;

        this.setState({
            modal_order: !val
        })
    }

    toggleDeleteModal = () => {
        const val = this.state.modal_delete;

        this.setState({
            modal_delete: !val
        })
    }

    toggleUpdateModal = () => {
        const val = this.state.modal_update;

        this.setState({
            modal_update: !val
        })
    }

    toggleEditModal = () => {
        const val = this.state.modal_edit;

        this.setState({
            modal_edit: !val
        })
    }


    removeList = (id) => {
        let val = [];

        this.state.orderList.map((i) => {

            console.log(i.accountId, id)
            if (i.accountId !== id) {
                val.push(i)
            }
        })

        this.setState({
            orderList: val
        })
    }

    addList = (i) => {
        let val = this.state.orderList;

        val.push({
            accountId: i.accountId,
            accountType: i.accountType,
            password: i.password,
            accountName: i.accountName
        });

        this.setState({
            orderList: val
        }, () => {
            this.toggleOrderModal();
        })
    }

    confirmUpdate = () => {
        this.toggleUpdateModal();
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    editAccount = (i) => {
        this.setState({
            editName: i.accountName,
            editAccount: i.accountName,
            editType: i.accountType,
            editPassword: i.password
        })
        this.toggleEditModal();
    }

    beforeDelete = (i) => {
        this.setState({
            deleteData: i,
            modal_delete: true
        })
    }

    deleteMenu = () => {
        let storageInfo = JSON.parse(localStorage.getItem('info')),
            adminInfo = JSON.parse(localStorage.getItem('admin')),
            i = this.state.deleteData;
        const state = this.state;

        let accountList = [];

        state.accountList.map((o) => {
            if (i.accountName !== o.accountName) {
                accountList.push(o)
            }
        })

        this.props.firestore
                .collection(storageInfo.id).doc('branch_'+this.props.match.params.id)
                .set( {
                    accountList: [...accountList]
                }, { merge: true }).then(() => {
                    this.setState({
                        error: 'Account ' + i.accountName + ' has been deleted successfully!',
                        deleteData: {},
                        deleteInput: ''
                    }) 
                    this.toggleInvalidModal();
                    this.toggleDeleteModal();

				}).catch((err) => console.log(err));
    }

    confirmEdit = () => {

        let storageInfo = JSON.parse(localStorage.getItem('info')),
            adminInfo = JSON.parse(localStorage.getItem('admin'));
        const state = this.state;

        let accountList = [];
        
        if (accountList.some( i => i['accountName'] == state.addAccount )
        ) {
            this.setState({
                error: 'Account Name already exists! Please use a different name!'
            });
            this.toggleInvalidModal();
            return;
        }

        state.accountList.map((i) => {
            if (i.accountName !== state.editName) {
                accountList.push(i)
            }
            else {
                accountList.push({
                    accountId: i.accountId,
                    // recipeList: i.recipeList,
                    accountName: state.editAccount,
                    password: state.editPassword,
                    accountType: state.editType
                })
            }
        })

        console.log (accountList)

        this.props.firestore
                .collection(storageInfo.id).doc('branch_'+this.props.match.params.id)
                .set( {
                    accountList: [...accountList]
                }, { merge: true }).then(() => {
                    this.setState({
                        error: 'Account has been updated successfully!',
                        editAccount: '',
                        editPassword: '',
                        editName: '',
                        editType: ''
                    }) 
                    this.toggleInvalidModal();
                    this.toggleEditModal();

				}).catch((err) => console.log(err));


    }

    confirmAdd = () => {


        let storageInfo = JSON.parse(localStorage.getItem('info')),
            adminInfo = JSON.parse(localStorage.getItem('admin'));
        const state = this.state;

        let accountList = state.accountList;
        
        if (accountList.some( i => i['accountName'] == state.addAccount )
        ) {
            this.setState({
                error: 'Account Name already exists! Please use a different name!'
            });
            this.toggleInvalidModal();
            return;
        }

        const accObj = {
            accountId: state.accountList.length + 1,
            accountName: state.addAccount,
            accountType: state.addType,
            password: state.addPassword
        }

        accountList.push(accObj)


        this.props.firestore
            .collection(storageInfo.id).doc('branch_' + this.props.match.params.id)
            .set({
                accountList
            }, {merge: true}).then(() => {
                this.toggleOrderModal();
                this.setState({
                    error: 'Account added successfully',
                    addAccount: '',
                    addPassword: '',
                    addType: ''
                });
                this.toggleInvalidModal();
            }).catch((e) => {
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
                <Header logout branch activeRoute="Manage Accounts" />
                <div className="branch-container">
                    {
                        state.accountList.length ?
                        <div className="table-responsive">
                            <table className="table table-hover branch-list">
                                <thead>
                                    <tr>
                                        <th className="branch-header-name">Name</th>
                                        <th>Type</th>
                                        <th>Edit</th>
                                        <th>Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        state.accountList.map((i, idx) =>
                                            <tr key={idx}>
                                                <td>
                                                    {i.accountName}
                                                </td>
                                                <td >
                                                    {i.accountType ? i.accountType.charAt(0).toUpperCase() + i.accountType.slice(1) : ''}
                                                </td>
                                                <td>
                                                    <EditIcon className="branch-icon" onClick={() => this.editAccount(i)} />
                                                </td>
                                                <td>
                                                    <RemoveCircleIcon className="branch-icon" onClick={() => this.beforeDelete(i)} />
                                                </td>
                                            </tr>
                                        )
                                    }

                                </tbody>
                            </table>
                        </div> : <div className="branch-empty">No account created.</div>
                    }


                </div>


                <div className="branch-add" onClick={this.toggleOrderModal}>
                    <AddIcon />
                </div>

                <Modal
                    backdropClassName={"shared-modal-backdrop"}
                    centered
                    isOpen={state.modal_order}
                    toggle={this.toggleOrderModal}
                    className="shared-modal-container shared-modal-wrap branch-modal-category-wrap"
                >
                    <ModalBody>
                        <div className="shared-modal-close" onClick={this.toggleOrderModal}>
                            <span>&#10005;</span>
                        </div>
                        <div className="shared-modal-content">

                            <TextField
                                type="text"
                                className="admin-input-input"
                                value={state.addAccount}
                                onChange={this.handleChange}
                                color="secondary"
                                name="addAccount"
                                label="Account Name"
                                variant="outlined"
                            />
                            
                            <TextField
                                type="text"
                                className="admin-input-input"
                                value={state.addPassword}
                                onChange={this.handleChange}
                                color="secondary"
                                name="addPassword"
                                label="Password"
                                variant="outlined"
                            />
                            

                            <FormControl variant="outlined" color="secondary" className="admin-input-input">
                                <InputLabel  className="admin-label-country" htmlFor="input-role">Type</InputLabel>
                                <Select
                                    native
                                    value={state.addType}
                                    onChange={this.handleChange}
                                    color="secondary"
                                    inputProps={{
                                        name: 'addType',
                                        id: 'input-role'
                                    }}
                                >
                                    <option value=""></option>
                                    <option value="manager">Manager</option>
                                    <option value="clerk">Clerk</option>
                                    <option value="server">Server</option>
                                </Select>
                            </FormControl>

                            <div className="shared-modal-btn-wrap">
                                {
                                    state.addAccount && state.addType !== "" && state.addPassword ? <div
                                        className="shared-modal-btn-main"
                                        onClick={this.confirmAdd}
                                    >
                                        Add
                                    </div> : ''
                                }
                            </div>
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

                <Modal
                    backdropClassName={"shared-modal-backdrop"}
                    centered
                    isOpen={state.modal_delete}
                    toggle={this.toggleDeleteModal}
                    className="shared-modal-container shared-modal-wrap branch-modal-category-wrap"
                >
                    <ModalBody>
                        <div className="shared-modal-close" onClick={this.toggleDeleteModal}>
                            <span>&#10005;</span>
                        </div>
                        <div className="shared-modal-content">
                            Please input the Account Name to confirm delete.
                            <TextField
                                type="text"
                                className="admin-input-input"
                                value={state.deleteInput}
                                onChange={this.handleChange}
                                color="secondary"
                                name="deleteInput"
                                label="Account Name"
                                variant="outlined"
                            />

                            <div className="shared-modal-btn-wrap">
                                {
                                    state.deleteInput === state.deleteData.accountName ? <div
                                        className="shared-modal-btn-main"
                                        onClick={this.deleteMenu}
                                    >
                                        Delete
                                    </div> : ''
                                }
                            </div>
                        </div>
                    </ModalBody>
                </Modal>



                {/* Edit Modal  */}


                <Modal
                    backdropClassName={"shared-modal-backdrop"}
                    centered
                    isOpen={state.modal_edit}
                    toggle={this.toggleEditModal}
                    className="shared-modal-container shared-modal-wrap branch-modal-category-wrap"
                >
                    <ModalBody>
                        <div className="shared-modal-close" onClick={this.toggleEditModal}>
                            <span>&#10005;</span>
                        </div>
                        <div className="shared-modal-content">

                            <TextField
                                type="text"
                                className="admin-input-input"
                                value={state.editAccount}
                                onChange={this.handleChange}
                                color="secondary"
                                name="editAccount"
                                label="Account Name"
                                variant="outlined"
                            />

                            <TextField
                                type="text"
                                className="admin-input-input"
                                value={state.editPassword}
                                onChange={this.handleChange}
                                color="secondary"
                                name="editPassword"
                                label="Password"
                                variant="outlined"
                            />

                            <FormControl variant="outlined" color="secondary" className="admin-input-input">
                                <InputLabel  className="admin-label-country" htmlFor="input-role">Type</InputLabel>
                                <Select
                                    native
                                    value={state.editType}
                                    onChange={this.handleChange}
                                    color="secondary"
                                    inputProps={{
                                        name: 'editType',
                                        id: 'input-role'
                                    }}
                                >
                                    <option value=""></option>
                                    <option value="manager">Manager</option>
                                    <option value="clerk">Clerk</option>
                                    <option value="server">Server</option>
                                </Select>
                            </FormControl>

                            <div className="shared-modal-btn-wrap">
                                {
                                    state.editAccount && state.editType && state.editPassword !== ""
                                    // && state.editAccount !== state.editName 
                                    ? <div
                                        className="shared-modal-btn-main"
                                        onClick={this.confirmEdit}
                                    >
                                        Edit
                                    </div> : ''
                                }
                            </div>
                        </div>
                    </ModalBody>
                </Modal>
            </>
        );
    }
}




export default withFirestore(Account);
