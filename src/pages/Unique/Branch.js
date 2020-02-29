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

var passwordHash = require('password-hash');
require('firebase/auth');

class Branch extends Component {

    state = {
        modal_invalid: false,
        modal_order: false,
        modal_update: false,

        error: '',

        branchList: [
            {
                branchId: 1,
                branchName: 'Tokyo Mokyu Hototo'
            },
            {
                branchId: 2,
                branchName: 'Hakuna Matata'
            }
        ],
        activeEdit: ''
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
        this.props.history.push('/menu/'+i.branchId);
    }

    manageAccount = (i) => {
        this.props.history.push('/account/'+i.branchId);
    }

    render() {
        const state = this.state;

        return (
            <>
                <Header />
                <div className="branch-container">
                {
                                    state.branchList.length ?
                                    <table className="table table-hover branch-list">
                                        <thead>
                                        <tr>
                                            <th className="branch-header-name">Branch Name</th>
                                            <th>Account</th>
                                            <th>Menu</th>
                                            <th>Delete</th>
                                        </tr>
                                        </thead>
                                    <tbody>
                                        {
                                            state.branchList.map((i, idx) =>
                                                <tr key={idx}>
                                                    <td>
                                                        {
                                                             state.activeEdit === i.branchId ? 
                                                             <>
                                                                <TextField 
                                                                    type="text" 
                                                                    className="branch-input-input"
                                                                    value={state.activeName} 
                                                                    onChange={this.handleChange} 
                                                                    color="secondary"
                                                                    name="activeName"
                                                                    label="Branch Name"
                                                                    onKeyDown={this.detectEnter}
                                                                    variant="outlined" />
                                                             </>
                                                             :
                                                             <>
                                                                {i.branchName}
                                                                <EditIcon className="branch-icon ml-3" onClick={() => this.onInitiateEdit(i)} />
                                                             </>

                                                        }
                                                    </td>
                                                    <td>
                                                        <SupervisorAccountIcon className="branch-icon" onClick={() => this.manageAccount(i)} />
                                                    </td>
                                                    <td>
                                                        <ListAltIcon className="branch-icon" onClick={() => this.manageMenu(i)} />
                                                    </td>
                                                    <td>
                                                        <RemoveCircleIcon className="branch-icon" onClick={() => this.removeList(i)} />
                                                    </td>
                                                </tr>
                                            )
                                        }

                                    </tbody>
                                </table> : <div className="branch-empty">No Branch found. Create one using the Add Button.</div>
                                }


                </div>


                <div className="branch-add" onClick={this.toggleOrderModal}>
                    <AddIcon />
                </div>

                <Modal
                    backdrop={"static"}
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
            </>
        );
    }
}




export default withFirestore(Branch);
