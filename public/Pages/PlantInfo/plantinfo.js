'use strict';

const { useState } = React;

const PlantInfo = () => {
  const [plants, setPlants] = useState([]);

  const fetchPlants = async () => {
    try {
      const response = await fetch(`${API_URL}/api/plants`);
      if (!response.ok) throw new Error("Failed to fetch plant data");
      const data = await response.json();
      const formattedData = data.map(plant => ({
        id: plant.id,
        common_name: formatText(plant.common_name) || "Unknown Plant",
        scientific_name: plant.scientific_name ? truncateText(plant.scientific_name, 40) : "N/A",
        image_url: plant.image_url || "https://via.placeholder.com/150",
        wikipedia_link: plant.scientific_name 
          ? `https://en.wikipedia.org/wiki/${plant.scientific_name.replace(/ /g, "_")}` 
          : null
      }));
      setPlants(formattedData);
    } catch (error) {
      console.error("Error fetching plant data:", error);
    }
  };

  const formatText = (text) => {
    if (!text) return "";
    return text
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="container">
      <Header />
      <main className="main-content">
        <section className="plant-info-section" role="region" aria-labelledby="plant-info-heading">
          <h3 id="plant-info-heading" className="sr-only">Discover Plant Information</h3>
          <div className="plant-info-box">
            <button className="fetch-plants-btn" onClick={fetchPlants} aria-label="Fetch plant information">Fetch Plant Info</button>
          </div>

          {plants.length > 0 && (
            <table className="plant-table" aria-labelledby="plant-table-heading">
              <caption id="plant-table-heading" className="sr-only">List of Plants</caption>
              <thead>
                <tr>
                  <th scope="col">Image</th>
                  <th scope="col">Common Name</th>
                  <th scope="col">Scientific Name</th>
                  <th scope="col">Wikipedia</th>
                </tr>
              </thead>
              <tbody>
                {plants.map((plant) => (
                  <tr key={plant.id}>
                    <td>
                      <img className="plant-img" src={plant.image_url} alt={`Image of ${plant.common_name}`} />
                    </td>
                    <td>{plant.common_name}</td>
                    <td>{plant.scientific_name}</td>
                    <td>
                      {plant.wikipedia_link ? (
                        <a 
                          href={plant.wikipedia_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="plant-link"
                          aria-label={`Read more about ${plant.common_name} on Wikipedia`}
                        >
                          View on Wikipedia
                        </a>
                      ) : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <UserProvider>
        <PlantInfo />
    </UserProvider>
);
