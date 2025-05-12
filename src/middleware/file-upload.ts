import multer from "multer";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, _file, cb) => {
    cb(null, `${req.params.id}.jpg`);
  },
});

export const upload = multer({ storage });
