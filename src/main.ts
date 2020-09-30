import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as serviceAccount from './musfinder-api-firestore.json';

const admin = require('firebase-admin');
//const serviceAccount = require('./musfinder-api-firestore.json');

async function bootstrap() {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
