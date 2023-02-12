// Importing packages
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
// port
const port = process.env.PORT || 4000;
// create app variable
const app = express();
// .env file configuration
dotenv.config();

// setting cors
app.use(cors());

// Parsing data in JSON
app.use(express.json());
// Database connection file
require("./Db/mongoose");

// Routes
app.use(require("./routes/auth"));
app.use(require("./routes/post"));
app.use(require("./routes/user"));

if (process.env.NODE_ENV == "production") {
  app.use(express.static("client/build"));
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
// to start the app we have to make it listen
app.listen(port, () => console.log(`Server up on port:- ${port}`));
