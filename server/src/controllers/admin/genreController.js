import { getAllGenresService } from '../../services/admin/genreService.js';
/*__________________________________________________________*/
/*                Get All Genres Controller                 */
/*__________________________________________________________*/
export const getAllGenresController = async (req, res, next) => {
  console.log(
    '-------------------- Enter getAllGenresController----------------'
  );
  try {
    const genres = await getAllGenresService();
    res.status(200).json({
      status: 'success',
      message: 'لیست ژانرها با موفقیت دریافت شد',
      data: {
        genres: genres,
        count: genres.length,
      },
    });
  } catch (error) {
    next();
  }
};
