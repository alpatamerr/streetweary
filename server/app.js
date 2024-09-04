// Monitor app and report data with New Relic only in production
if (process.env.NODE_ENV === 'production') {
  require('newrelic');
}

const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const YAML = require('yamljs');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const morgan = require('morgan');
const passport = require('passport');
const fs = require('fs');
const http = require('http');
const https = require('https');
const config = require('./config');
const routes = require('./routes');
require('./config/passport');

const app = express();

// CORS configuration
const origin = {
  origin: process.env.CORS_ORIGIN || '*', // Default to allow all origins if not set
  credentials: true,
};
app.use(cors(origin));
app.options('*', cors(origin));

// Middleware
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(passport.initialize());

// Serve API documentation
const swaggerDocument = YAML.load('./openapi.yaml');
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// API routes
app.use('/api', routes);
app.get('/api/products', products.getProducts);

// Example route for fetching products
app.get('/api/products', async (req, res) => {
  try {
    const products = await getProducts(); // Replace with your actual function to fetch products
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).send('Server Error');
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).send({
    error: {
      status: error.status || 500,
      message: error.message || 'Internal Server Error',
    },
  });
});

// SSL Certificate and Key
const sslOptions = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

// Start the HTTPS server
https.createServer(sslOptions, app).listen(config.port, () => {
  console.log(`HTTPS Server listening on port ${config.port}`);
}).on('error', (err) => {
  console.error('Failed to start HTTPS server:', err);
});

// Create an HTTP server to redirect HTTP to HTTPS
http.createServer((req, res) => {
  res.writeHead(301, { "Location": `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(80, () => {
  console.log('HTTP Server listening on port 80 and redirecting to HTTPS');
}).on('error', (err) => {
  console.error('Failed to start HTTP server:', err);
});