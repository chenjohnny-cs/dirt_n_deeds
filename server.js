require('dotenv').config();
const express = require('express');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { Server } = require('socket.io');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { error } = require('console'); // May need to remove, might be unecessary
const map_uri = process.env.MAP_DB;

const map_client = new MongoClient(map_uri, {
  serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
  },
  // tlsAllowInvalidCertificates: true,
  tls: true // Important for Atlas
});
(async () => {
  try {
    await map_client.connect();
    console.log("Connected to map_client!");
  } catch (err) {
    console.error("Failed to connect to map_client:", err);
  }
})();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.io = io;

io.on('connection', (socket) => {
  console.log("Client connected:", socket.id);

  socket.on('disconnect', () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use(express.static('public'));

// Routes are essentially allowing us to have all the methods in other files
// and route API methods to methods. Keeps code more clean and theres probably
// other benefits that I cba to learn about rn

app.use('/forum', require('./routes/forumRoute'));  // Forum Route
app.use('/users', require('./routes/userRoute'));   // User Creation Route
app.use('/auth', require('./routes/authRoute'));    // Authentication Route

// Plant Page
const API_TOKEN = process.env.TREFLE_TOKEN;

app.get('/api/plants', (req, res) => {
  https.get(`https://trefle.io/api/v1/plants?token=${API_TOKEN}`, (apiRes) => 
  {
    let data = '';
    apiRes.on('data', (chunk) => (data += chunk));
    apiRes.on('end', () => 
      {
      try 
      {
        const parsedData = JSON.parse(data);
        if (!parsedData.data) throw new Error("Invalid response from Trefle API");
        res.json(parsedData.data.map(plant => ({
          id: plant.id,
          common_name: plant.common_name || "Unknown Plant",
          scientific_name: plant.scientific_name || "N/A",
          image_url: plant.image_url || 'https://via.placeholder.com/150',
          wikipedia: plant.scientific_name ? `https://en.wikipedia.org/wiki/${plant.scientific_name.replace(/ /g, "_")}` : null
        })));
      } 
      catch (error) 
      {
        res.status(500).json({ error: "Failed to parse plant data" });
      }
    });
    apiRes.on('error', () => res.status(500).json({ error: "Failed to fetch plant data" }));
  });
});

// Map Endpoints

app.get('/map', async (req, res) => {
  try {
    const map_db = map_client.db("ITWS4500Cheerios_MapDatabase");
    const garden_locations_collection = map_db.collection("GardenLocations");
    
    const allDocuments = await garden_locations_collection.find({}).toArray();

    res.status(200).json(allDocuments);
  } catch(e) {
      console.error("Error - Fetching all Documents from MongoDB:", e),
      res.status(500).send({error: "Error - Fetching all Documents from MongoDB"});
  }
});

app.get('/map/:userid', async (req, res) => {
  const userid = req.params.userid;

  try {
    const map_db = map_client.db("ITWS4500Cheerios_MapDatabase");
    const garden_locations_collection = map_db.collection("GardenLocations");

    const allDocuments = await garden_locations_collection.find({
      garden_owner: userid
    }).toArray();

    res.status(200).json(allDocuments);
  } catch(e) {
    console.error("Error - Fetching user's gardens from MongoDB:", e);
    res.status(500).send({ error: "Error - Fetching user's gardens from MongoDB" });
  }
});

app.delete('/map', async (req, res) => {
  const _id = req.body._id;
  const name = req.body.name;
  const lat = parseFloat(req.body.latitude);
  const lon = parseFloat(req.body.longitude);
  const desc = req.body.desc;
  const owner = req.body.garden_owner

  try {
    const map_db = map_client.db("ITWS4500Cheerios_MapDatabase");
    const garden_locations_collection = map_db.collection("GardenLocations");

    const result = await garden_locations_collection.deleteOne({
      name: name,
      latitude: lat,
      longitude: lon,
      desc: desc,
      garden_owner: owner
    });

    res.status(204).json({ message: `Owned garden associated with ${_id} deleted.` });
  } catch(e) {
    console.error("Error - Deleting an owned garden from MongoDB:", e);
    res.status(500).send({ error: "Error - Deleting an owned garden from MongoDB" });
  }
});

app.put('/map', async (req, res) => {
  // console.log(req.body);
  const _id = req.body.garden._id;
  const locName = req.body.garden.name;
  const lat = parseFloat(req.body.garden.latitude);
  const lon = parseFloat(req.body.garden.longitude);
  const descToUpdate = req.body.garden.desc;
  const owner = req.body.garden.garden_owner

  try {
    const map_db = map_client.db("ITWS4500Cheerios_MapDatabase");
    const garden_locations_collection = map_db.collection("GardenLocations");
    
    // console.log(`${locName} ${owner} ${descToUpdate}`);

    const result = await garden_locations_collection.updateOne({
      name: locName,
      latitude: lat,
      longitude: lon,
      garden_owner: owner
    },
    { $set: { 
      desc: descToUpdate 
    } });

    // if (result.modifiedCount === 0) 
    //   console.log('None found');

    // console.log(`Owned garden associated with ${_id} updated.`);
    res.status(204).json({ message: `Owned garden associated with ${_id} updated.` });
  } catch(e) {
    console.error("Error - Updating an owned garden from MongoDB:", e);
    res.status(500).send({ error: "Error - Updating an owned garden from MongoDB" });
  }
});

app.post('/map', async (req, res) => {
  try {
    const { name, desc, latitude, longitude, userid } = req.body;
    const map_db = map_client.db("ITWS4500Cheerios_MapDatabase");
    const garden_locations_collection = map_db.collection("GardenLocations");

    const result = await garden_locations_collection.insertOne({
      name,
      latitude,
      longitude,
      desc,
      garden_owner: userid,
    });

    res.status(201).json({ message: "Garden added successfully" });
  } catch (error) {
    console.error("Error - Adding One Garden to MongoDB:", error);
    res.status(500).send({ error: "Error - Adding One Garden to MongoDB" });
  }
});

// Volunteer Endpoints

app.get('/volunteer/:userid', async (req, res) => {
  const userid = req.params.userid;

  try {
    const volunteer_db = map_client.db("ITWS4500Cheerios_VolunteerDatabase");
    const volunteer_sign_ups_collection = volunteer_db.collection("VolunteerSignUps");

    const allDocuments = await volunteer_sign_ups_collection.find({
      user_id: userid
    }).toArray();

    res.status(200).json(allDocuments);
  } catch(e) {
    console.error("Error - Fetching user's volunteer stuff from MongoDB:", e);
    res.status(500).send({ error: "Error - Fetching user's volunteer stuff from MongoDB" });
  }
});

app.delete('/volunteer', async (req, res) => {
  const { _id, date, start_time, end_time, location_name, user_id } = req.body;

  try {
    const volunteer_db = map_client.db("ITWS4500Cheerios_VolunteerDatabase");
    const volunteer_sign_ups_collection = volunteer_db.collection("VolunteerSignUps");

    const result = await volunteer_sign_ups_collection.deleteOne({
      date: date,
      start_time: start_time,
      end_time: end_time,
      location_name: location_name,
      user_id: user_id
    });

    res.status(204).json({ message: `Upcoming volunteering event associated with ${_id} deleted.` });
  } catch(e) {
    console.error("Error - Deleting an upcoming volunteering event from MongoDB:", e);
    res.status(500).send({ error: "Error - Deleting an upcoming volunteering event from MongoDB" });
  }
});

app.post('/volunteer', async (req, res) => {
  try {
    const { date, start_time, end_time, location_name, user_id } = req.body;
    const volunteer_db = map_client.db("ITWS4500Cheerios_VolunteerDatabase");
    const volunteer_sign_ups_collection = volunteer_db.collection("VolunteerSignUps");

    const result = await volunteer_sign_ups_collection.insertOne({
      date,
      start_time,
      end_time,
      location_name,
      user_id
    });

    res.status(201).json({ message: "Signed up to volunteer succesfully" });
  } catch (error) {
    console.error("Error - Adding One Event to MongoDB:", error);
    res.status(500).send({ error: "Error - Adding One Event to MongoDB" });
  }
});

server.listen(process.env.PORT, () => {
  console.log('Listening on port', process.env.PORT);
});
