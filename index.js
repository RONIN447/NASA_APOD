const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const path = require("path"); 
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

// Connecting to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Could not connect to MongoDB:", error));

  // schemaa for apod 
const apodSchema = new mongoose.Schema({
  date: String,
  title: String,
  explanation: String,
  url: String,
  media_type: String,
});

const Apod = mongoose.model("Apod", apodSchema);

// fetching data from the nasa api and storing it in mongodb 
app.get("/api/nasa/apod", async (req, res) => {
  try {
    const { date } = req.query;

    // if already present 
    let apodData = await Apod.findOne({ date: date });
    if (!apodData) {
      // If not, then fetch from NASA API 
      const response = await axios.get(
        `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_API_KEY}${date?`&date=${date}`:""}`);
      apodData = new Apod(response.data);
      await apodData.save();
    }

    res.json(apodData);
  } catch (error) {
    console.error("Error fetching data from NASA API or database", error);
    res.status(500).json({ message: "Error fetching data from NASA API or database", error });
  }
});

//  Fetching All  the APOD Data from the databasee
app.get("/api/nasa/apods", async (req, res) => {
  try {
    const { search = "", sort = "asc" } = req.query;

    // Searching  and Sorting  the data from MongoDB
    const apodData = await Apod.find({ title: new RegExp(search, "i") }).sort({
      date: sort === "asc" ? 1 : -1,
    });

    res.json(apodData);
  } catch (error) {
    console.error("Error fetching data from MongoDB", error);
    res.status(500).json({ message: "Error fetching data from MongoDB", error });
  }
});

app.use(express.static(path.join(__dirname, 'client/build')));

// serving the react app 
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});