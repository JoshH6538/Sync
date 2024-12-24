import React from 'react';
import '../Styles/EventSettings.css';

export default function EventSettings() {
  return (
    <div id='event-settings-container'>
        <form id='event-settings-form'>
            <div id='radius-settings'>
                <label className='settings-label'>Radius</label>
                <input type='number' placeholder=' 10 - 1000' id='radius' step="10"></input>
                <select id='radiusUnit' className='select-setting'>
                    <option>miles</option>
                    <option>km</option>
                </select>
            </div>
            <div id='sort-settings'>
              <label className='settings-label'>Sort By</label>
              <select id='sortObject' className='select-setting'>
                  <option>name</option>
                  <option>date</option>
                  <option>relevance</option>
                  <option>distance</option>
              </select>
              <select id='sortOrder' className='select-setting'>
                  <option>asc</option>
                  <option>desc</option>
              </select>
            </div>
            <button type='submit' id='event-settings-submit'>Submit</button>
        </form>   
    </div>
  );
}
