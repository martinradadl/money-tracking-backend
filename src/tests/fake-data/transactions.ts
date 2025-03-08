export const fakeTransaction = {
  _id: "fakeId",
  type: "income",
  concept: "fakeConcept",
  amount: 100,
  category: "fakeCategory",
  date: "fakeDate1",
  userId: "fakeUserId",
};

export const fakeTransaction2 = {
  _id: "fakeId2",
  type: "income",
  concept: "fakeConcept2",
  amount: 200,
  category: "fakeCategory2",
  date: "fakeDate2",
  userId: "fakeUserId2",
};

export const fakeTransaction3 = {
  _id: "fakeId3",
  type: "income",
  concept: "fakeConcept3",
  amount: 300,
  category: "fakeCategory3",
  date: "fakeDate3",
  userId: "fakeUserId3",
};

export const fakeTransactionsList = [
  fakeTransaction,
  fakeTransaction2,
  fakeTransaction3,
];

export const fakeAggregates = [
  { _id: null, balance: fakeTransaction.amount, sum: fakeTransaction.amount },
];

export const getTransactionsPage = (limit?: number, page?: number) => {
  return !limit || !page
    ? fakeTransactionsList
    : fakeTransactionsList.slice(
        (page - 1) * limit,
        (page - 1) * limit + limit + 1
      );
};
