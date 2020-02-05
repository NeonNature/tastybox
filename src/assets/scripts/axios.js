import axios from 'axios';

const instance = axios.create({
    //baseURL: 'https://api.autofutura.com/services/dev/'
});

export default instance;