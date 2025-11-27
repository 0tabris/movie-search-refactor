"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoviesController = void 0;
const common_1 = require("@nestjs/common");
const movies_service_1 = require("./movies.service");
const movie_dto_1 = require("./dto/movie.dto");
let MoviesController = class MoviesController {
    moviesService;
    constructor(moviesService) {
        this.moviesService = moviesService;
    }
    async searchMovies(query, page) {
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            throw new common_1.HttpException('Search query is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const pageNumber = page && page > 0 ? page : 1;
        return await this.moviesService.getMovieByTitle(query.trim(), pageNumber);
    }
    addToFavorites(movieToAdd) {
        return this.moviesService.addToFavorites(movieToAdd);
    }
    removeFromFavorites(imdbID) {
        if (!imdbID || typeof imdbID !== 'string' || imdbID.trim().length === 0) {
            throw new common_1.HttpException('Movie ID is required', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.moviesService.removeFromFavorites(imdbID.trim());
    }
    getFavorites(page) {
        const pageNumber = page && page > 0 ? page : 1;
        return this.moviesService.getFavorites(pageNumber);
    }
};
exports.MoviesController = MoviesController;
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], MoviesController.prototype, "searchMovies", null);
__decorate([
    (0, common_1.Post)('favorites'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [movie_dto_1.MovieDto]),
    __metadata("design:returntype", void 0)
], MoviesController.prototype, "addToFavorites", null);
__decorate([
    (0, common_1.Delete)('favorites/:imdbID'),
    __param(0, (0, common_1.Param)('imdbID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MoviesController.prototype, "removeFromFavorites", null);
__decorate([
    (0, common_1.Get)('favorites/list'),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MoviesController.prototype, "getFavorites", null);
exports.MoviesController = MoviesController = __decorate([
    (0, common_1.Controller)('movies'),
    __metadata("design:paramtypes", [movies_service_1.MoviesService])
], MoviesController);
//# sourceMappingURL=movies.controller.js.map