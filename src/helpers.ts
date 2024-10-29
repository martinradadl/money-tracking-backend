export const APP_URL =
  process.env.NODE_ENV === "development"
    ? process.env.APP_DEV_URL
    : process.env.APP_URL;
