import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with all origins (whitelist all IPs)
  app.enableCors({
    origin: true, // Allow all origins
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
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
    .setTitle('Social Media Backend API')
    .setDescription(
      'Complete REST API for social media platform with JWT authentication, messaging, groups, reels, and task management',
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
    .addTag('Auth', 'User registration and login')
    .addTag('Users', 'User management')
    .addTag('Direct Chats', '1-on-1 messaging')
    .addTag('Groups', 'Group management')
    .addTag('Group Members', 'Group membership management')
    .addTag('Group Chats', 'Group messaging')
    .addTag('Reels', 'Video content management')
    .addTag('Task Lists', 'User task management')
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
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `📚 Swagger Documentation available at: http://localhost:${port}/api`,
  );
}
bootstrap();
