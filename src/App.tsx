import './App.css';
import GoogleAuth from './components/GoogleAuth';

function App() {

  function onLogin(user: any) {
    console.log("Login with:", user);
  }

  function onLogout() {
    console.log("Logout");
  }

  return (
    <div className="App">
      <GoogleAuth onLogin={onLogin} onLogout={onLogout} />
    </div>
  );
}

export default App;
