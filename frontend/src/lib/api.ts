import { Movie, SearchMoviesResponse, FavoritesResponse } from '@/types/movie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/movies';

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const movieApi = {
  searchMovies: async (query: string, page: number = 1): Promise<SearchMoviesResponse> => {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new ApiError('Search query is required');
    }

    if (!Number.isInteger(page) || page < 1) {
      throw new ApiError('Page must be a positive integer');
    }

    try {
      const encodedQuery = encodeURIComponent(query.trim());
      const response = await fetch(`${API_BASE_URL}/search?q=${encodedQuery}&page=${page}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || 'Failed to search movies',
          response.status,
          errorData,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new ApiError('Network error: Unable to connect to server. Please check your internet connection.', 0);
      }
      throw new ApiError('Unable to search for movies. Please try again later.');
    }
  },

  getFavorites: async (page: number = 1): Promise<FavoritesResponse> => {
    if (!Number.isInteger(page) || page < 1) {
      throw new ApiError('Page must be a positive integer');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/favorites/list?page=${page}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
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
        throw new ApiError(
          errorData.message || 'Failed to get favorites',
          response.status,
          errorData,
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new ApiError('Network error: Unable to connect to server. Please check your internet connection.', 0);
      }
      throw new ApiError('Unable to load favorites. Please try again later.');
    }
  },

  addToFavorites: async (movie: Movie): Promise<void> => {
    if (!movie || !movie.imdbID) {
      throw new ApiError('Invalid movie data');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movie),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || 'Failed to add movie to favorites',
          response.status,
          errorData,
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new ApiError('Network error: Unable to connect to server. Please check your internet connection.', 0);
      }
      throw new ApiError('Unable to add movie to favorites. Please try again.');
    }
  },

  removeFromFavorites: async (imdbID: string): Promise<void> => {
    if (!imdbID || typeof imdbID !== 'string' || imdbID.trim().length === 0) {
      throw new ApiError('Movie ID is required');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/favorites/${encodeURIComponent(imdbID)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || 'Failed to remove movie from favorites',
          response.status,
          errorData,
        );
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new ApiError('Network error: Unable to connect to server. Please check your internet connection.', 0);
      }
      throw new ApiError('Unable to remove movie from favorites. Please try again.');
    }
  },
};
