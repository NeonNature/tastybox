import React, { Component } from 'react';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { withRouter } from "react-router";
import StoreIcon from '@material-ui/icons/Store';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import { Modal, ModalBody } from 'reactstrap';

class Header extends Component {
    state = {
        storageList: [
            'admin',
            'info',
            'role',
            'serviceType'
        ],
        modal_logout: false
    }

    logout = () => {
        this.toggleLogoutModal();
    }

    confirmLogout = () => {
        this.state.storageList.map((i) =>
            localStorage.removeItem(i)
        );
        this.props.history.push('/')
    }

    back = () => {
        this.props.history.goBack();
    }

    navigate = (url) => {
        this.props.history.push(url)
    }
    
    toggleLogoutModal = () => {
        const val = this.state.modal_logout;

        this.setState({
            modal_logout: !val
        })
    }

    render() {
        const props = this.props,
            state = this.state;
        
        return ( <>
                    <div className="header-container">
                        <div className="header-left">
                            {
                                props.logout ? <MeetingRoomIcon className="header-back" onClick={() => this.logout()} /> : ''
                            }
                            {
                                props.back ? <ArrowBackIosIcon className="header-back" onClick={() => this.back()} /> : ''
                            }
                        </div>
                        <div className="header-center">
                            {props.activeRoute}
                        </div>
                        <div className="header-right">
                            {
                                props.branch ? <StoreIcon className="header-icon" onClick={() => this.navigate('/branch')} /> : ''
                            }
                            {
                                props.admin ? <SupervisorAccountIcon className="header-icon" onClick={() => this.navigate('/config')} /> : ''
                            }
                        </div>
                    </div>

                    <Modal
                    backdropClassName={"shared-modal-backdrop"}
                    centered
                    isOpen={state.modal_logout}
                    toggle={this.toggleLogoutModal}
                    className="shared-modal-container shared-modal-wrap"
                >
                    <ModalBody>
                        <div className="shared-modal-close" onClick={this.toggleLogoutModal}>
                            <span>&#10005;</span>
                        </div>
                        <div className="shared-modal-content">
                            <p>Are you sure you want to log out?</p>
                            <div className="shared-modal-btn-wrap">
                                <div
                                    className="shared-modal-btn-main"
                                    onClick={this.confirmLogout}
                                >
                                    Log out
                            </div>
                            </div>
                        </div>
                    </ModalBody>
                </Modal>
                </>
        )
    }
};

export default withRouter(Header);