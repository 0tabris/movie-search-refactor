import { Controller, Get, Post, Delete, Param, Query, Body, UsePipes, ValidationPipe, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MovieDto } from './dto/movie.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('search')
  async searchMovies(
    @Query('q') query: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  ) {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new HttpException('Search query is required', HttpStatus.BAD_REQUEST);
    }
    const pageNumber = page && page > 0 ? page : 1;
    return await this.moviesService.getMovieByTitle(query.trim(), pageNumber);
  }

  @Post('favorites')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  addToFavorites(@Body() movieToAdd: MovieDto) {
    return this.moviesService.addToFavorites(movieToAdd);
  }

  @Delete('favorites/:imdbID')
  removeFromFavorites(@Param('imdbID') imdbID: string) {
    if (!imdbID || typeof imdbID !== 'string' || imdbID.trim().length === 0) {
      throw new HttpException('Movie ID is required', HttpStatus.BAD_REQUEST);
    }
    return this.moviesService.removeFromFavorites(imdbID.trim());
  }

  @Get('favorites/list')
  getFavorites(@Query('page', new ParseIntPipe({ optional: true })) page?: number) {
    const pageNumber = page && page > 0 ? page : 1;
    return this.moviesService.getFavorites(pageNumber);
  }
}
