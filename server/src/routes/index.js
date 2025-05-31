import express from 'express';
import authRoutes from './auth/authRoutes.js';
import userRoutes from './auth/userRoutes.js';
import moviesRoutes from './admin/movieRoutes.js';
import genreRoutes from './admin/genreRoutes.js';
import adminRoutes from './admin/adminRoutes.js';
import seriesRoutes from './admin/seriesRoutes.js';
import seasonRoutes from './admin/seasonRoutes.js';
import episodeRoutes from './admin/episodeRoutes.js';
import publicMovieRoutes from './public/publicMovieRoutes.js';
import publicSeriesRoutes from './public/publicSeriesRoutes.js';
import contentRoutes from './public/contentRoutes.js';
const router = express.Router();

// a rout for API test

router.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});
// Auth Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
// Admin Dashboard Routes
router.use('/movies', moviesRoutes);
router.use('/genres', genreRoutes);
router.use('/admin', adminRoutes);
router.use('/series', seriesRoutes);
router.use('/seasons', seasonRoutes);
router.use('/episodes', episodeRoutes);

// Public Routes
router.use('/public-movies', publicMovieRoutes);
router.use('/public-series', publicSeriesRoutes);
router.use('/content', contentRoutes);
export default router;
