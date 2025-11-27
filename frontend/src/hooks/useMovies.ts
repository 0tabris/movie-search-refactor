import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movieApi } from '@/lib/api';
import { SearchMoviesResponse, FavoritesResponse } from '@/types/movie';

export const useSearchMovies = (query: string, page: number = 1, enabled: boolean = false) => {
  return useQuery<SearchMoviesResponse, Error>({
    queryKey: ['movies', 'search', query, page],
    queryFn: () => movieApi.searchMovies(query, page),
    enabled: enabled && query.length > 0,
    retry: 1,
    staleTime: 60 * 1000,
  });
};

export const useFavorites = (page: number = 1) => {
  return useQuery<FavoritesResponse, Error>({
    queryKey: ['movies', 'favorites', page],
    queryFn: () => movieApi.getFavorites(page),
    retry: 1,
    staleTime: 30 * 1000,
  });
};

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: movieApi.addToFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies', 'favorites'] });
      queryClient.invalidateQueries({ queryKey: ['movies', 'search'] });
    },
    onError: (error) => {
      console.error('Failed to add to favorites:', error);
    },
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: movieApi.removeFromFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies', 'favorites'] });
      queryClient.invalidateQueries({ queryKey: ['movies', 'search'] });
    },
    onError: (error) => {
      console.error('Failed to remove from favorites:', error);
    },
  });
};
