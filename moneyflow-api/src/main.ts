import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('/moneyflow/api');
    app.enableCors();

    const port = process.env.PORT || 7000;

    await app.listen(port, '127.0.0.1', async () => {
        console.log(`Running API in NODE ${process.env.NODE_ENV} on ${await app.getUrl()}`);
    });
}
bootstrap();
