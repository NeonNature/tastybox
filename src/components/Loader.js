import React, { Component } from 'react';
import { Portal } from 'react-portal';

class Loader extends Component {
    render() {

        return (
            <>
            {
                this.props.loading ?
                <Portal>
                    <div className="load_wrapper">
                    <img alt="" src={require("../assets/images/loader.svg")} className="load_loader" />
                    </div>
                </Portal> : ''
            }
            </>
        )
    }
};

export default Loader;