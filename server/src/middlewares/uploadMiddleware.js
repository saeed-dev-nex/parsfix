import multer from "multer";
// import AppError from "../utils/AppError";

// assign a memory for temp storage (as disk)
const storage = multer.memoryStorage();

// filter the files for only picture files
const fileFilter = (req, file, cb) => {
  // check if the file is a image
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    const error = new Error("فایل ارسال شده عکس نیست!");
    error.statusCode = 400;
    cb(error, false);
  }
};
// set Limit for max size upload
const Limits = {
  fileSize: 1024 * 1024 * 5, // 5MB
};
const upload = multer({ storage, fileFilter, Limits });

export default upload;
