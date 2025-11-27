import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movieApi } from '@/lib/api';
import { SearchMoviesResponse, FavoritesResponse } from '@/types/movie';

// Helper function to get user-friendly error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message;
    
    // Network errors
    if (message.includes('Network error') || message.includes('Failed to fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    // API errors with status codes
    if (message.includes('400')) {
      if (message.includes('already in favorites')) {
        return 'This movie is already in your favorites.';
      }
      if (message.includes('required') || message.includes('Invalid')) {
        return 'Please provide valid information.';
      }
      return 'Invalid request. Please try again.';
    }
    
    if (message.includes('404')) {
      return 'The requested item was not found.';
    }
    
    if (message.includes('500') || message.includes('503')) {
      return 'Server error. Please try again later.';
    }
    
    // Return the error message if it's user-friendly
    return message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const useSearchMovies = (query: string, page: number = 1, enabled: boolean = false) => {
  return useQuery<SearchMoviesResponse, Error>({
    queryKey: ['movies', 'search', query, page],
    queryFn: () => movieApi.searchMovies(query, page),
    enabled: enabled && query.length > 0,
    retry: (failureCount, error) => {
      // Retry up to 2 times for network errors, but not for 4xx errors
      if (error instanceof Error) {
        if (error.message.includes('400') || error.message.includes('404')) {
          return false; // Don't retry client errors
        }
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 60 * 1000,
  });
};

export const useFavorites = (page: number = 1) => {
  return useQuery<FavoritesResponse, Error>({
    queryKey: ['movies', 'favorites', page],
    queryFn: () => movieApi.getFavorites(page),
    retry: (failureCount, error) => {
      if (error instanceof Error) {
        if (error.message.includes('400') || error.message.includes('404')) {
          return false;
        }
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30 * 1000,
  });
};

export const useAddToFavorites = (onError?: (message: string) => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: movieApi.addToFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies', 'favorites'] });
      queryClient.invalidateQueries({ queryKey: ['movies', 'search'] });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      if (onError) {
        onError(message);
      } else {
        console.error('Failed to add to favorites:', error);
      }
    },
  });
};

export const useRemoveFromFavorites = (onError?: (message: string) => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: movieApi.removeFromFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies', 'favorites'] });
      queryClient.invalidateQueries({ queryKey: ['movies', 'search'] });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      if (onError) {
        onError(message);
      } else {
        console.error('Failed to remove from favorites:', error);
      }
    },
  });
};
