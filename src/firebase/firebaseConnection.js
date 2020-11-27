import firebase from "firebase/app";
import "firebase/firestore";

// Initialize Firebase
var config = {
  apiKey: "AIzaSyDBEyB19plQMrvYb-Ao0on3-fRYJv-KT7E",
  authDomain: "fyg-raffle.firebaseapp.com",
  databaseURL: "https://fyg-raffle.firebaseio.com",
  projectId: "fyg-raffle",
  storageBucket: "fyg-raffle.appspot.com",
  messagingSenderId: "1092871946943",
  appId: "1:1092871946943:web:2b80182574b7cc4f29bc0a"
};

// Get a Firestore instance
export const db = firebase.initializeApp(config).firestore();
