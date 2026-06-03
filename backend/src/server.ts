import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import hospitalRoutes from './routes/hospitalRoutes';
import userRoutes from './routes/userRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import serviceReportRoutes from './routes/serviceReportRoutes';
import notificationRoutes from './routes/notificationRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import auditLogRoutes from './routes/auditLogRoutes';
import leadRoutes from './routes/leadRoutes';
import announcementRoutes from './routes/announcementRoutes';
import scmRoutes from './routes/scmRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

// Connect to MongoDB
connectDB();

const app: Express = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

import { initSocket } from './utils/socket';
import { initCronJobs } from './utils/cronJobs';

initSocket(io);
initCronJobs();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:3000", "http://localhost:5000"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5000", "ws://localhost:5000"],
    },
  },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply rate limiter to auth routes specifically as per prompt
app.use('/api/v1/auth', limiter);

// Static folder for uploads
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hospitals', hospitalRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/equipment', equipmentRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/service-reports', serviceReportRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/scm', scmRoutes);

// Basic health route
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'CMS Backend API is running' });
});

// Error Handler
app.use(errorHandler);



const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

export { io };
