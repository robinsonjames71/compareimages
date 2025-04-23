import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

import fs from "fs";
import { PNG } from "pngjs";
import JPEG from "jpeg-js";
import pixelmatch from "pixelmatch";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, file.fieldname + "." + extension);
  },
});

const upload = multer({ storage: storage });

// View Engine Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/public", express.static(__dirname + "/public"));
app.use("/uploads", express.static(__dirname + "/uploads"));

app.get("/", (req, res) => {
  res.render("index");
});

app.post(
  "/compare",
  upload.fields([{ name: "file" }, { name: "compare" }]),
  (req, res) => {
    const images = Object.values(req.files).map((file) => {
      // The file input can be an array of files
      let extArray = file[0].mimetype.split("/");
      let extension = extArray[extArray.length - 1];
      console.log(file[0]);
      if (extension === "jpeg") {
        const jpegData = fs.readFileSync(file[0].path);
        return JPEG.decode(jpegData);
      } else {
        return PNG.sync.read(fs.readFileSync(file[0].path));
      }
    });
    const { width, height } = images[0];
    const diff = new PNG({ width, height });

    // pixelmatch returns the number of mismatched pixels
    const mismatchedPixels = pixelmatch(
      images[0].data,
      images[1].data,
      diff.data,
      width,
      height,
      {
        threshold: 0.1,
      }
    );

    const match = 1 - mismatchedPixels / (width * height);
    const threshold = 0.8;

    fs.writeFileSync("./uploads/diff.png", PNG.sync.write(diff));

    res.status(200).json(
      JSON.stringify({
        mismatchedPixels,
        match,
        matchPercentage: `${(match * 100).toFixed(2)}%`,
        success: match >= threshold,
      })
    );
  }
);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
