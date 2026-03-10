require('dotenv').config();
const app = require('./app');
const initializeAdmin = require('./services/adminInitializer');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Check and initialize default admin upon startup
  await initializeAdmin();
});
