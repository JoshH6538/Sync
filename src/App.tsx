import Alert from "./Components/Alert";
import Button from "./Components/Button";
import ListGroup from "./Components/ListGroup";
import Map from "./Components/MapDisplay";

function App() {
  // let items = [
  //   'New York',
  //   'Los Angeles',
  //   'Tokyo',
  //   'London'
  //   ];
  // const handleSelectItem = (item:string) =>
  // {
  //   console.log(item);
  // }

  return(
  <div>
    {/* <ListGroup items={items} heading="Cities" onSelectItem={handleSelectItem}/> */}
    <Alert>
      Hello <span>World</span>
    </Alert>
    {/* <Button onClick={() => {console.log("Clicked");}}>
      Click <span>Here</span>
    </Button> */}
    <Map></Map>
  </div>);
}

export default App;