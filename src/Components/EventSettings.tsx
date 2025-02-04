import '../Styles/EventSettings.css';

export default function EventSettings() {
  return (
    <div id='event-settings-container'>
        <form id='event-settings-form' >
            <div id='radius-settings'>
                <label className='settings-label'>Radius</label>
                <input type='number' placeholder=' 10 - 1000' id='radius' step="1"></input>
                <select id='radiusUnit' className='select-setting'>
                    <option value="miles">Miles</option>
                    <option value="km">km</option>
                </select>
            </div>
            <div id='sort-settings'>
              <label className='settings-label'>Sort By</label>
              <select id='sortObject' className='select-setting'>
                  <option value="name">Name</option>
                  <option value="date">Date</option>
                  <option value="relevance">Relevance</option>
                  <option value="distance">Distance</option>
              </select>
              <select id='sortOrder' className='select-setting'>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
              </select>
            </div>
            <button type='submit' id='event-settings-submit'>Submit</button>
        </form>   
    </div>
  );
}
