export const fakeDebt = {
  _id: "fakeId",
  type: "loan",
  entity: "fakeEntity",
  concept: "fakeConcept",
  amount: 100,
  category: "fakeCategory",
  date: new Date("2022-04-04").toISOString(),
  userId: "fakeUserId",
};

export const fakeDebt2 = {
  _id: "fakeId2",
  type: "loan",
  entity: "fakeEntity2",
  concept: "fakeConcept2",
  amount: 200,
  category: "fakeCategory2",
  date: new Date("2022-04-20").toISOString(),
  userId: "fakeUserId2",
};

export const fakeDebt3 = {
  _id: "fakeId3",
  type: "loan",
  entity: "fakeEntity3",
  concept: "fakeConcept3",
  amount: 300,
  category: "fakeCategory3",
  date: new Date("2024-02-04").toISOString(),
  userId: "fakeUserId3",
};

export const fakeDebtsList = [fakeDebt, fakeDebt2, fakeDebt3];

export const fakeAggregates = [
  { _id: null, balance: fakeDebt.amount, sum: fakeDebt.amount },
];

export const fakeAggregates2 = [
  { _id: null, balance: fakeDebt2.amount, sum: fakeDebt2.amount },
];

export const getDebtsPage = (limit?: number, page?: number) => {
  return !limit || !page
    ? fakeDebtsList
    : fakeDebtsList.slice((page - 1) * limit, (page - 1) * limit + limit + 1);
};
