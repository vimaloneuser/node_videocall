require('dotenv').config()
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const serverless = require('serverless-http')
var cors = require('cors');

const options = {
  key: fs.readFileSync('server/key.pem', 'utf8'),
  cert: fs.readFileSync('server/cert.pem', 'utf8')
};

var credentials = { key: options.key, cert: options.cert };

const express = require('express');
var https = require('https');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const { jwt: { AccessToken } } = require('twilio');

const VideoGrant = AccessToken.VideoGrant;

// Create Express webapp.
const app = express();

app.use(cors());
// var server = https.createServer(credentials, app);

// const port = process.env.PORT || 5000;

app.get('/', (request, response) => {
  console.log("server running");
  response.status(200).send("helloo");
});

app.post('/token', jsonParser, function (request, response) {
  const { identity, room_name } = request.body;
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_KEY_SECRET,
    { identity: identity },
    { rules: [{ "type": "exclude", "all": true }] }
  );
  const grant = new VideoGrant({
    room: room_name,
  });
  token.addGrant(grant);
  response.send(token.toJwt());
});

app.post('/recording', jsonParser, (request, response) => {

  const { rules, room } = request.body;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const clientAPI = require('twilio')(accountSid, authToken);

  clientAPI.video.rooms(room)
    .recordingRules
    .update({ rules: rules })
    .then(recording_rules => console.log(recording_rules.roomSid));
  response.send(true);
});

module.exports.handler = serverless(app);