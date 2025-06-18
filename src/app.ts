import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import courseRoutes from './routes/courseRoutes';
import { errorHandler } from './middleware/errorHandler';
import { connectDatabase } from './config/database';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', courseRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    
    app.listen(port, () => {
      console.log(`Course Recommendation API server running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/api/health`);
      console.log(`Main endpoint: POST http://localhost:${port}/api/recommend-courses`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;