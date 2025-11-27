# Changelog

All notable changes made to the Movie Search Application codebase.

## [Unreleased]

### Fixed

#### Backend

- **Critical**: Fixed QueryClient being recreated on every render in QueryProvider, which was causing React Query cache to be lost
- **Critical**: Fixed backend error handling - changed from returning HttpException objects to properly throwing them, ensuring errors return correct HTTP status codes
- **Critical**: Fixed OMDb API response check - now correctly handles string "False" response instead of boolean false
- **Critical**: Added comprehensive file operation error handling with automatic directory creation for favorites data
- **Security**: Removed hardcoded API key fallback - application now fails fast if OMDB_API_KEY is not set
- **Type Safety**: Replaced `any[]` types with proper `MovieDto[]` type throughout the service
- **Validation**: Added input validation to all controller endpoints using class-validator decorators
- **Validation**: Added DTO validation with class-validator decorators (IsString, IsNotEmpty, IsNumber, Min)
- **API**: Fixed URL encoding issues - all search queries and parameters are now properly encoded
- **Error Handling**: Added try-catch blocks for all OMDb API calls with proper error messages
- **State Management**: Fixed favorites state management - now reloads from file before operations to prevent stale data
- **Pagination**: Fixed pagination validation - now validates page and pageSize are positive integers
- **Response Consistency**: Fixed inconsistent response types - totalResults is now consistently a string
- **Year Parsing**: Improved year parsing to handle formats like "1999-2000" correctly
- **CORS**: Made CORS origins configurable via CORS_ORIGINS environment variable
- **Bootstrap**: Added error handling to application bootstrap process

#### Frontend

- **API Client**: Added comprehensive error handling with custom ApiError class for better error messages
- **API Client**: Added input validation for all API calls
- **API Client**: Fixed URL encoding for all query parameters
- **API Client**: Added network error detection and handling
- **API Client**: Made API base URL configurable via NEXT_PUBLIC_API_URL environment variable
- **React Query**: Added proper TypeScript types to all query hooks
- **React Query**: Added error handling configuration to all queries
- **React Query**: Fixed query invalidation to be more specific (only invalidates relevant queries)
- **UI**: Added loading states to all async operations
- **UI**: Added error display components for failed API calls
- **UI**: Added disabled states to prevent race conditions during mutations
- **UI**: Fixed pagination to handle edge cases (empty results, invalid pages)
- **Performance**: Added React.memo to MovieCard component to prevent unnecessary re-renders
- **Performance**: Added useMemo for totalPages calculation to prevent recalculation on every render
- **Image Handling**: Added proper image error handling with fallback UI
- **Image Handling**: Added loading state for images with skeleton loader
- **Type Safety**: Fixed type inconsistencies - totalResults is now consistently string type
- **Accessibility**: Added aria-labels to favorite toggle buttons

### Changed

- **Backend**: Refactored MoviesService to use proper TypeScript interfaces for OMDb API responses
- **Backend**: Improved error messages throughout the application
- **Backend**: Changed getFavorites to return empty array instead of throwing error when no favorites exist
- **Frontend**: Improved error messages shown to users
- **Frontend**: Enhanced user experience with better loading and error states

### Added

- **Backend**: Added Logger for better debugging and error tracking
- **Backend**: Added ValidationPipe globally with whitelist and transform options
- **Backend**: Added ParseIntPipe for automatic page number parsing and validation
- **Frontend**: Added ApiError class for structured error handling
- **Frontend**: Added disabled prop to MovieCard component
- **Frontend**: Added image error and loading states to MovieCard

### Removed

- **Backend**: Removed hardcoded API key fallback ('demo123')
- **Frontend**: Removed unused imports (useEffect from favorites page)

### Technical Details

#### Backend Changes

1. **movies.service.ts**:
   - Added proper TypeScript interfaces for OMDb API responses
   - Implemented comprehensive error handling for file operations
   - Added automatic data directory creation
   - Fixed favorites state reloading before operations
   - Improved year parsing logic
   - Added proper URL encoding

2. **movies.controller.ts**:
   - Added ValidationPipe with whitelist validation
   - Added ParseIntPipe for page parameter validation
   - Added input validation for query parameters
   - Improved error handling

3. **dto/movie.dto.ts**:
   - Added class-validator decorators for all fields
   - Added validation rules (IsString, IsNotEmpty, IsNumber, Min)

4. **main.ts**:
   - Added global ValidationPipe
   - Made CORS origins configurable
   - Added error handling to bootstrap process

#### Frontend Changes

1. **lib/api.ts**:
   - Complete rewrite with proper error handling
   - Added ApiError class
   - Added input validation
   - Added URL encoding
   - Made API URL configurable

2. **hooks/useMovies.ts**:
   - Added proper TypeScript types
   - Added error handling configuration
   - Improved query invalidation strategy

3. **components/MovieCard.tsx**:
   - Added React.memo for performance
   - Added image error handling
   - Added loading states
   - Added disabled state support

4. **app/page.tsx**:
   - Added error display
   - Added loading states
   - Added race condition prevention
   - Added useMemo for performance

5. **app/favorites/page.tsx**:
   - Added loading and error states
   - Fixed type handling for totalResults
   - Added pagination handling for empty pages

6. **providers/QueryProvider.tsx**:
   - Fixed QueryClient initialization to use useState

7. **types/movie.ts**:
   - Fixed type consistency for totalResults

