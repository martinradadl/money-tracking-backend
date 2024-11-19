import { createRequest, createResponse } from "node-mocks-http";

export const mockedCatchError = new Error("Error");

export const initializeReqResMocks = () => {
  const req = createRequest({});
  const res = createResponse({});
  return { req, res };
};

export const defaultGetAllQueryObject = (
  result: Array<Record<string, unknown>>
) => {
  return {
    limit: () => {
      return {
        skip: () => {
          return {
            populate: () => {
              return result;
            },
          };
        },
      };
    },
  };
};
