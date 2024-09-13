import { createRequest, createResponse } from "node-mocks-http";

export const initializeReqResMocks = () => {
  const req = createRequest({});
  const res = createResponse({});
  return { req, res };
};
