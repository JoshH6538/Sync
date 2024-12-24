import React from 'react';
import '../Styles/EventSettings.css';

export default function EventSettings() {
  return (
    <div id='event-settings-container'>
        <form id='event-settings-form'>
            <div id='radius-settings'>
                <label>Radius</label>
                <input type='number' placeholder=' 10 - 1000' id='radius' step="10"></input>
                <select id='radiusUnit'>
                    <option>miles</option>
                    <option>km</option>
                </select>
            </div>
            <button type='submit' id='event-settings-submit'>Submit</button>
        </form>   
    </div>
  );
}
