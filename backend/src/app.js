const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { uploadRoot } = require('./paths');

dotenv.config();

const app = express();
const allowedFrontendOrigins = new Set(
  [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedFrontendOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS origin is not allowed: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve generated media from a stable path regardless of process cwd.
app.use('/uploads', express.static(uploadRoot));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    message: 'SSUL MAKER Backend is running!',
  });
});

app.use('/api/projects', require('./routes/projects'));
app.use('/api/panels', require('./routes/panels'));
app.use('/api/render', require('./routes/render'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

const PORT = process.env.PORT || 3001;

function startServer(port = PORT) {
  const listener = app.listen(port, () => {
    const serverAddress = listener.address();
    const actualPort =
      serverAddress && typeof serverAddress === 'object' ? serverAddress.port : port;
    const address = `http://localhost:${actualPort}`;
    console.log(`Server running on ${address}`);
    console.log(`Health check: ${address}/health`);
  });

  return listener;
}

const server = require.main === module ? startServer() : null;

module.exports = { app, server, startServer };
