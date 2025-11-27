import { MovieDto } from './dto/movie.dto';
interface OMDbMovie {
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
}
export declare class MoviesService {
    private readonly logger;
    private favorites;
    private readonly favoritesFilePath;
    private readonly dataDir;
    private get baseUrl();
    constructor();
    private ensureDataDirectory;
    private loadFavorites;
    private saveFavorites;
    private reloadFavorites;
    private parseYear;
    searchMovies(title: string, page?: number): Promise<{
        movies: OMDbMovie[];
        totalResults: string;
    }>;
    getMovieByTitle(title: string, page?: number): Promise<{
        data: {
            movies: {
                title: string;
                imdbID: string;
                year: number;
                poster: string;
                isFavorite: boolean;
            }[];
            count: number;
            totalResults: string;
        };
    }>;
    addToFavorites(movieToAdd: MovieDto): {
        data: {
            message: string;
        };
    };
    removeFromFavorites(movieId: string): {
        data: {
            message: string;
        };
    };
    getFavorites(page?: number, pageSize?: number): {
        data: {
            favorites: MovieDto[];
            count: number;
            totalResults: string;
            currentPage: number;
            totalPages: number;
        };
    };
}
export {};
