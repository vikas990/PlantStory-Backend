const mongoose = require("mongoose");

/* to remove MongoDB DeprecationWarning 
(if you remove this you will see a DeprecationWarning warning in the console) */
mongoose.set("strictQuery", false);
// Connecting to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Failed to connect", err));
