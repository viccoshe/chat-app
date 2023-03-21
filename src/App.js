import './App.css';
import 'firebase/firestore';
import { getFirestore, Timestamp  } from "firebase/firestore";
import 'firebase/auth';
import 'firebase/analytics';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { useAuthState} from "react-firebase-hooks/auth";
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { doc, setDoc,getDoc, updateDoc  } from "firebase/firestore"; 
import {useState} from "react";
import { useContext } from 'react';


const firebaseConfig = {
  apiKey: "AIzaSyCs-rfElxXlQhym7AJnrPs79fTWaNFXY-Y",
  authDomain: "simple-chat-e9712.firebaseapp.com",
  projectId: "simple-chat-e9712",
  storageBucket: "simple-chat-e9712.appspot.com",
  messagingSenderId: "25047653236",
  appId: "1:25047653236:web:8ace22761f51c942cf2a21"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const provider = new GoogleAuthProvider();


let user;
function App() {

user = onAuthStateChanged(auth, (googleUser) => {
    if (googleUser) {
      user = googleUser;
    } else {
      console.error('user is signed out')
      user = null;
    }
  });


  return (
    <div className="App">
      <header>
      
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() { 
  const signInWithGoogle = () => {
    signInWithPopup(auth, provider);
    console.log(user);
  }

  return (
    <>
      <h1>Sign in</h1>
      <button onClick={signInWithGoogle}>Sign in with Google</button>    
    </>

  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  //const query = messagesRef.orderBy('createdAt').limit(25);
  //const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');

  const uid = user.uid;
  const photoURL = user.photoURL;

  

  const getMessages = async() => {
    const messagesRef = doc(db, "messages", user.uid.toString());
    console.log(messagesRef);
    let messages = {};
   
    const msgSnap = await getDoc(messagesRef);
    if (msgSnap.exists()) {
      console.log("Document data:", msgSnap.data());
      messages = msgSnap.data();
      console.log(messages)
    } else {
      console.log("No such document!"); 
    }
  };
getMessages();
// console.log(messages);


  const sendMessage = async(e) => {
    e.preventDefault();
    await setDoc(doc(db, "messages", uid.toString()), {
      text: formValue,
      createdAt: Timestamp.fromDate(new Date()),
      uid,
      photoURL
    });
    setFormValue('')
  }

  return (
    <>
    <h1>Chat</h1>
      {/* {messages 
      ? messages.map(msg => <ChatMessage key={msg.id} message={msg} />)
    : null} */}
    
    <form onSubmit={sendMessage}>
      <input placeholder="type ur msg" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
      <button type="submit">Send a message</button>
    </form>
    
    </>
  )
}

function ChatMessage(props) {
  const { text, uid } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recevied';

  return (
    <div className={`message ${messageClass}`}>
      {/* <img src={photoURl} /> */}
      <p>{text}</p>

    </div>
  )
}

export default App;
