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

class Menu extends Component {

    state = {
        modal_invalid: false,
        modal_order: false,
        modal_update: false,
        modal_delete: false,

        error: '',

        addMenu: '',
        addPrice: '',
        editPrice: '',

        deleteInput: '',
        deleteData: {},
        menuList: [],

        editMenu: '',
        editName: ''
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
                    menuList: data.menuList
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
            price: i.price
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

    editMenu = (i) => {
        this.setState({
            editName: i.menuName,
            editMenu: i.menuName,
            editPrice: i.price
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

        let menuList = [];

        state.menuList.map((o) => {
            if (i.menuName !== o.menuName) {
                menuList.push(o)
            }
        })

        this.props.firestore
                .collection(storageInfo.id).doc('branch_'+this.props.match.params.id)
                .set( {
                    menuList: [...menuList]
                }, { merge: true }).then(() => {
                    this.setState({
                        error: 'Menu ' + i.menuName + ' has been deleted successfully!',
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

        let menuList = [];
        
        if (menuList.some( i => i['menuName'] == state.addMenu )
        ) {
            this.setState({
                error: 'Menu name already exists! Please use a different name!'
            });
            this.toggleInvalidModal();
            return;
        }

        state.menuList.map((i) => {
            if (i.menuName !== state.editName) {
                menuList.push(i)
            }
            else {
                menuList.push({
                    menuId: i.menuId,
                    // recipeList: i.recipeList,
                    menuName: state.editMenu,
                    price: i.price
                })
            }
        })

        console.log (menuList)

        this.props.firestore
                .collection(storageInfo.id).doc('branch_'+this.props.match.params.id)
                .set( {
                    menuList: [...menuList]
                }, { merge: true }).then(() => {
                    this.setState({
                        error: 'Menu has been updated successfully!',
                        editMenu: '',
                        editName: '',
                        editPrice: ''
                    }) 
                    this.toggleInvalidModal();
                    this.toggleEditModal();

				}).catch((err) => console.log(err));


    }

    confirmAdd = () => {


        let storageInfo = JSON.parse(localStorage.getItem('info')),
            adminInfo = JSON.parse(localStorage.getItem('admin'));
        const state = this.state;

        let menuList = state.menuList;
        
        if (menuList.some( i => i['menuName'] == state.addMenu )
        ) {
            this.setState({
                error: 'Menu name already exists! Please use a different name!'
            });
            this.toggleInvalidModal();
            return;
        }

        const menuObj = {
            menuId: state.menuList.length + 1,
            menuName: state.addMenu,
            price: state.addPrice
        }

        menuList.push(menuObj)


        this.props.firestore
            .collection(storageInfo.id).doc('branch_' + this.props.match.params.id)
            .set({
                menuList
            }, {merge: true}).then(() => {
                this.toggleOrderModal();
                this.setState({
                    error: 'Menu added successfully',
                    addMenu: '',
                    addPrice: ''
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
                <Header logout branch activeRoute="Manage Category" />
                <div className="branch-container">
                    {
                        state.menuList.length ?
                        <div className="table-responsive">
                            <table className="table table-hover branch-list">
                                <thead>
                                    <tr>
                                        <th className="branch-header-name">Name</th>
                                        <th>Price</th>
                                        <th>Edit</th>
                                        <th>Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        state.menuList.map((i, idx) =>
                                            <tr key={idx}>
                                                <td>
                                                    {i.menuName}
                                                </td>
                                                <td>
                                                    {i.price}
                                                </td>
                                                <td>
                                                    <EditIcon className="branch-icon" onClick={() => this.editMenu(i)} />
                                                </td>
                                                <td>
                                                    <RemoveCircleIcon className="branch-icon" onClick={() => this.beforeDelete(i)} />
                                                </td>
                                            </tr>
                                        )
                                    }

                                </tbody>
                            </table>
                        </div> : <div className="branch-empty">No Menu found.</div>
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
                                value={state.addMenu}
                                onChange={this.handleChange}
                                color="secondary"
                                name="addMenu"
                                label="Menu Name"
                                variant="outlined"
                            />

                            <TextField
                                type="number"
                                className="admin-input-input"
                                value={state.addPrice}
                                onChange={this.handleChange}
                                color="secondary"
                                name="addPrice"
                                label="Price"
                                variant="outlined"
                            />

                            <div className="shared-modal-btn-wrap">
                                {
                                    state.addMenu && state.addPrice !== "" ? <div
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
                            Please input the menu name to confirm delete.
                            <TextField
                                type="text"
                                className="admin-input-input"
                                value={state.deleteInput}
                                onChange={this.handleChange}
                                color="secondary"
                                name="deleteInput"
                                label="Menu Name"
                                variant="outlined"
                            />

                            <div className="shared-modal-btn-wrap">
                                {
                                    state.deleteInput === state.deleteData.menuName ? <div
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
                                value={state.editMenu}
                                onChange={this.handleChange}
                                color="secondary"
                                name="editMenu"
                                label="Menu Name"
                                variant="outlined"
                            />

                            <TextField  
                                type="number"
                                className="admin-input-input"
                                value={state.editPrice}
                                onChange={this.handleChange}
                                color="secondary"
                                name="editPrice"
                                label="Price"
                                variant="outlined"
                            />

                            <div className="shared-modal-btn-wrap">
                                {
                                    state.editMenu || state.editPrice === ""
                                    // && state.editMenu !== state.editName 
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




export default withFirestore(Menu);
