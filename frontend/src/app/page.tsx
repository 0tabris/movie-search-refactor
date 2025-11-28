'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSearchMovies, useAddToFavorites, useRemoveFromFavorites } from '@/hooks/useMovies';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { useErrorToast } from '@/hooks/useErrorToast';
import { Movie } from '@/types/movie';
import SearchBar from '@/components/searchBar';
import MovieCard from '@/components/MovieCard';
import Pagination from '@/components/pagination';
import ErrorToast from '@/components/ErrorToast';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { errors, showError, removeError } = useErrorToast();

  const { data: searchResults, isLoading, error } = useSearchMovies(searchQuery, currentPage, searchEnabled);
  const addToFavorites = useAddToFavorites((errorMessage) => showError(errorMessage));
  const removeFromFavorites = useRemoveFromFavorites((errorMessage) => showError(errorMessage));

  const totalPages = useMemo(() => {
    if (!searchResults?.data.totalResults) return 0;
    const total = parseInt(searchResults.data.totalResults, 10);
    return Math.ceil(total / 10);
  }, [searchResults?.data.totalResults]);

  const handleSearch = useCallback((query: string) => {
    if (!query || query.trim().length === 0) {
      setSearchEnabled(false);
      setSearchQuery('');
      return;
    }
    setSearchQuery(query.trim());
    setSearchEnabled(true);
    setCurrentPage(1);
  }, []);

  // Debounced favorite toggle to prevent race conditions
  const toggleFavoriteAction = useCallback(
    async (movie: Movie) => {
      if (addToFavorites.isPending || removeFromFavorites.isPending) {
        return;
      }

      try {
        if (movie.isFavorite) {
          await removeFromFavorites.mutateAsync(movie.imdbID);
        } else {
          await addToFavorites.mutateAsync(movie);
        }
      } catch (error) {
        // Error is already handled by the onError callback in useMovies
        console.error('Failed to toggle favorite:', error);
      }
    },
    [addToFavorites, removeFromFavorites],
  );

  const debouncedToggleFavorite = useDebouncedCallback(toggleFavoriteAction, 300);

  const handleToggleFavorite = useCallback(
    (movie: Movie) => {
      debouncedToggleFavorite(movie);
    },
    [debouncedToggleFavorite],
  );

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [totalPages]);

  const isMutating = addToFavorites.isPending || removeFromFavorites.isPending;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text">
              Movie Finder
            </h1>
          </div>
          <SearchBar onSearch={handleSearch} />
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Searching for movies...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-xl text-red-500 mb-2">Error loading movies</p>
            <p className="text-muted-foreground">
              {error.message.includes('Network error')
                ? 'Unable to connect to the server. Please check your internet connection.'
                : error.message.includes('Failed to fetch')
                ? 'Unable to connect to the server. Please check your internet connection.'
                : error.message}
            </p>
          </div>
        )}

        {/* Error Toasts */}
        {errors.map((error) => (
          <ErrorToast
            key={error.id}
            message={error.message}
            onClose={() => removeError(error.id)}
          />
        ))}

        {!isLoading && !error && searchResults?.data.movies.length === 0 && !searchQuery && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">Start Your Search</h2>
            <p className="text-muted-foreground">
              Search for your favorite movies and add them to your favorites
            </p>
          </div>
        )}

        {!isLoading && !error && searchResults?.data.movies.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No movies found for &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {!isLoading && !error && searchResults?.data.movies && searchResults.data.movies.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {searchResults.data.movies
                .filter((movie, index, self) => 
                  // Remove duplicates based on imdbID
                  index === self.findIndex((m) => m.imdbID === movie.imdbID)
                )
                .map((movie, index) => (
                  <MovieCard
                    key={`${movie.imdbID}-${index}`}
                    movie={movie}
                    isFavorite={movie.isFavorite ?? false}
                    onToggleFavorite={handleToggleFavorite}
                    disabled={isMutating}
                  />
                ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
