import { initMongo } from "../mongo-setup";
import {
  deleteAllDebts,
  deleteAllTransactions,
  deleteAllUsers,
} from "./mongo-functions";

const cleanUpDB = async () => {
  try {
    console.info("Initializing connection with Mongo");
    await initMongo().catch(console.dir);
    await deleteAllTransactions();
    await deleteAllDebts();
    await deleteAllUsers();
    console.info("All collections have been cleaned");
    process.exit(0);
  } catch (err: unknown) {
    if (err instanceof Error)
      console.error("Process have failed: ", err.message);
    process.exit(1);
  }
};

cleanUpDB();
