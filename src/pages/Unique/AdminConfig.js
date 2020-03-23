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

var passwordHash = require('password-hash');
require('firebase/auth');

class AdminConfig extends Component {

    state = {
        modal_invalid: false,
        modal_order: false,
        modal_update: false,

        error: '',

        activeCategory: 1,
        categoryList: [],

        id: '',
        email: '',
        password: '',
        confirm: '',
        name: '',
        currency: ''

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

        this.props.firestore
            .collection(storageInfo.id).doc('info')
            .get()
            .then((res) => {
                const data = res.data();

                localStorage.setItem('info', JSON.stringify(data));
                this.setState({
                    id: data.id,
                    name: data.name,
                    currency: data.currency,
                    country: data.country
                })
            });

        this.props.firestore
            .collection(storageInfo.id).doc('admin')
            .get()
            .then((res) => {
                const data = res.data();

                localStorage.setItem('admin', JSON.stringify(data));
                this.setState({
                    email: data.email
                })
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


        const state = this.state;

        if (
            !state.id ||
            !state.email ||
            !state.country ||
            !state.name ||
            !state.currency ||
            (state.password && !state.confirm) ||
            (!state.confirm && state.password)
        ) {
            this.setState({
                error: 'Please fill necessary fields.'
            });
            this.toggleInvalidModal();
            return;
        }


        if (state.password && state.confirm) {
            if (state.password !== state.confirm) {
                this.setState({
                    error: 'Passwords do not match!'
                });
                this.toggleInvalidModal();
                return;
            }
            else {
                this.props.firestore
                    .collection(state.id).doc('admin')
                    .set({
                        password: passwordHash.generate(state.password)
                    }, {merge: true}).catch((e) => {
                        this.setState({
                            error: 'An error has encountered! Please retry later!'
                        });
                        this.toggleInvalidModal();
                        console.log(e);
                    });
            }
        }

        this.props.firestore
                        .collection(state.id).doc('admin')
                        .set({
                            email: state.email
                        }, {merge: true}).then(() => {
                            this.props.firestore
                                .collection(state.id).doc('info')
                                .set({
                                    country: state.country,
                                    currency: state.currency,
                                    id: state.id,
                                    name: state.name
                                }).then(() => {
                                    this.setState({
                                        error: 'Updated successfully!'
                                    })
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

        handleChange = (e) => {
            this.setState({ [e.target.name]: e.target.value });
        }

        render() {
            const state = this.state;

            return (
                <>
                    <Header logout branch activeRoute="Admin Config" />
                    <div className="admin-container">

                        <TextField
                            type="text"
                            className="admin-input-input"
                            value={state.id}
                            onChange={this.handleChange}
                            color="secondary"
                            name="id"
                            label="TastyBox ID"
                            variant="outlined"
                            disabled
                        />

                        <TextField
                            type="text"
                            className="admin-input-input"
                            value={state.email}
                            onChange={this.handleChange}
                            color="secondary"
                            name="email"
                            label="Email"
                            variant="outlined" />

                        <TextField
                            type="password"
                            className="admin-input-input"
                            value={state.password}
                            onChange={this.handleChange}
                            color="secondary"
                            autoComplete="new-password"
                            placeholder="Leave blank if unchanged"
                            name="password"
                            variant="outlined"
                            label="Password" />
                        <TextField
                            type="password"
                            className="admin-input-input"
                            value={state.confirm}
                            onChange={this.handleChange}
                            placeholder="Leave blank if unchanged"
                            color="secondary"
                            name="confirm"
                            variant="outlined"
                            label="Confirm Password" />
                        <TextField
                            type="text"
                            className="admin-input-input"
                            value={state.name}
                            onChange={this.handleChange}
                            color="secondary"
                            name="name"
                            variant="outlined"
                            label="Organization Name" />
                        <FormControl variant="outlined" color="secondary" className="admin-input-input">
                            <InputLabel htmlFor="input-country" className="admin-label-country">Country</InputLabel>
                            <Select
                                native
                                value={state.country}
                                defaultValue={state.country}
                                onChange={this.handleChange}
                                color="secondary"
                                inputProps={{
                                    name: 'country',
                                    id: 'input-country'
                                }}
                            >
                                <option value="AF">Afghanistan</option>
                                <option value="AX">Åland Islands</option>
                                <option value="AL">Albania</option>
                                <option value="DZ">Algeria</option>
                                <option value="AS">American Samoa</option>
                                <option value="AD">Andorra</option>
                                <option value="AO">Angola</option>
                                <option value="AI">Anguilla</option>
                                <option value="AQ">Antarctica</option>
                                <option value="AG">Antigua and Barbuda</option>
                                <option value="AR">Argentina</option>
                                <option value="AM">Armenia</option>
                                <option value="AW">Aruba</option>
                                <option value="AU">Australia</option>
                                <option value="AT">Austria</option>
                                <option value="AZ">Azerbaijan</option>
                                <option value="BS">Bahamas</option>
                                <option value="BH">Bahrain</option>
                                <option value="BD">Bangladesh</option>
                                <option value="BB">Barbados</option>
                                <option value="BY">Belarus</option>
                                <option value="BE">Belgium</option>
                                <option value="BZ">Belize</option>
                                <option value="BJ">Benin</option>
                                <option value="BM">Bermuda</option>
                                <option value="BT">Bhutan</option>
                                <option value="BO">Bolivia, Plurinational State of</option>
                                <option value="BQ">Bonaire, Sint Eustatius and Saba</option>
                                <option value="BA">Bosnia and Herzegovina</option>
                                <option value="BW">Botswana</option>
                                <option value="BV">Bouvet Island</option>
                                <option value="BR">Brazil</option>
                                <option value="IO">British Indian Ocean Territory</option>
                                <option value="BN">Brunei Darussalam</option>
                                <option value="BG">Bulgaria</option>
                                <option value="BF">Burkina Faso</option>
                                <option value="BI">Burundi</option>
                                <option value="KH">Cambodia</option>
                                <option value="CM">Cameroon</option>
                                <option value="CA">Canada</option>
                                <option value="CV">Cape Verde</option>
                                <option value="KY">Cayman Islands</option>
                                <option value="CF">Central African Republic</option>
                                <option value="TD">Chad</option>
                                <option value="CL">Chile</option>
                                <option value="CN">China</option>
                                <option value="CX">Christmas Island</option>
                                <option value="CC">Cocos (Keeling) Islands</option>
                                <option value="CO">Colombia</option>
                                <option value="KM">Comoros</option>
                                <option value="CG">Congo</option>
                                <option value="CD">Congo, the Democratic Republic of the</option>
                                <option value="CK">Cook Islands</option>
                                <option value="CR">Costa Rica</option>
                                <option value="CI">Côte d'Ivoire</option>
                                <option value="HR">Croatia</option>
                                <option value="CU">Cuba</option>
                                <option value="CW">Curaçao</option>
                                <option value="CY">Cyprus</option>
                                <option value="CZ">Czech Republic</option>
                                <option value="DK">Denmark</option>
                                <option value="DJ">Djibouti</option>
                                <option value="DM">Dominica</option>
                                <option value="DO">Dominican Republic</option>
                                <option value="EC">Ecuador</option>
                                <option value="EG">Egypt</option>
                                <option value="SV">El Salvador</option>
                                <option value="GQ">Equatorial Guinea</option>
                                <option value="ER">Eritrea</option>
                                <option value="EE">Estonia</option>
                                <option value="ET">Ethiopia</option>
                                <option value="FK">Falkland Islands (Malvinas)</option>
                                <option value="FO">Faroe Islands</option>
                                <option value="FJ">Fiji</option>
                                <option value="FI">Finland</option>
                                <option value="FR">France</option>
                                <option value="GF">French Guiana</option>
                                <option value="PF">French Polynesia</option>
                                <option value="TF">French Southern Territories</option>
                                <option value="GA">Gabon</option>
                                <option value="GM">Gambia</option>
                                <option value="GE">Georgia</option>
                                <option value="DE">Germany</option>
                                <option value="GH">Ghana</option>
                                <option value="GI">Gibraltar</option>
                                <option value="GR">Greece</option>
                                <option value="GL">Greenland</option>
                                <option value="GD">Grenada</option>
                                <option value="GP">Guadeloupe</option>
                                <option value="GU">Guam</option>
                                <option value="GT">Guatemala</option>
                                <option value="GG">Guernsey</option>
                                <option value="GN">Guinea</option>
                                <option value="GW">Guinea-Bissau</option>
                                <option value="GY">Guyana</option>
                                <option value="HT">Haiti</option>
                                <option value="HM">Heard Island and McDonald Islands</option>
                                <option value="VA">Holy See (Vatican City State)</option>
                                <option value="HN">Honduras</option>
                                <option value="HK">Hong Kong</option>
                                <option value="HU">Hungary</option>
                                <option value="IS">Iceland</option>
                                <option value="IN">India</option>
                                <option value="ID">Indonesia</option>
                                <option value="IR">Iran, Islamic Republic of</option>
                                <option value="IQ">Iraq</option>
                                <option value="IE">Ireland</option>
                                <option value="IM">Isle of Man</option>
                                <option value="IL">Israel</option>
                                <option value="IT">Italy</option>
                                <option value="JM">Jamaica</option>
                                <option value="JP">Japan</option>
                                <option value="JE">Jersey</option>
                                <option value="JO">Jordan</option>
                                <option value="KZ">Kazakhstan</option>
                                <option value="KE">Kenya</option>
                                <option value="KI">Kiribati</option>
                                <option value="KP">Korea, Democratic People's Republic of</option>
                                <option value="KR">Korea, Republic of</option>
                                <option value="KW">Kuwait</option>
                                <option value="KG">Kyrgyzstan</option>
                                <option value="LA">Lao People's Democratic Republic</option>
                                <option value="LV">Latvia</option>
                                <option value="LB">Lebanon</option>
                                <option value="LS">Lesotho</option>
                                <option value="LR">Liberia</option>
                                <option value="LY">Libya</option>
                                <option value="LI">Liechtenstein</option>
                                <option value="LT">Lithuania</option>
                                <option value="LU">Luxembourg</option>
                                <option value="MO">Macao</option>
                                <option value="MK">Macedonia, the former Yugoslav Republic of</option>
                                <option value="MG">Madagascar</option>
                                <option value="MW">Malawi</option>
                                <option value="MY">Malaysia</option>
                                <option value="MV">Maldives</option>
                                <option value="ML">Mali</option>
                                <option value="MT">Malta</option>
                                <option value="MH">Marshall Islands</option>
                                <option value="MQ">Martinique</option>
                                <option value="MR">Mauritania</option>
                                <option value="MU">Mauritius</option>
                                <option value="YT">Mayotte</option>
                                <option value="MX">Mexico</option>
                                <option value="FM">Micronesia, Federated States of</option>
                                <option value="MD">Moldova, Republic of</option>
                                <option value="MC">Monaco</option>
                                <option value="MN">Mongolia</option>
                                <option value="ME">Montenegro</option>
                                <option value="MS">Montserrat</option>
                                <option value="MA">Morocco</option>
                                <option value="MZ">Mozambique</option>
                                <option value="MM">Myanmar</option>
                                <option value="NA">Namibia</option>
                                <option value="NR">Nauru</option>
                                <option value="NP">Nepal</option>
                                <option value="NL">Netherlands</option>
                                <option value="NC">New Caledonia</option>
                                <option value="NZ">New Zealand</option>
                                <option value="NI">Nicaragua</option>
                                <option value="NE">Niger</option>
                                <option value="NG">Nigeria</option>
                                <option value="NU">Niue</option>
                                <option value="NF">Norfolk Island</option>
                                <option value="MP">Northern Mariana Islands</option>
                                <option value="NO">Norway</option>
                                <option value="OM">Oman</option>
                                <option value="PK">Pakistan</option>
                                <option value="PW">Palau</option>
                                <option value="PS">Palestinian Territory, Occupied</option>
                                <option value="PA">Panama</option>
                                <option value="PG">Papua New Guinea</option>
                                <option value="PY">Paraguay</option>
                                <option value="PE">Peru</option>
                                <option value="PH">Philippines</option>
                                <option value="PN">Pitcairn</option>
                                <option value="PL">Poland</option>
                                <option value="PT">Portugal</option>
                                <option value="PR">Puerto Rico</option>
                                <option value="QA">Qatar</option>
                                <option value="RE">Réunion</option>
                                <option value="RO">Romania</option>
                                <option value="RU">Russian Federation</option>
                                <option value="RW">Rwanda</option>
                                <option value="BL">Saint Barthélemy</option>
                                <option value="SH">Saint Helena, Ascension and Tristan da Cunha</option>
                                <option value="KN">Saint Kitts and Nevis</option>
                                <option value="LC">Saint Lucia</option>
                                <option value="MF">Saint Martin (French part)</option>
                                <option value="PM">Saint Pierre and Miquelon</option>
                                <option value="VC">Saint Vincent and the Grenadines</option>
                                <option value="WS">Samoa</option>
                                <option value="SM">San Marino</option>
                                <option value="ST">Sao Tome and Principe</option>
                                <option value="SA">Saudi Arabia</option>
                                <option value="SN">Senegal</option>
                                <option value="RS">Serbia</option>
                                <option value="SC">Seychelles</option>
                                <option value="SL">Sierra Leone</option>
                                <option value="SG">Singapore</option>
                                <option value="SX">Sint Maarten (Dutch part)</option>
                                <option value="SK">Slovakia</option>
                                <option value="SI">Slovenia</option>
                                <option value="SB">Solomon Islands</option>
                                <option value="SO">Somalia</option>
                                <option value="ZA">South Africa</option>
                                <option value="GS">South Georgia and the South Sandwich Islands</option>
                                <option value="SS">South Sudan</option>
                                <option value="ES">Spain</option>
                                <option value="LK">Sri Lanka</option>
                                <option value="SD">Sudan</option>
                                <option value="SR">Suriname</option>
                                <option value="SJ">Svalbard and Jan Mayen</option>
                                <option value="SZ">Swaziland</option>
                                <option value="SE">Sweden</option>
                                <option value="CH">Switzerland</option>
                                <option value="SY">Syrian Arab Republic</option>
                                <option value="TW">Taiwan, Province of China</option>
                                <option value="TJ">Tajikistan</option>
                                <option value="TZ">Tanzania, United Republic of</option>
                                <option value="TH">Thailand</option>
                                <option value="TL">Timor-Leste</option>
                                <option value="TG">Togo</option>
                                <option value="TK">Tokelau</option>
                                <option value="TO">Tonga</option>
                                <option value="TT">Trinidad and Tobago</option>
                                <option value="TN">Tunisia</option>
                                <option value="TR">Turkey</option>
                                <option value="TM">Turkmenistan</option>
                                <option value="TC">Turks and Caicos Islands</option>
                                <option value="TV">Tuvalu</option>
                                <option value="UG">Uganda</option>
                                <option value="UA">Ukraine</option>
                                <option value="AE">United Arab Emirates</option>
                                <option value="GB">United Kingdom</option>
                                <option value="US">United States</option>
                                <option value="UM">United States Minor Outlying Islands</option>
                                <option value="UY">Uruguay</option>
                                <option value="UZ">Uzbekistan</option>
                                <option value="VU">Vanuatu</option>
                                <option value="VE">Venezuela, Bolivarian Republic of</option>
                                <option value="VN">Viet Nam</option>
                                <option value="VG">Virgin Islands, British</option>
                                <option value="VI">Virgin Islands, U.S.</option>
                                <option value="WF">Wallis and Futuna</option>
                                <option value="EH">Western Sahara</option>
                                <option value="YE">Yemen</option>
                                <option value="ZM">Zambia</option>
                                <option value="ZW">Zimbabwe</option>
                            </Select>
                        </FormControl>
                        <TextField
                            type="text"
                            className="admin-input-input"
                            value={state.currency}
                            onChange={this.handleChange}
                            color="secondary"
                            name="currency"
                            variant="outlined"
                            label="Currency" />



                        <div className="text-center">
                            <div
                                className="admin-btn-confirm"
                                onClick={this.toggleUpdateModal}
                            >
                                Update
                                </div>
                        </div>


                    </div>


                    {/* <div className="admin-add" onClick={this.toggleOrderModal}>
                    <AddIcon />
                </div> */}

                    <Modal
                        backdrop={"static"}
                        backdropClassName={"shared-modal-backdrop"}
                        centered
                        isOpen={state.modal_order}
                        toggle={this.toggleOrderModal}
                        className="shared-modal-container shared-modal-wrap admin-modal-category-wrap"
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
                                        OK
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
                                </div>
                            </div>
                        </ModalBody>
                    </Modal>
                </>
            );
        }
    }




    export default withFirestore(AdminConfig);
