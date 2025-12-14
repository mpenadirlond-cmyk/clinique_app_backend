const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const port = 8000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Test server listening on port ${port}`);
});
