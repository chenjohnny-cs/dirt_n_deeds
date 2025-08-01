'use strict';
const { useState, useEffect, useContext } = React;

// Custom Icon
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Coordinates for Troy, NY
const lat = 42.7284; 
const lon = -73.6918;

const OpenStreetMap = ({ locations, onSelectLocation, onAddGarden }) => {
  const { user, setUser } = useContext(UserContext);

  const mapContainerRef = React.useRef(null);
  const mapRef = React.useRef(null); // Makes Map Accessible across below functions

  React.useEffect(() => {
    if(mapRef.current) return;  // Prevent Re-Initialization
    if (locations.length === 0) return; // Prevents this from being processed while locations is still undefined
    const map = L.map(mapContainerRef.current).setView([lat, lon], 13); // Initializes Map to Initial Coordinates
    
    mapRef.current = map;

    // Set Up Tile Layer and add it to Map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', // For compliance with OpenStreetMap's Usage Policy
    }).addTo(map);

    for (const location of locations) {
        const marker = L.marker([location.latitude, location.longitude]).addTo(map);
        marker.bindPopup(`
          <h3>${location.name || "Unknown Location"}</h3>
          <p>
            ${location.desc ? `<strong>Description:</strong> ${location.desc}` : ""}<br>
            Latitude: ${location.latitude}<br>
            Longitude: ${location.longitude}<br>
          </p>
        `);        
        marker.on('click', () => onSelectLocation(location.name));
    }
  }, [locations]); // Updates Map whenever locations is updated

  const addNewGardenPin = () => {
    const map = mapRef.current;

    // Places new pin in the center
    const center = map.getCenter();
    const clat = center.lat, clon = center.lng;

    // Adds new pin and its content
    const newMarker = L.marker([clat, clon], { draggable: true, icon: redIcon }).addTo(map);
    const popupContent = `
      <h3>Create New Garden</h3>
      <form id="new-garden-form" aria-labelledby="new-garden-form">
        <label>
          Name:
          <input type="text" id="garden-name" required aria-label="Garden Name" />
        </label><br />
        <label>
          Description:
          <textarea id="garden-desc" aria-label="Garden Description"></textarea>
        </label><br />
        <input type="hidden" id="lat" value="${clat}" />
        <input type="hidden" id="lng" value="${clon}" />
        <button type="submit" aria-label="Submit Garden">Submit</button>
      </form>
    `;
    newMarker.bindPopup(popupContent).openPopup();

    newMarker.on('popupopen', () => { // Ensures Form Added to DOM before attaching EventListener
      setTimeout(() => { // Ensures Form Exists Afterward
        const form = document.getElementById('new-garden-form'); 
        if (form) {
          console.log("Listener added and prevented default on submit.");

          form.addEventListener('submit', (event) => {
            event.preventDefault();
    
            const name = document.getElementById('garden-name').value;
            const desc = document.getElementById('garden-desc').value;
            const latitude = parseFloat(document.getElementById('lat').value);
            const longitude = parseFloat(document.getElementById('lng').value);
            const userid = user.UserInfo.userid;
    
            if (name && desc) {
              onAddGarden({ name, desc, latitude, longitude, userid });
              newMarker.closePopup();
            } else {
              alert("Please fill in both the name and description.");
            }
          });
        } else {
          console.error("Form element not found after popup opened.");
        }
      }, 200); // Delay for next browser repaint cycle
    });
  };

  return (
    <div className="map-container" ref={mapContainerRef} role="region" aria-labelledby="map-heading">
      {/* The OSM map will be rendered here */}
      <h2 id="map-heading" className="sr-only">Map of Locations</h2>

      {user && user.UserInfo && user.UserInfo.userid && user.UserInfo.roles.includes("garden_owner") ? (
        <button onClick={addNewGardenPin} className="add-garden-btn" aria-label="Add New Garden"> + </button>
      ) : null}
    </div>
  );
};

const VolunteerSignUp = ({ selectedLocation, onAddEvent }) => {
  const { user, setUser } = useContext(UserContext);

  const [date, setDate] = React.useState('');
  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevents Reload on Submit
    if(selectedLocation === "NO LOCATION SELECTED")
        alert('No location was selected.')
    else {
        alert(`Signed up for ${selectedLocation} on ${date} from ${startTime} to ${endTime}`);
        const userid = user.UserInfo.userid;

        const newEvent = {
          date: date,
          start_time: startTime,
          end_time: endTime,
          location_name: selectedLocation,
          user_id: userid
        }
  
        onAddEvent( newEvent );

        // Resets form fields
        setDate('');
        setStartTime('');
        setEndTime('');
    }
  };

  return (
    <div>
        {user && user.UserInfo && user.UserInfo.userid ? (
          <form className="volunteer-signup" onSubmit={handleSubmit} aria-labelledby="volunteer-signup-form">
            {/* <h3 id="volunteer-signup-form" className="sr-only">Volunteer Sign-Up Form</h3> */}
            <label>
              Date:
              <input id="vs-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required aria-label="Select Date" />
            </label>
            <label>
              Start Time:
              <input id="vs-start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required aria-label="Select Start Time" />
            </label>
            <label>
              End Time:
              <input id="vs-end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required aria-label="Select End Time" />
            </label>
            <label>
              Location:
              <input id="vs-location" type="text" value={selectedLocation} disabled aria-label="Location Name" />
            </label>
            <button type="submit" aria-label="Submit Volunteer Sign-Up">Sign Up</button>
          </form>
        ) : (
          <div><p>MUST BE SIGNED IN TO VOLUNTEER</p></div>
        )}
    </div>
  );
};

const App = () => {
  const [locationData, setLocationData] = React.useState([]);
  const [selectedLocation, setSelectedLocation] = React.useState("NO LOCATION SELECTED");

  React.useEffect(() => {
    fetch(`${API_URL}/map`)
      .then((response) => response.json())
      .then((data) => setLocationData(data))
      .catch((error) => console.error("Error - Fetching Local Location Data:", error));
  }, []);

  const handleAddGarden = (newGarden) => {
    fetch(`${API_URL}/map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newGarden),
    })
    .then(response => response.json())
    .then(data => {
      setLocationData((prevData) => [...prevData, newGarden]);
      window.location.reload();
    })
    .catch((error) => {
      console.error("Error - handleAddGarden():", error);
    });
  };

  const handleEventSignUp = (newEvent) => {
    fetch(`${API_URL}/volunteer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEvent),
    })
    .then(response => response.json())
    .catch((error) => {
      console.error("Error - handleEventSignUp():", error);
    });
  };

  return (
    <UserProvider>
      <div className="container">
        <Header />
        <main className="main-content">
          <OpenStreetMap locations={locationData} onSelectLocation={setSelectedLocation} onAddGarden={handleAddGarden} />
          <VolunteerSignUp selectedLocation={selectedLocation} onAddEvent={handleEventSignUp} />
        </main>
        <Footer />
      </div>
    </ UserProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
