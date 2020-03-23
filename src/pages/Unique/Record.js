import React, { Component } from 'react';
import { withFirestore } from 'react-firestore';
import Header from '../../components/Header';
import moment from 'moment';

var passwordHash = require('password-hash');
require('firebase/auth');

class Record extends Component {

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
        recordList: [],

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
                    recordList: data.recordList
                })
            }
        });
    }

    render() {
        const state = this.state;

        return (
            <>
                <Header logout branch activeRoute="Records" />
                <div className="branch-container">
                    {
                        state.recordList.length ?
                        <div className="table-responsive">
                            <table className="table table-hover branch-list">
                                <thead>
                                    <tr>
                                        <th className="branch-header-name"></th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        state.recordList.map((i, idx) =>
                                            <tr key={idx}>
                                                <td>
                                                    {i.items.length ? i.items.map((i) => <>{i} <br /></>) : ''}
                                                </td>
                                                <td>
                                                    {i.total}
                                                </td>
                                                <td>
                                                    {i.timestamp ? moment(i.timestamp).format('MMMM Do YYYY, h:mm:ss a') : ''}
                                                </td>
                                            </tr>
                                        )
                                    }

                                </tbody>
                            </table>
                        </div> : <div className="branch-empty">No record found.</div>
                    }


                </div>
            </>
        );
    }
}




export default withFirestore(Record);
