"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    if (!process.env.OMDB_API_KEY) {
        console.error('❌ Error: OMDB_API_KEY environment variable is required');
        console.error('   Please add OMDB_API_KEY to your .env file');
        console.error('   Get a free API key at: http://www.omdbapi.com/apikey.aspx');
        process.exit(1);
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const allowedOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',')
        : ['http://localhost:3000'];
    app.enableCors({
        origin: allowedOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const port = process.env.PORT || 3001;
    try {
        await app.listen(port);
        console.log(`✅ Application is running on: ${await app.getUrl()}`);
    }
    catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map