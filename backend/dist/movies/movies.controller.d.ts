import { MoviesService } from './movies.service';
import { MovieDto } from './dto/movie.dto';
export declare class MoviesController {
    private readonly moviesService;
    constructor(moviesService: MoviesService);
    searchMovies(query: string, page?: number): Promise<{
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
    removeFromFavorites(imdbID: string): {
        data: {
            message: string;
        };
    };
    getFavorites(page?: number): {
        data: {
            favorites: MovieDto[];
            count: number;
            totalResults: string;
            currentPage: number;
            totalPages: number;
        };
    };
}
