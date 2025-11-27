import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { MovieDto } from './dto/movie.dto';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface OMDbMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

interface OMDbSearchResponse {
  Search?: OMDbMovie[];
  totalResults?: string;
  Response: string;
  Error?: string;
}

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);
  private favorites: MovieDto[] = [];
  private readonly favoritesFilePath = path.join(process.cwd(), 'data', 'favorites.json');
  private readonly dataDir = path.join(process.cwd(), 'data');
  
  private get baseUrl(): string {
    const apiKey = process.env.OMDB_API_KEY;
    if (!apiKey) {
      throw new HttpException(
        'OMDB_API_KEY environment variable is required',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return `http://www.omdbapi.com/?apikey=${apiKey}`;
  }

  constructor() {
    this.ensureDataDirectory();
    this.loadFavorites();
  }

  private ensureDataDirectory(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
        this.logger.log(`Created data directory: ${this.dataDir}`);
      }
    } catch (error) {
      this.logger.error(`Failed to create data directory: ${error}`);
      throw new HttpException(
        'Failed to initialize data directory',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private loadFavorites(): void {
    try {
      if (fs.existsSync(this.favoritesFilePath)) {
        const fileContent = fs.readFileSync(this.favoritesFilePath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed)) {
          this.favorites = parsed;
        } else {
          this.logger.warn('Favorites file contains invalid data, resetting to empty array');
          this.favorites = [];
        }
      } else {
        this.favorites = [];
        this.saveFavorites();
      }
    } catch (error) {
      this.logger.error(`Failed to load favorites: ${error}`);
      this.favorites = [];
    }
  }

  private saveFavorites(): void {
    try {
      this.ensureDataDirectory();
      fs.writeFileSync(this.favoritesFilePath, JSON.stringify(this.favorites, null, 2), 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to save favorites: ${error}`);
      throw new HttpException(
        'Failed to save favorites',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private reloadFavorites(): void {
    this.loadFavorites();
  }

  private parseYear(yearString: string): number {
    if (!yearString) return 0;
    const yearMatch = yearString.match(/^\d{4}/);
    return yearMatch ? parseInt(yearMatch[0], 10) : 0;
  }

  async searchMovies(title: string, page: number = 1): Promise<{ movies: OMDbMovie[]; totalResults: string }> {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new HttpException('Search title is required', HttpStatus.BAD_REQUEST);
    }

    if (!Number.isInteger(page) || page < 1) {
      throw new HttpException('Page must be a positive integer', HttpStatus.BAD_REQUEST);
    }

    try {
      const encodedTitle = encodeURIComponent(title.trim());
      const response = await axios.get<OMDbSearchResponse>(
        `${this.baseUrl}&s=${encodedTitle}&plot=full&page=${page}`,
      );
      
      if (response.data.Response === 'False' || response.data.Error) {
        return { movies: [], totalResults: '0' };
      }
      
      return {
        movies: response.data.Search || [],
        totalResults: response.data.totalResults || '0',
      };
    } catch (error) {
      this.logger.error(`OMDb API error: ${error}`);
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          'Failed to fetch movies from OMDb API',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw error;
    }
  }

  async getMovieByTitle(title: string, page: number = 1) {
    this.reloadFavorites();
    const response = await this.searchMovies(title, page);
    
    const formattedResponse = response.movies.map((movie: OMDbMovie) => {
      const isFavorite = this.favorites.some(fav => fav.imdbID === movie.imdbID);
      return {
        title: movie.Title,
        imdbID: movie.imdbID,
        year: this.parseYear(movie.Year),
        poster: movie.Poster || '',
        isFavorite,
      };
    });
    
    return {
      data: {
        movies: formattedResponse,
        count: formattedResponse.length,
        totalResults: response.totalResults,
      },
    };
  }

  addToFavorites(movieToAdd: MovieDto) {
    if (!movieToAdd || !movieToAdd.imdbID) {
      throw new HttpException('Invalid movie data', HttpStatus.BAD_REQUEST);
    }

    this.reloadFavorites();
    const foundMovie = this.favorites.find((movie) => movie.imdbID === movieToAdd.imdbID);
    if (foundMovie) {
      throw new HttpException(
        'Movie already in favorites',
        HttpStatus.BAD_REQUEST,
      );
    }
    
    this.favorites.push(movieToAdd);
    this.saveFavorites();
    this.reloadFavorites();
    
    return {
      data: {
        message: 'Movie added to favorites',
      },
    };
  }

  removeFromFavorites(movieId: string) {
    if (!movieId || typeof movieId !== 'string' || movieId.trim().length === 0) {
      throw new HttpException('Movie ID is required', HttpStatus.BAD_REQUEST);
    }

    this.reloadFavorites();
    const foundIndex = this.favorites.findIndex((movie) => movie.imdbID === movieId);
    if (foundIndex === -1) {
      throw new HttpException(
        'Movie not found in favorites',
        HttpStatus.NOT_FOUND,
      );
    }
    
    this.favorites.splice(foundIndex, 1);
    this.saveFavorites();
    this.reloadFavorites();
    
    return {
      data: {
        message: 'Movie removed from favorites',
      },
    };
  }

  getFavorites(page: number = 1, pageSize: number = 10) {
    if (!Number.isInteger(page) || page < 1) {
      throw new HttpException('Page must be a positive integer', HttpStatus.BAD_REQUEST);
    }

    if (!Number.isInteger(pageSize) || pageSize < 1) {
      throw new HttpException('Page size must be a positive integer', HttpStatus.BAD_REQUEST);
    }

    this.reloadFavorites();
    
    if (this.favorites.length === 0) {
      return {
        data: {
          favorites: [],
          count: 0,
          totalResults: '0',
          currentPage: page,
          totalPages: 0,
        },
      };
    }
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedFavorites = this.favorites.slice(startIndex, endIndex);
    
    return {
      data: {
        favorites: paginatedFavorites,
        count: paginatedFavorites.length,
        totalResults: this.favorites.length.toString(),
        currentPage: page,
        totalPages: Math.ceil(this.favorites.length / pageSize),
      },
    };
  }
}
