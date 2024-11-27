export const fakeDebt = {
  _id: "fakeId",
  type: "income",
  entity: "fakeEntity",
  concept: "fakeConcept",
  amount: 100,
  category: "fakeCategory",
  userId: "fakeUserId",
};

export const fakeDebt2 = {
  _id: "fakeId2",
  type: "income",
  entity: "fakeEntity2",
  concept: "fakeConcept2",
  amount: 200,
  category: "fakeCategory2",
  userId: "fakeUserId2",
};

export const fakeDebt3 = {
  _id: "fakeId3",
  type: "income",
  entity: "fakeEntity3",
  concept: "fakeConcept3",
  amount: 300,
  category: "fakeCategory3",
  userId: "fakeUserId3",
};

export const fakeDebtsList = [fakeDebt, fakeDebt2, fakeDebt3];

export const fakeAggregates = [{ _id: null, balance: fakeDebt.amount }];

export const getDebtsPage = (limit?: number, page?: number) => {
  return !limit || !page
    ? fakeDebtsList
    : fakeDebtsList.slice((page - 1) * limit, (page - 1) * limit + limit + 1);
};
