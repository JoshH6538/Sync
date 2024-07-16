// {items: [], heading: string}
//treat props as immutable
interface Props {
  items: string[];
  heading: string;
  // (item: string) => void
  onSelectItem: (item: string) => void;
}

//treat states as mutable
import { useState } from "react";
function ListGroup({items, heading, onSelectItem}: Props) 
{
  
  // Hook
  const [selectedIndex, setSelectedIndex] = useState(-1);

  //use curly braces to render data dynamically
  //Dynamically makes list with whatever items
  return( 
    //empty acts as Fragment w/o having to import {Fragment}
    <>
      <h1>{heading}</h1>
      {/*Syntax: if(items.length == 0) then print no items found. else: return NULL*/}
      {items.length === 0 ? <p>No item(s) found</p> : null}
      <ul className="list-group">
        {items.map((item,index) => 
          <li className={selectedIndex === index ? 'list-group-item active' : 'list-group-item'}
           key={item} onClick={() => {setSelectedIndex(index);onSelectItem(item);}}>{item}</li>)}
      </ul>
    </>);
}

export default ListGroup;