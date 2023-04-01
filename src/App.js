import './App.css';
import 'firebase/firestore';
import { getFirestore, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import 'firebase/auth';
import 'firebase/analytics';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { useAuthState} from "react-firebase-hooks/auth";
import { query, orderBy, addDoc  } from "firebase/firestore"; 
import {useState, useEffect, useRef} from "react";

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

function App() {
  const [user] = useAuthState(auth);

  onAuthStateChanged(auth, (googleUser) => {
  if (googleUser) {
    
    return googleUser;
  } else {
    console.error('user is signed out');
   
    return googleUser;
  }
});

  return (
    <div className="App">
      <header>
      <h1>⚛️🔥💬</h1>
      </header>
      <section>
        {user ? <ChatRoom user={user} /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() { 
  const signInWithGoogle = async () => {
    await signInWithPopup(auth, provider);
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

function ChatRoom(props) {
  const [formValue, setFormValue] = useState('');
  const [messages, setMessages] = useState([]);
  const {user} = props.user;
  const scroll = useRef();  
  const {uid, photoURL} = auth.currentUser;

  useEffect (() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt'))
    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      let messages = [];
      QuerySnapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
    });
    return () =>unsubscribe();
  }, [])

  const sendMessage = async(e) => {
    e.preventDefault();
    if( formValue === ''){
      alert('please, enter a valid message')
      return
    }
    await addDoc(collection(db, "messages"), {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    });
    setFormValue('');
    scroll.current.scrollIntoView({behavior: 'smooth'})
  }

  return (
    <>
      <h1>Chat</h1>
        {messages ? messages.map(msg => 
          <ChatMessage key={msg.id} message={msg} />)
        : null}
      
      <form onSubmit={sendMessage}>
        <input placeholder="say something nice" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit">🕊️</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recevied';

  return (
    <div className={`message ${messageClass}`}>
      <img src={props.message.photoURL || 'https://png.pngitem.com/pimgs/s/22-223978_transparent-no-avatar-png-pyrenees-png-download.png'} />
      <p>{text}</p>

    </div>
  )
}

export default App;
