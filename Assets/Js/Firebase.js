const firebaseConfig = {
  apiKey: "AIzaSyCB3BUOlFWuXNDPS6H0Qxq_QEO01pxDGU8",
  authDomain: "mouse-4b575.firebaseapp.com",
  projectId: "mouse-4b575",
  storageBucket: "mouse-4b575.firebasestorage.app",
  messagingSenderId: "61763141337",
  appId: "1:61763141337:web:169919f06eddd5f81d08c8"
};

firebase.initializeApp(firebaseConfig)
const provider = new firebase.auth.GoogleAuthProvider()
const auth = firebase.auth()
const db = firebase.firestore()
const storage = firebase.storage()

let Usuario = undefined

function Fazer_Login() {
    auth.signInWithPopup(provider).then(() => {
        location.reload()
    })
}

auth.onAuthStateChanged((val) => {
    if(val) {
        Usuario = val
        Excluir_Sala()
    }
})
