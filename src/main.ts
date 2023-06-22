import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = process.env.PORT
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  await app.listen(PORT, () => console.log(`Work on ${PORT}`));
}
bootstrap();
