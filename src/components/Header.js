import React, { Component } from 'react';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

class Header extends Component {
    state = {
    }

    back = () => {
        this.props.history.goBack();
    }

    render() {
        
        return ( <>
                    <div className="header-container">
                        <div className="header-left">
                            {
                                <ArrowBackIosIcon className="header-icon" onClick={() => this.back} />
                            }
                        </div>
                        <div className="header-center">
                            {this.props.activeRoute}
                        </div>
                        <div className="header-right">

                        </div>
                    </div>
                </>
        )
    }
};

export default Header;