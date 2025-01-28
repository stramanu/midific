import "reflect-metadata"
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {CONFIG} from "./config/configuration";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: CONFIG().cors.origins,
    methods: ["GET", "POST"],
    credentials: true,
  });
  console.log(CONFIG().port)
  await app.listen(CONFIG().port);
}
bootstrap();
