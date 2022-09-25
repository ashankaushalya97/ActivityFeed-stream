const express = require("express");
let stream = require("getstream");
const fs = require("fs");

const app = express();
const port = 3000;
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);
app.use(jsonParser);

const STREAM_API_KEY = "vuetaptmgqrj";
const STREAM_API_TOKEN =
  "nf39wthwvezxma5czykwnmngwsb9fyegcsrqr4ujmjjxhdfytqp8azyfw9775bvd";

app.get("/", async (req, res) => {
  let client = await stream.connect(STREAM_API_KEY, STREAM_API_TOKEN);

  let userToken = await client.createUserToken("testUser1");

  //user creation
  await client.user("testUser2").getOrCreate({
    name: "testUser2",
    fullname: "testUser2",
  });

  const timelineFeed = client.feed("timeline", "testUser1");
  timelineFeed.follow("user", "testUser2");
  res.send({ userToken, userId: "testUser1" });
});

app.get("/getTimeline", async (req, res) => {
  let client = await stream.connect(STREAM_API_KEY, STREAM_API_TOKEN);

  const timelineFeed = client.feed("timeline", "testUser1");
  const results = await timelineFeed.get();

  res.send(results);
});

app.post("/activity", urlencodedParser, async (req, res) => {
  let client = await stream.connect(STREAM_API_KEY, STREAM_API_TOKEN);

  const timelineFeed = client.feed("timeline", "testUser1");

  let data = req.body;

  if (data?.image) {
    let image = fs.createReadStream(data?.image);
    let result = await client.images.upload(image);

    data.image = result?.file;
  }

  await timelineFeed.addActivity(data);

  res.statusCode = 200;
  res.send("Activity succesfully added.");
});

app.post("/uploadImage", urlencodedParser, async (req, res) => {
  let client = await stream.connect(STREAM_API_KEY, STREAM_API_TOKEN);

  let image = fs.createReadStream(req.body?.uri);
  let result = await client.images.upload(image);

  res.statusCode = 200;
  res.send({ url: result?.file });
});

app.listen(port, () => {
  console.log(`Backend api listening at http://localhost:${port}`);
});
