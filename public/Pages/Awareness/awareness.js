'use strict';

const App = () => {
  return (
    <div className="container">
      <Header />
      <main className="main-content">
        <section className="resources" aria-labelledby="resources-title" aria-describedby="resources-subtitle">
          <h3 id="resources-title" className="resources-title">Explore Gardening Support</h3>
          <p id="resources-subtitle" className="resources-subtitle">Feel free to click each item to visit the website!</p>

          <div className="resource-category" aria-labelledby="funding-grants">
            <h4 id="funding-grants">Funding & Grants</h4>
            <div className="resource-box">
              <ul>
                <li><a href="https://communitygarden.org/" target="_blank" rel="noopener noreferrer">American Community Gardening Association</a> - <a href="https://communitygarden.org/" target="_blank" rel="noopener noreferrer">Find grants and funding opportunities</a></li>
                <li><a href="https://www.nal.usda.gov/afsic/community-gardening" target="_blank" rel="noopener noreferrer">USDA Community Gardening</a> - <a href="https://www.nal.usda.gov/afsic/community-gardening" target="_blank" rel="noopener noreferrer">Government funding and support for local gardens</a></li>
              </ul>
            </div>
          </div>
          
          <div className="resource-category" aria-labelledby="gardening-guides">
            <h4 id="gardening-guides">Gardening Guides</h4>
            <div className="resource-box">
              <ul>
                <li><a href="https://www.gardeningknowhow.com/" target="_blank" rel="noopener noreferrer">Gardening Know How</a> - <a href="https://www.gardeningknowhow.com/" target="_blank" rel="noopener noreferrer">Expert gardening advice for all skill levels</a></li>
                <li><a href="https://www.almanac.com/gardening" target="_blank" rel="noopener noreferrer">Farmer’s Almanac</a> - <a href="https://www.almanac.com/gardening" target="_blank" rel="noopener noreferrer">Seasonal planting tips and guides</a></li>
              </ul>
            </div>
          </div>
          
          <div className="resource-category" aria-labelledby="community-support">
            <h4 id="community-support">Community Support</h4>
            <div className="resource-box">
              <ul>
                <li><a href="https://communitygarden.org/" target="_blank" rel="noopener noreferrer">Community Gardening Networks</a> - <a href="https://communitygarden.org/" target="_blank" rel="noopener noreferrer">Connect with other gardeners and share resources</a></li>
                <li><a href="https://www.localharvest.org/" target="_blank" rel="noopener noreferrer">Local Harvest</a> - <a href="https://www.localharvest.org/" target="_blank" rel="noopener noreferrer">Find community-supported agriculture (CSA) programs</a></li>
              </ul>
            </div>
          </div>
          
          <div className="resource-category" aria-labelledby="sustainability-food-justice">
            <h4 id="sustainability-food-justice">Sustainability & Food Justice</h4>
            <div className="resource-box">
              <ul>
                <li><a href="https://foodtank.com/" target="_blank" rel="noopener noreferrer">Food Tank</a> - <a href="https://foodtank.com/" target="_blank" rel="noopener noreferrer">Sustainable agriculture and food justice initiatives</a></li>
                <li><a href="https://www.greenamerica.org/" target="_blank" rel="noopener noreferrer">Green America</a> - <a href="https://www.greenamerica.org/" target="_blank" rel="noopener noreferrer">Advocacy for sustainable food systems</a></li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<UserProvider><App /></UserProvider>);
