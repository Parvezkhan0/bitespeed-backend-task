import express from 'express';
import bodyParser from 'body-parser';
import { sequelize } from './database';
import contactRouter from './routes/contact';
import { postContact, getContact } from './routes/contact';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use('/identify', postContact);
app.use('/identify', getContact);

// Function to retry database connection
const connectWithRetry = async (maxRetries = 5, delay = 5000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await sequelize.authenticate();
      console.log('Database connection established successfully.');
      await sequelize.sync();
      console.log('Database synced.');
      return true;
    } catch (error) {
      console.log(`Database connection attempt ${i + 1} failed. Retrying in ${delay/1000}s...`);
      if (i === maxRetries - 1) {
        console.error('Unable to connect to database after multiple attempts:', error);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Start server only after database is ready
connectWithRetry().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});