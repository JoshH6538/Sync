import Alert from "./Components/LocationPrompt";
import Button from "./Components/Button";
import ListGroup from "./Components/ListGroup";
import './App.css'
import Map from "./Components/Map";
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home"
import GasMap from "./Pages/GasMap";
import About from "./Pages/About";

function App() {
  let latitude = 0;
  let longitude = 0;
  // Defines different pages of the site
  let page = <Home lat={(latitude)} long={longitude}/>
  switch(window.location.pathname) {
    case "/":
      page = <Home lat={(latitude)} long={longitude}/>
      break
    case "/GasMap":
      page = <GasMap/>
      break
    case "/About":
      page = <About/>
      break
    default:
      page = <Home lat={(latitude)} long={longitude}/>
      break
  }

  

  return(
  <div>
    <Navbar></Navbar>
    {page}
  </div>);
}

export default App;