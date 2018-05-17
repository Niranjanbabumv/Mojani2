// Get dependencies
const express = require('express');
const app = express();
require('dotenv').config(); // load the env properties from .env file in the root folder to the system env
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');

//require the express router
var router = express.Router();

// Get our API routes
const mojani_api = require('./server/routes/mojani_api');
const login_api = require('./server/routes/login_api');
const fileUpload_api = require('./server/routes/fileupload');

//Middle ware for CORS
app.use(cors());

//create a cors middle ware for file upload
app.use(function(req, res, next) {
//set headers to allow cross origin request.
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//The following is required for bluemix https redirect :
// Enable reverse proxy support in Express. This causes the
// the "X-Forwarded-Proto" header field to be trusted so its
// value can be used to determine the protocol. See 
// http://expressjs.com/api#app-settings for more details.
/* app.enable('trust proxy');

// Add a handler to inspect the req.secure flag (see 
// http://expressjs.com/api#req.secure). This allows us 
// to know whether the request was via http or https.
app.use (function (req, res, next) {
        if (req.secure) {
                // request was via https, so do no special handling
                next();
        } else {
                // request was via http, so redirect to https
                res.redirect('https://' + req.headers.host + req.url);
        }
}); */


// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

// Set our API routes based on application routes
app.use('/login', login_api);
app.use('/manageLandRecords', mojani_api);
app.use('/uploads', fileUpload_api);

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || process.env.VCAP_APP_PORT || '3000';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));