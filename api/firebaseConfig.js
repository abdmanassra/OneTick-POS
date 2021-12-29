// const firebase = require('firebase/app');
// const firestore = require('firebase/firestore');
// const auth = require('firebase/auth');
// const storage = require('firebase/storage');

const firebaseAdmin = require('firebase-admin');

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAd0wubnL7nxEFETKElipF_LO7ncSwXd1w",
  authDomain: "onetick-b0245.firebaseapp.com",
  projectId: "onetick-b0245",
  storageBucket: "onetick-b0245.appspot.com",
  messagingSenderId: "41263256222",
  appId: "1:41263256222:web:db6c18c3ba7cfb3f52218f",
  measurementId: "G-XWGHPSCW5F"
};

// Initialize Firebase
// const app = firebase.initializeApp(firebaseConfig);

var serviceAccount = require("./serviceAccountKey.json");

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount)
});

// firebaseAdmin.initializeApp(firebaseConfig);

const db = firebaseAdmin.firestore();

  module.exports = {
    firebase: firebaseAdmin,
    db: db,
  };