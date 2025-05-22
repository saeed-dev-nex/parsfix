import {
  createMovieService,
  deleteMovieService,
  getAllMoviesService,
  getMovieByIdService,
  updateMovieImageService,
  updateMovieService,
} from '../../services/admin/movieService.js';
import { searchTmdbMovies } from '../../services/admin/tmdbService.js';

/*=============================================*/
/*            Get all Movie Controller         */
/*=============================================*/

export const getAllMoviesController = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortedBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;
    const user = req.user;
    const result = await getAllMoviesService(user, {
      page,
      limit,
      sortedBy,
      sortOrder,
    });
    res.status(200).json({
      status: 'success',
      message: 'لیست فیلم ها با موفقیت دریافت شد.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
// TODO: Add createMovieController, getMovieByIdController, etc. later
/*=============================================*/

/*=============================================*/
/*        TMDB movie search controller         */
/*=============================================*/
export const searchTmdbController = async (req, res, next) => {
  try {
    const { query, page } = req.query;
    if (!query) {
      const error = new Error('لطفا یک عبارت جستجو وارد کنید.');
      error.statusCode = 400;
      return next(error);
    }
    const results = await searchTmdbMovies(query, parseInt(page || '1', 10));
    res.status(200).json({
      status: 'success',
      message: 'نتایج جستجوی فیلم در TMDB.',
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
/*=============================================*/

/*=============================================*/
/*        TMDB movie Create controller         */
/*=============================================*/
export const createMovieController = async (req, res, next) => {
  console.log('--- Entered createMovieController ---');
  try {
    const inputData = req.body;
    console.log('Received input data:', inputData);
    const userId = req.user?.id;
    if (!userId) {
      // این نباید رخ دهد چون protect اجرا شده
      throw new Error('خطای داخلی: شناسه کاربر ادمین یافت نشد.');
    }
    const newMovie = await createMovieService(inputData, userId);
    console.log('createMovieService finished successfully.');
    res.status(201).json({
      status: 'success',
      message: 'فیلم با موفقیت ایجاد شد.',
      data: { movie: newMovie },
    });
  } catch (error) {
    console.log('createMovieService finished successfully.');
    next(error);
  }
};

/*=============================================*/
/*        TMDB movie delete controller         */
/*=============================================*/
export const deleteMovieController = async (req, res, next) => {
  console.log(`--- Entered deleteMovieController for ID: ${req.params.id} ---`);
  try {
    const movieId = req.params.id;
    const user = req.user; //get from protection middleware
    if (!movieId) {
      const error = new Error('شناسه فیلم برای حذف مشخص نشده است.');
      error.statusCode = 400;
      return next(error);
    }
    await deleteMovieService(movieId, user);
    res.status(204).json({
      status: 'success',
      data: null,
      message: 'فیلم با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('!!! Error in deleteMovieController:', error);
    next(error); // ارسال خطا به errorHandler
  }
};
/*=============================================*/
/*  get movie detail By MovieId controller     */
/*=============================================*/
export const getMovieByIdController = async (req, res, next) => {
  console.log(
    `--- Entered getMovieByIdController for ID: ${req.params.id} ---`
  );
  try {
    const movieId = req.params.id;
    if (!movieId) {
      const error = new Error('شناسه فیلم مشخص نشده است.');
      error.statusCode = 400;
      return next(error);
    }
    const movie = await getMovieByIdService(movieId);
    res.status(200).json({ status: 'success', data: { movie } });
  } catch (error) {
    next(error);
  }
};

/*=============================================*/
/*          Update movie controller            */
/*=============================================*/
export const updateMovieController = async (req, res, next) => {
  console.log(`--- Entered updateMovieController for ID: ${req.params.id} ---`);
  try {
    const movieId = req.params.id;
    const updateData = req.body; // داده‌های جدید از بدنه درخواست
    const user = req.user; // کاربر انجام دهنده از protect

    if (!movieId) {
      const error = new Error('شناسه فیلم مشخص نشده است.');
      error.statusCode = 400;
      return next(error);
    }
    if (Object.keys(updateData).length === 0) {
      const error = new Error('داده‌ای برای آپدیت ارسال نشده است.');
      error.statusCode = 400;
      return next(error);
    }

    const updatedMovie = await updateMovieService(movieId, updateData, user);

    res.status(200).json({
      status: 'success',
      message: 'فیلم با موفقیت به‌روزرسانی شد.',
      data: { movie: updatedMovie },
    });
  } catch (error) {
    next(error);
  }
};

/*=============================================*/
/*      Update Poster movie controller         */
/*=============================================*/
export const updateMoviePosterController = async (req, res, next) => {
  console.log(
    `--- Entered updateMoviePosterController for ID: ${req.params.id} ---`
  );
  try {
    const movieId = req.params.id;
    const user = req.user; // کاربر انجام دهنده از protect
    const file = req.file; // فایل آپلود شده از multer
    if (!file) {
      const error = new Error('فایلی برای آپلود وجود ندارد.');
      error.statusCode = 400;
      return next(error);
    }
    if (!movieId) {
      const error = new Error('شناسه فیلم مشخص نشده است.');
      error.statusCode = 400;
      return next(error);
    }

    const updatedMovie = await updateMovieImageService(
      movieId,
      user.id,
      user.role,
      file,
      'poster'
    );

    res.status(200).json({
      status: 'success',
      message: 'پوستر فیلم با موفقیت به‌روزرسانی شد.',
      data: { movie: updatedMovie },
    });
  } catch (error) {
    next(error);
  }
};
/*=============================================*/
/*      Update backdrop movie controller       */
/*=============================================*/
export const updateMovieBackdropController = async (req, res, next) => {
  console.log(
    `--- Entered updateMovieBackdropController for ID: ${req.params.id} ---`
  );
  try {
    const movieId = req.params.id;
    const user = req.user; // کاربر انجام دهنده از protect
    const file = req.file; // فایل آپلود شده از multer
    if (!file) {
      const error = new Error('فایلی برای آپلود وجود ندارد.');
      error.statusCode = 400;
      return next(error);
    }
    if (!movieId) {
      const error = new Error('شناسه فیلم مشخص نشده است.');
      error.statusCode = 400;
      return next(error);
    }

    const updatedMovie = await updateMovieImageService(
      movieId,
      user.id,
      user.role,
      file,
      'backdrop'
    );

    res.status(200).json({
      status: 'success',
      message: 'تصویر پس زمینه فیلم با موفقیت به‌روزرسانی شد.',
      data: { movie: updatedMovie },
    });
  } catch (error) {
    next(error);
  }
};
