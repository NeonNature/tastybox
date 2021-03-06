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

class Branch extends Component {

    state = {
        modal_invalid: false,
        modal_order: false,
        modal_update: false,
        modal_delete: false,

        error: '',

        branchList: [],
        activeEdit: '',
        addBranch: '',

        deleteInput: '',
        deleteData: {},
        seatList: ''
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

        this.props.firestore.collection(storageInfo.id).doc('info').onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();

                this.setState({
                    branchList: data.branchList
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

    removeList = (id) => {
        let val = [];

        this.state.orderList.map((i) => {

            console.log(i.recipeID, id)
            if (i.recipeID !== id) {
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
            recipeID: i.recipeID,
            recipeName: i.recipeName,
            qty: 1,
            price: i.price
        });

        this.setState({
            orderList: val
        }, () => {
            this.toggleOrderModal();
        })
    }

    selectCategory = (val) => {
        let addList = [];

        this.state.masterCategoryList.map((i, idx) => {

            if (i.categoryID === val.categoryID) {
                this.setState({
                    activeCategory: val.categoryID
                })
                this.state.masterRecipeList.map((o, odx) => {
                    if (o.categoryID === i.categoryID) {
                        addList.push(o)
                    }
                })
            }
        });

        this.setState({
            addList
        })
    }

    confirmUpdate = () => {
        this.toggleUpdateModal();
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    detectEnter = (e) => {
        if (e.key === 'Enter') {
            this.onEndEdit();
        }
    }

    onInitiateEdit = (i) => {
        this.setState({
            activeEdit: i.branchId,
            activeName: i.branchName
        })
    }

    onEndEdit = () => {
        this.setState({
            activeEdit: '',
            activeName: ''
        })
    }

    manageMenu = (i) => {
        this.props.history.push('/menu/' + i.branchName);
    }

    manageAccount = (i) => {
        this.props.history.push('/account/' + i.branchName);
    }

    manageBranch = (i) => {
        this.props.history.push('/branch/' + i.branchName)
    }

    manageRecords = (i) => {
        this.props.history.push('/record/' + i.branchName)
    }

    beforeDelete = (i) => {
        this.setState({
            deleteData: i,
            modal_delete: true
        })
    }

    deleteBranch = () => {
        let storageInfo = JSON.parse(localStorage.getItem('info')),
            adminInfo = JSON.parse(localStorage.getItem('admin')),
            i = this.state.deleteData;
        const state = this.state;

        this.props.firestore
                .collection(storageInfo.id).doc('branch_'+i.branchName)
                .delete().then(() => {

                    this.props.firestore
                            .collection(storageInfo.id).doc('info')
                            .update({
                                branchList: state.branchList.filter( o => o.branchName !== i.branchName)
                            })
                            .then(() => {
                               this.setState({
                                   error: 'Branch ' + i.branchName + ' has been deleted successfully!',
                                   deleteData: {},
                                   deleteInput: ''
                               }) 
                               this.toggleInvalidModal();
                               this.toggleDeleteModal();
                            })

				}).catch((err) => console.log(err));
    }

    confirmAdd = () => {


        let storageInfo = JSON.parse(localStorage.getItem('info')),
            adminInfo = JSON.parse(localStorage.getItem('admin'));
        const state = this.state;

        let branchList = state.branchList;
        
        if (branchList.some( i => i['branchName'] == state.addBranch )
        ) {
            this.setState({
                error: 'Branch name already exists! Please use a different name!'
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



        let seatList = []

        const n = parseInt(state.seatList);

        [...Array(n)].map((e, i) => {
            seatList.push({
                seatId: i + 1,
                isOccupied: false
            })
        })

        const branchObj = {
            branchId: state.branchList.length + 1,
            branchName: state.addBranch,
            serviceType: "1",
            seatList: [...seatList],
            menuList: [],
            accountList: [],
            recordList: [],
            queue: '0'
        }

        branchList.push(branchObj)


        this.props.firestore
            .collection(storageInfo.id).doc('branch_' + state.addBranch)
            .set(branchObj, {merge: true}).then(() => {
                this.props.firestore
                .collection(storageInfo.id).doc('info')
                .set({
                    branchList
                    }, {merge: true}).then(() => {
                        this.toggleOrderModal();
                        this.setState({
                            error: 'Branch added successfully',
                            addBranch: '',
                            seatList: ''
                        });
                        this.toggleInvalidModal();
                    }).catch((e) => {
                        this.setState({
                            error: 'An error has encountered! Please retry later!'
                        });
                        this.toggleInvalidModal();
                        console.log(e);
                    });
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
                <Header logout admin activeRoute="Manage Branches" />
                <div className="branch-container">
                    {
                        state.branchList.length ?
                        <div className="table-responsive">
                            <table className="table table-hover branch-list">
                                <thead>
                                    <tr>
                                        <th className="branch-header-name">Name</th>
                                        <th>Account</th>
                                        <th>Menu</th>
                                        <th>Record</th>
                                        <th>Edit</th>
                                        <th>Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        state.branchList.map((i, idx) =>
                                            <tr key={idx}>
                                                <td>
                                                    {/* {
                                                        state.activeEdit === i.branchId ?
                                                            <> */}
                                                                {/* <TextField
                                                                    type="text"
                                                                    className="branch-input-input"
                                                                    value={state.activeName}
                                                                    onChange={this.handleChange}
                                                                    color="secondary"
                                                                    name="activeName"
                                                                    label="Branch Name"
                                                                    onKeyDown={this.detectEnter}
                                                                    variant="outlined" /> */}
                                                            {/* </>
                                                            :
                                                            <>
                                                                {i.branchName}
                                                                <EditIcon className="branch-icon ml-3" onClick={() => this.onInitiateEdit(i)} />
                                                            </>

                                                    } */}
                                                     {i.branchName}
                                                </td>
                                                <td>
                                                    <SupervisorAccountIcon className="branch-icon" onClick={() => this.manageAccount(i)} />
                                                </td>
                                                <td>
                                                    <RestaurantIcon className="branch-icon" onClick={() => this.manageMenu(i)} />
                                                </td>
                                                <td>
                                                    <ListAltIcon className="branch-icon" onClick={() => this.manageRecords(i)} />
                                                </td>
                                                <td>
                                                    <EditIcon className="branch-icon" onClick={() => this.manageBranch(i)} />
                                                </td>
                                                <td>
                                                    <RemoveCircleIcon className="branch-icon" onClick={() => this.beforeDelete(i)} />
                                                </td>
                                            </tr>
                                        )
                                    }

                                </tbody>
                            </table>
                        </div> : <div className="branch-empty">No Branch found.</div>
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
                                value={state.addBranch}
                                onChange={this.handleChange}
                                color="secondary"
                                name="addBranch"
                                label="Branch Name"
                                variant="outlined"
                            />

                            <TextField
                                type="number"
                                className="admin-input-input"
                                value={state.seatList}
                                onChange={this.handleChange}
                                color="secondary"
                                name="seatList"
                                label="Seats"
                                variant="outlined"
                            />

                            <div className="shared-modal-btn-wrap">
                                {
                                    state.addBranch && state.seatList !== '' ? <div
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
                                <div
                                    className="shared-modal-btn-secondary"
                                    onClick={this.toggleUpdateModal}
                                >
                                    Cancel
                            </div>
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
                            Please input the branch name to confirm delete.
                            <TextField
                                type="text"
                                className="admin-input-input"
                                value={state.deleteInput}
                                onChange={this.handleChange}
                                color="secondary"
                                name="deleteInput"
                                label="Branch Name"
                                variant="outlined"
                            />

                            <div className="shared-modal-btn-wrap">
                                {
                                    state.deleteInput === state.deleteData.branchName ? <div
                                        className="shared-modal-btn-main"
                                        onClick={this.deleteBranch}
                                    >
                                        Delete
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




export default withFirestore(Branch);
