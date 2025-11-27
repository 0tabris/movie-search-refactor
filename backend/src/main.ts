import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Validate required environment variables on startup
  if (!process.env.OMDB_API_KEY) {
    console.error('❌ Error: OMDB_API_KEY environment variable is required');
    console.error('   Please add OMDB_API_KEY to your .env file');
    console.error('   Get a free API key at: http://www.omdbapi.com/apikey.aspx');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  
  const allowedOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:3000'];
  
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  
  try {
    await app.listen(port);
    console.log(`✅ Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap();
