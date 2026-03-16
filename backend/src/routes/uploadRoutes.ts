import path from "path";
import express from "express";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

function checkFileType(
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  const filetypes = /jpg|jpeg|png|webp|avif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Images only!"));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

router.post("/", upload.single("image"), (req, res) => {
  if (req.file) {
    res.send({
      message: "Image uploaded",
      // Keep it relative so we can map it on the frontend easily
      image: `/uploads/${req.file.filename}`,
    });
  } else {
    res.status(400).send({ message: "No image file provided" });
  }
});

export default router;
