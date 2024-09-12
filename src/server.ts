import express from "express";
import http from "http";
import { initMongo } from "./mongo-setup";
import transactions from "./routes/transactions";
import auth from "./routes/authentication";
import cors from "cors";
import bodyParser from "body-parser";

const jsonParser = bodyParser.json();
// Create an Express application
const app = express();
const httpServer = http.createServer(app);

// Set the port number for the server
const port = 3000;

initMongo().catch(console.dir);

app.use(jsonParser);
app.use(cors({ origin: "http://127.0.0.1:5173" }));
app.use("/transactions", transactions);
app.use("/auth", auth);

// Start the server and listen on the specified port
httpServer.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});

export const shutdownServer = (callback: (error?: Error) => void) =>
  httpServer && httpServer.close(callback);
