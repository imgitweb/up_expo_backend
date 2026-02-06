require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

connectDB();

app.listen(`${process.env.PORT}`, () => {
  console.log("Server running on port ", process.env.PORT, " 🚀");
  console.log("URL:" + "http://localhost:" + process.env.PORT);
});
