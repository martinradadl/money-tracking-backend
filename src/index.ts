import express from "express";
import "dotenv/config";
import http from "http";
import { initMongo } from "./mongo-setup";
import transactions from "./routes/transactions";
import auth from "./routes/authentication";
import categories from "./routes/categories";
import debts from "./routes/debts";
import dashboard from "./routes/dashboard";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { tokenVerification } from "./middleware/authentication";
import { APP_URL } from "./helpers";

const jsonParser = bodyParser.json();
// Create an Express application
const app = express();
const httpServer = http.createServer(app);

// Set the port number for the server
const port = process.env.PORT || 3000;

initMongo().catch(console.dir);

app.use(jsonParser);
app.use(cors({ origin: APP_URL }));
app.use(cookieParser());
app.get("/", (_, res) => res.send("Express on Vercel"));
app.use("/transactions", transactions);
app.use("/auth", auth);
app.use("/categories", categories);
app.use("/debts", debts);
app.use("/dashboard", dashboard);
app.get("/userAuth", tokenVerification, (_, res) => res.send("User Route"));

// Start the server and listen on the specified port
httpServer.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port}`);
});

export const shutdownServer = (callback: (error?: Error) => void) =>
  httpServer && httpServer.close(callback);

module.exports = app;
