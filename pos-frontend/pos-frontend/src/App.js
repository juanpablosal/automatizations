import { Login } from './Login';
import './App.css';
import "./Home";
import {useState} from "react" ; 
import { Home } from './Home';

function App() {

  const [user , setUser] = useState ([])
  return (
    <div className="App">
      {
        !user.length > 0 
        ? <Login setUser={setUser} />
        :<Home user={user} setUser={setUser} />
      }
      
    </div>
  );
}

export default App;
