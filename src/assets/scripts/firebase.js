var firebase = require('firebase/app');
require('firebase/firestore');


const firebaseConfig = {
    apiKey: "AIzaSyBfydVgFFuNebHZBrTOI8aRfTHFPtgqfIs",
    authDomain: "tastybox-openbox.firebaseapp.com",
    databaseURL: "https://tastybox-openbox.firebaseio.com",
    projectId: "tastybox-openbox",
    storageBucket: "tastybox-openbox.appspot.com",
    messagingSenderId: "777236657656",
    appId: "1:777236657656:web:f8f0c1d570c240152bd20d",
    measurementId: "G-9DJ7B9Z7SX"
  };
  firebase.initializeApp(firebaseConfig);

  export default firebase;