import * as transactionModel from "../models/transaction";
import * as debtModel from "../models/debt";
import * as userModel from "../models/user";

export const deleteAllTransactions = async () => {
  try {
    console.info("Deleting transactions...");
    const wereElementsDeleted =
      await transactionModel.Transaction.collection.drop();
    console.info("Transactions has been deleted? " + wereElementsDeleted);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

export const deleteAllDebts = async () => {
  try {
    console.info("Deleting debts...");
    const wereDebtsDeleted = await debtModel.Debt.collection.drop();
    console.info("Debts has been deleted? " + wereDebtsDeleted);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

export const deleteAllUsers = async () => {
  try {
    console.info("Deleting users...");
    const wereUsersDeleted = await userModel.User.collection.drop();
    console.info("Users has been deleted? " + wereUsersDeleted);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};
