import { Readable } from "stream";

export const fakePassword = "fakePassword";

export const newFakePassword = "newFakePassword";

export const fakeUser = {
  _id: "fakeId",
  name: "fakeName",
  email: "fakeEmail",
  password: fakePassword,
  currency: { name: "fakeCurrency", code: "FAKE" },
  profilePic: "fakeProfilePic",
};

export const fakeToken = "fakeToken";

export const fakeFile: Express.Multer.File = {
  fieldname: "file",
  originalname: "test.txt",
  encoding: "7bit",
  mimetype: "text/plain",
  size: 1024,
  stream: new Readable(),
  destination: "uploads/",
  filename: "test-12345.txt",
  path: "newProfilePic",
  buffer: Buffer.from("Hello, world!"),
};
