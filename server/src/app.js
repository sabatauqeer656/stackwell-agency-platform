import express from 'express';

const app = express();

// Parse JSON request bodies into req.body
app.use(express.json());

// Health check: lets us (and later, hosting platforms) confirm the API is alive
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'ok', uptime: process.uptime() },
  });
});

export default app;
