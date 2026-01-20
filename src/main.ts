import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup WebSocket Adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Enable CORS with all origins (whitelist all IPs)
  app.enableCors({
    origin: true, // Accept requests from any origin
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*', // Allow all headers
    exposedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Total-Count',
      'X-Page-Count',
    ],
    maxAge: 86400,
  });

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: true,
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Job Tracking Backend API')
    .setDescription(
      'REST API for real-time job tracking with location updates, status management, and Redis caching',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT',
    )
    .addTag('Health', 'Health check and status')
    .addTag('Auth', 'User registration and login')
    .addTag('Jobs', 'Job creation and management')
    .addTag('Tracking', 'Real-time location tracking')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
      filter: true,
      showRequestHeaders: true,
      docExpansion: 'list',
    },
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js',
    ],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `📚 Swagger Documentation available at: http://localhost:${port}/api`,
  );
  console.log(`🔌 WebSocket available at: ws://localhost:${port}`);
}
bootstrap();
