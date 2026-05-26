import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>('port') || 3001;
  const apiPrefix = config.get<string>('apiPrefix') || 'api/v1';
  const frontendUrl = config.get<string>('frontendUrl') || 'http://localhost:3000';

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cookieParser(config.get<string>('cookie.secret')));

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AgentHive API')
    .setDescription(
      'AgentHive MVP — AI-powered freelance marketplace. ' +
        'Auth uses HttpOnly cookies set by `/auth/login`. The "Authorize" bearer field is provided for tools that prefer header auth.',
    )
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .addCookieAuth('access_token', { type: 'apiKey', in: 'cookie', name: 'access_token' })
    .addTag('Auth', 'Register, login, refresh, logout, Google OAuth')
    .addTag('Users', 'Profile management')
    .addTag('Jobs', 'Job posting, listing, bids')
    .addTag('Bidder Agent', 'AI bidder agent config and scoring')
    .addTag('Payments', 'Escrow funding, release, refund')
    .addTag('Dispatch & Delivery', 'Job dispatch, delivery submission, revisions')
    .addTag('Reviews', 'Buyer→Freelancer ratings')
    .addTag('Disputes', 'File and view disputes')
    .addTag('Notifications', 'In-app notifications')
    .addTag('Admin', 'Admin moderation, stats, disputes, audit logs')
    .addTag('Health', 'Liveness probe')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port);
  console.log(`AgentHive API running on http://localhost:${port}/${apiPrefix}`);
  console.log(`Swagger docs at http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
