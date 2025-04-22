import "../Styles/EventSettings.css";

export default function EventSettings() {
  return (
    <div className="container my-4" id="event-settings-container">
      <form id="event-settings-form">
        {/* Row 1: Radius and Sort Settings */}

        <div className="row">
          {/* Radius Settings */}
          <div className="col-12 col-md-6 mb-4" id="radius-settings">
            {/* Mobile Label */}
            <label
              htmlFor="radius"
              className="form-label d-block d-md-none fw-300 text-light"
            >
              Radius
            </label>
            <div className="row align-items-center">
              {/* Desktop Label */}
              <label
                htmlFor="radius"
                className="col-2 col-form-label d-none d-md-block fw-300 text-light"
              >
                Radius
              </label>
              {/* Number Input */}
              <div className="col-12 col-md-6">
                <input
                  type="number"
                  className="form-control"
                  id="radius"
                  placeholder="10 - 1000"
                  step="1"
                  style={{ backgroundColor: "#cacaca" }}
                />
              </div>
              {/* Unit Selector */}
              <div className="col-12 col-md-3 mt-2 mt-md-0">
                <select id="radiusUnit" className="form-select">
                  <option value="miles">Mi</option>
                  <option value="km">Km</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sort Settings */}
          <div className="col-12 col-md-6 mb-4" id="sort-settings">
            {/* Mobile Label */}
            <label
              htmlFor="sortObject"
              className="form-label fw-300 text-white d-block d-md-none"
            >
              Sort
            </label>
            <div className="row align-items-center">
              {/* Desktop Label */}
              <label
                htmlFor="sortObject"
                className="col-2 col-form-label fw-300 text-white d-none d-md-block"
              >
                Sort by
              </label>
              <div className="col-12 col-md-8">
                <select id="sortObject" className="form-select">
                  <option value="name">Name</option>
                  <option value="date">Date</option>
                  <option value="relevance">Relevance</option>
                  <option value="distance" selected>
                    Distance
                  </option>
                </select>
              </div>
              <div className="col-12 col-md-2 mt-2 mt-md-0">
                <select id="sortOrder" className="form-select">
                  <option value="asc" selected>
                    ↑
                  </option>
                  <option value="desc">↓</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Submit Button */}
        <div className="row">
          <div className="col-12 text-center">
            <button
              type="submit"
              className="btn btn-primary"
              id="event-settings-submit"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
