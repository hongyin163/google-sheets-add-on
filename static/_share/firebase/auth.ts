import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import app from './index'
const email = "";
const password = "";


const auth = getAuth(app);
const authState: any = {
    isValid: false,
    user: null
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        // const uid = user.uid;
        console.log('login');
        authState.isValid = true;
        authState.user = user;
    } else {
        // User is signed out
        console.log('logout');
        authState.isValid = false;
        authState.user = null;
    }
});


export function login() {
    if (authState.isValid) {
        return Promise.resolve(true)
    }
    return signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log('login', userCredential)
            console.log('user', user);
            // ...
            return userCredential;
        })
        .catch((error) => {
            // const errorCode = error.code;
            // const errorMessage = error.message;
            console.error(error)
        });
}

export function logout() {
    return signOut(auth);
}

export function getUserState() {
    return authState;
}