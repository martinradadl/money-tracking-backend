import express from "express";
import { initMongo } from "./mongo-setup";
import transactions from "./routes/transactions";
import cors from "cors";
import bodyParser from "body-parser";

const jsonParser = bodyParser.json();
// Create an Express application
const app = express();

// Set the port number for the server
const port = 3000;

initMongo()
  .catch(console.dir);

  app.use(jsonParser);
    app.use(cors({ origin: "http://127.0.0.1:5173" }));
    app.use("/transactions", transactions);

// Start the server and listen on the specified port
app.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});
