import React, { Component } from 'react';
import moment from 'moment';

class Home extends Component {

    state = {
        time: {
            month: '',
            year: ''
        }
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



    render() {
        const state = this.state;

        return (
            <div className="home-container">
                <div className="container">
                    <div className="home-time">{state.time.month} {state.time.year}</div>
                    <div className="home-title">Parking Management System</div>
                    <div className="row">
                        <div className="col-4">
                            <div className="home-card-wrap" onClick={() => this.navigate("/security_guard")}>
                                <div className="home-card-border">
                                    <img className="home-card-img" src={require("../../assets/images/Security Guard.svg")} alt="" />
                                </div>
                                <div className="home-card-caption">Security Guard</div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="home-card-wrap" onClick={() => this.navigate("/administrator")}>
                                <div className="home-card-border">
                                    <img className="home-card-img" src={require("../../assets/images/Administration.svg")} alt="" />
                                </div>
                                <div className="home-card-caption">Administrator</div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="home-card-wrap" onClick={() => this.navigate("/car_checker_driver")}>
                                <div className="home-card-border">
                                    <img className="home-card-img" src={require("../../assets/images/Taxi driver.svg")} alt="" />
                                </div>
                                <div className="home-card-caption">Car Checker/Driver</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}




export default Home;
