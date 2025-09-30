const app = require('./app');
const pool  = require('./config/db');

const PORT = process.env.PORT || 5000;
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");


// Load Swagger file
const swaggerDocument = YAML.load(path.resolve("./openapi.yaml"));
// Swagger docs route
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  pool.end(() => process.exit(1));
});