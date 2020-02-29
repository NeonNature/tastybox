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
import AddAlertIcon from '@material-ui/icons/AddAlert';

var passwordHash = require('password-hash');
require('firebase/auth');

class Order extends Component {

    state = {
        modal_invalid: false,
        modal_order: false,
        modal_confirm: false,
        modal_queue: false,
        queueInput: '',

        error: '',

        activeCategory: 1,
        categoryList: [],
        orderId: '',
        currency: 'MMK',
        masterCategoryList: [
            {
                categoryID: 1,
                categoryName: 'Drinks'
            },
            {
                categoryID: 2,
                categoryName: 'Ice Creams'
            }
        ],
        masterRecipeList: [
            {
                recipeID: 1,
                recipeName: 'Hot Chocolate',
                price: 3000,
                categoryID: 1
            },
            {
                recipeID: 2,
                recipeName: 'Strawberry Shake',
                price: 3500,
                categoryID: 1
            },
            {
                recipeID: 3,
                recipeName: 'Chocolate Ice Creams',
                price: 1000,
                categoryID: 2
            },
            {
                recipeID: 4,
                recipeName: 'Strawberry Ice Creams',
                price: 1500,
                categoryID: 2
            }
        ],

        orderList: [],
        addList: [],

        desc: ''
    }

    componentDidMount() {
        this.setState({
            time: {
                month: moment().format('MMM').toUpperCase(),
                year: moment().format('YYYY')
            }
        });

        let categoryList = [], 
            addList = [];

        this.state.masterCategoryList.map((i, idx) => {
            categoryList.push({
                categoryID: i.categoryID,
                categoryName: i.categoryName
            })

            if (idx === 0) {
                this.setState({
                    activeCategory: i.categoryID
                })
                this.state.masterRecipeList.map((o, odx) => {
                    if (o.categoryID === i.categoryID) {
                        addList.push(o)
                    }
                })
            }
        });

        this.setState({
            categoryList,
            addList
        })
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

    toggleQueueModal = () => {
        const val = this.state.modal_queue;

        this.setState({
            modal_queue: !val
        })
    }

    toggleConfirmModal = () => {
        const val = this.state.modal_confirm;

        this.setState({
            modal_confirm: !val
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

    confirmOrder = () => {
        this.toggleConfirmModal();
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    confirmQueue = () => {
        this.toggleQueueModal();
    }

    render() {
        const state = this.state;

        return (
            <>
                <Header />
                <div className="order-container">
                   
                         {
                            state.orderList.length ? 
                            <>
                        <table className="table table-hover order-list">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Unit Price</th>
                                    <th>Qty</th>
                                    <th>Total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                state.orderList.map((i, idx) =>
                                    <tr key={idx}>
                                        <td>{i.recipeName}</td>
                                        <td>{i.price + " " + state.currency}</td>
                                        <td>{i.qty}</td>
                                        <td>{(i.price * i.qty) + " " + state.currency}</td>
                                        <td>
                                            <RemoveCircleIcon className="order-remove" onClick={() => this.removeList(i.recipeID)} />
                                        </td>
                                    </tr>
                                )
                            }

                        </tbody>
                    </table>

                    
                    <TextField 
                                type="text" 
                                className="order-input-input"
                                value={state.tableNo} 
                                onChange={this.handleChange} 
                                color="secondary"
                                name="tableNo"
                                label="Table No."
                                variant="outlined" />

                    <TextField 
                                type="text" 
                                className="order-input-input"
                                value={state.desc} 
                                onChange={this.handleChange} 
                                color="secondary"
                                name="desc"
                                label="Additional Description"
                                multiline
                                variant="outlined"
                                rows="4" />
                    </> : <div className="order-empty">Order is currently empty</div>
                        }
                        
                    {
                        state.orderList.length ? 
                        <div className="text-center">
                                    <div
                                        className="order-btn-confirm"
                                        onClick={this.toggleConfirmModal}
                                    >
                                        Confirm
                            </div>
                        </div> : ''
                    }

                    
                </div>


                <div className="order-add" onClick={this.toggleOrderModal}>
                    <AddIcon />
                </div>
                <div className="order-queue" onClick={this.toggleQueueModal}>
                    <AddAlertIcon />
                </div>

                <Modal
                    backdrop={"static"}
                    backdropClassName={"shared-modal-backdrop"}
                    centered
                    isOpen={state.modal_order}
                    toggle={this.toggleOrderModal}
                    className="shared-modal-container shared-modal-wrap order-modal-category-wrap"
                >
                    <ModalBody>
                        <div className="shared-modal-close" onClick={this.toggleOrderModal}>
                            <span>&#10005;</span>
                        </div>
                        <div className="shared-modal-content">
                            <div className="order-category-wrap">
                                {
                                    state.categoryList.map ((i, idx) => 
                                    <div onClick={ state.activeCategory === i.categoryID ? null : () => this.selectCategory(i)} key={idx} className={ state.activeCategory === i.categoryID ? "order-category-block active": "order-category-block"}>
                                        {i.categoryName}
                                    </div>
                                    )
                                }
                                
                            </div>
                            <hr />

                                {
                                    state.addList.length ?
                                    <table className="table table-hover order-list">
                                        <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Unit Price</th>
                                            <th></th>
                                        </tr>
                                        </thead>
                                    <tbody>
                                        {
                                            state.addList.map((i, idx) =>
                                                <tr key={idx}>
                                                    <td>{i.recipeName}</td>
                                                    <td>{i.price + " " + state.currency}</td>
                                                    <td>
                                                        <AddCircleIcon className="order-remove" onClick={() => this.addList(i)} />
                                                    </td>
                                                </tr>
                                            )
                                        }

                                    </tbody>
                                </table> : <div className="order-empty">Category is currently empty</div>
                                }
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

                {/* Queue Modal */}

                <Modal
                    backdropClassName={"shared-modal-backdrop"}
                    centered
                    isOpen={state.modal_queue}
                    toggle={this.toggleQueueModal}
                    className="shared-modal-container shared-modal-wrap"
                >
                    <ModalBody>
                        <div className="shared-modal-close" onClick={this.toggleQueueModal}>
                            <span>&#10005;</span>
                        </div>
                        <div className="shared-modal-content">
                                <TextField 
                                type="number" 
                                className="order-input-input"
                                value={state.queueInput} 
                                onChange={this.handleChange} 
                                color="secondary"
                                name="queueInput"
                                label="Queue No."
                                variant="outlined" />
                            <div className="shared-modal-btn-wrap">
                                <div
                                    className="shared-modal-btn-main"
                                    onClick={this.confirmQueue}
                                >
                                    Call
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                </Modal>


                {/* Confirm Modal */}

                <Modal
                    backdropClassName={"shared-modal-backdrop"}
                    centered
                    isOpen={state.modal_confirm}
                    toggle={this.toggleConfirmModal}
                    className="shared-modal-container shared-modal-wrap"
                >
                    <ModalBody>
                        <div className="shared-modal-close" onClick={this.toggleConfirmModal}>
                            <span>&#10005;</span>
                        </div>
                        <div className="shared-modal-content">
                            <p>Are you sure you want to confirm the order?</p>
                            <div className="shared-modal-btn-wrap">
                                <div
                                    className="shared-modal-btn-main"
                                    onClick={this.confirmOrder}
                                >
                                    Confirm
                            </div>
                                <div
                                className="shared-modal-btn-secondary"
                                onClick={this.toggleConfirmModal}
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




export default withFirestore(Order);
