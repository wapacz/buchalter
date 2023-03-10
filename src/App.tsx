import { useEffect, useRef } from 'react';
import './App.css';
import googleapi from './libs/google-api';

function App() {

  const googleButton = useRef(null);

  useEffect(() => {
    googleapi.init(googleButton.current).then(() => {
      googleapi.authenticate(user => console.log("User logged in", user));
    });
    // googleapi.setOnLoginCallback(user => console.log("User logged in", user));
  }, [])

  return (
    <div className="App">
      <div ref={googleButton}></div>
    </div>
  );
}

export default App;
