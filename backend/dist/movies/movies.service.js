"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MoviesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoviesService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let MoviesService = MoviesService_1 = class MoviesService {
    logger = new common_1.Logger(MoviesService_1.name);
    favorites = [];
    favoritesFilePath = path.join(process.cwd(), 'data', 'favorites.json');
    dataDir = path.join(process.cwd(), 'data');
    get baseUrl() {
        const apiKey = process.env.OMDB_API_KEY;
        if (!apiKey) {
            throw new common_1.HttpException('OMDB_API_KEY environment variable is required', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return `http://www.omdbapi.com/?apikey=${apiKey}`;
    }
    constructor() {
        this.ensureDataDirectory();
        this.loadFavorites();
    }
    ensureDataDirectory() {
        try {
            if (!fs.existsSync(this.dataDir)) {
                fs.mkdirSync(this.dataDir, { recursive: true });
                this.logger.log(`Created data directory: ${this.dataDir}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to create data directory: ${error}`);
            throw new common_1.HttpException('Failed to initialize data directory', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    loadFavorites() {
        try {
            if (fs.existsSync(this.favoritesFilePath)) {
                const fileContent = fs.readFileSync(this.favoritesFilePath, 'utf-8');
                const parsed = JSON.parse(fileContent);
                if (Array.isArray(parsed)) {
                    this.favorites = parsed;
                }
                else {
                    this.logger.warn('Favorites file contains invalid data, resetting to empty array');
                    this.favorites = [];
                }
            }
            else {
                this.favorites = [];
                this.saveFavorites();
            }
        }
        catch (error) {
            this.logger.error(`Failed to load favorites: ${error}`);
            this.favorites = [];
        }
    }
    saveFavorites() {
        try {
            this.ensureDataDirectory();
            fs.writeFileSync(this.favoritesFilePath, JSON.stringify(this.favorites, null, 2), 'utf-8');
        }
        catch (error) {
            this.logger.error(`Failed to save favorites: ${error}`);
            throw new common_1.HttpException('Failed to save favorites', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    reloadFavorites() {
        this.loadFavorites();
    }
    parseYear(yearString) {
        if (!yearString)
            return 0;
        const yearMatch = yearString.match(/^\d{4}/);
        return yearMatch ? parseInt(yearMatch[0], 10) : 0;
    }
    async searchMovies(title, page = 1) {
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            throw new common_1.HttpException('Search title is required', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!Number.isInteger(page) || page < 1) {
            throw new common_1.HttpException('Page must be a positive integer', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const encodedTitle = encodeURIComponent(title.trim());
            const response = await axios_1.default.get(`${this.baseUrl}&s=${encodedTitle}&plot=full&page=${page}`);
            if (response.data.Response === 'False' || response.data.Error) {
                return { movies: [], totalResults: '0' };
            }
            return {
                movies: response.data.Search || [],
                totalResults: response.data.totalResults || '0',
            };
        }
        catch (error) {
            this.logger.error(`OMDb API error: ${error}`);
            if (axios_1.default.isAxiosError(error)) {
                throw new common_1.HttpException('Failed to fetch movies from OMDb API', common_1.HttpStatus.SERVICE_UNAVAILABLE);
            }
            throw error;
        }
    }
    async getMovieByTitle(title, page = 1) {
        this.reloadFavorites();
        const response = await this.searchMovies(title, page);
        const formattedResponse = response.movies.map((movie) => {
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
    addToFavorites(movieToAdd) {
        if (!movieToAdd || !movieToAdd.imdbID) {
            throw new common_1.HttpException('Invalid movie data', common_1.HttpStatus.BAD_REQUEST);
        }
        this.reloadFavorites();
        const foundMovie = this.favorites.find((movie) => movie.imdbID === movieToAdd.imdbID);
        if (foundMovie) {
            throw new common_1.HttpException('Movie already in favorites', common_1.HttpStatus.BAD_REQUEST);
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
    removeFromFavorites(movieId) {
        if (!movieId || typeof movieId !== 'string' || movieId.trim().length === 0) {
            throw new common_1.HttpException('Movie ID is required', common_1.HttpStatus.BAD_REQUEST);
        }
        this.reloadFavorites();
        const foundIndex = this.favorites.findIndex((movie) => movie.imdbID === movieId);
        if (foundIndex === -1) {
            throw new common_1.HttpException('Movie not found in favorites', common_1.HttpStatus.NOT_FOUND);
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
    getFavorites(page = 1, pageSize = 10) {
        if (!Number.isInteger(page) || page < 1) {
            throw new common_1.HttpException('Page must be a positive integer', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!Number.isInteger(pageSize) || pageSize < 1) {
            throw new common_1.HttpException('Page size must be a positive integer', common_1.HttpStatus.BAD_REQUEST);
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
};
exports.MoviesService = MoviesService;
exports.MoviesService = MoviesService = MoviesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MoviesService);
//# sourceMappingURL=movies.service.js.map