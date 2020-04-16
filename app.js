const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const fs = require("fs");
const youtubedl = require("youtube-dl");
const ffmpeg = require("ffmpeg");
const bodyParser = require("body-parser");
const path = require("path");

app.use(bodyParser.urlencoded());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./input.html"));
});

app.post("/download", (req, res) => {
  const youtube_url = req.body.url;
  const start_time = req.body.start;
  const length = req.body.length;
  const video = youtubedl(youtube_url, ["--format=18"], { cwd: __dirname });

  // Will be called when the download starts.
  let filename = "";
  video.on("info", function (info) {
    console.log("Download started");
    console.log("filename: " + info._filename);
    filename = info._filename;
    console.log("size: " + info.size);
  });

  video.pipe(fs.createWriteStream("video.mp4"));

  try {
    fs.unlinkSync("trimmed.mp4");
  } catch (e) {
    console.error(e);
  }

  fs.readdirSync(path.join(__dirname)).forEach((file) => {
    console.log(file);
  });

  video.on("end", (info) => {
    console.log("Downloaded");
    try {
      var process = new ffmpeg("video.mp4");
      process.then(
        function (video) {
          console.log("Processing video");
          video
            .setVideoStartTime(parseInt(start_time))
            .setVideoDuration(parseInt(length))
            .save("trimmed.mp4", () => {
              fs.readdirSync(path.join(__dirname)).forEach((file) => {
                console.log(file);
              });
              res.download("trimmed.mp4", filename);
            });
        },
        function (err) {
          console.log("Error: " + err);
          res.send("ERROR");
        }
      );
    } catch (e) {
      console.log(e.code);
      console.log(e.msg);
      res.send("ERROR");
    }
  });
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
