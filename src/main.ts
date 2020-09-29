import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const admin = require('firebase-admin');
const serviceAccount = require('./musfinder-api-firestore.json');

async function bootstrap() {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
