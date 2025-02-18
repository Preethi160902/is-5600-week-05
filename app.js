const express = require('express');
const api = require('./api');
const middleware = require('./middleware');
const bodyParser = require('body-parser');

// Set the port
const port = process.env.PORT || 3000;

// Boot the app
const app = express();

// Register middleware
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(middleware.cors);
app.use('/', api);  // Just this one line for routes


// Error handling for undefined routes
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Boot the server
app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));