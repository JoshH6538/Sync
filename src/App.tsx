import Alert from "./Components/Alert";
import Button from "./Components/Button";
import ListGroup from "./Components/ListGroup";
import './App.css'
import Map from "./Components/Map";
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home"
import GasMap from "./Pages/GasMap";
import About from "./Pages/About";

function App() {
  // Defines different pages of the site
  let page = <Home/>
  switch(window.location.pathname) {
    case "/":
      page = <Home/>
      break
    case "/GasMap":
      page = <GasMap/>
      break
    case "/About":
      page = <About/>
      break
    default:
      page = <Home/>
      break
  }

  return(
  <div>
    <Navbar></Navbar>
    {page}
  </div>);
}

export default App;