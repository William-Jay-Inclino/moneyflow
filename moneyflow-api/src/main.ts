import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('/moneyflow/api');
    app.enableCors();

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));

    // Swagger configuration
    const config = new DocumentBuilder()
        .setTitle('MoneyFlow API')
        .setDescription('API for tracking income and expenses')
        .setVersion('1.0')
        .addTag('user-expenses', 'User expense management')
        .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('moneyflow/api/docs', app, document);

    const port = process.env.PORT || 7000;

    await app.listen(port, '127.0.0.1', async () => {
        console.log(`Running API in NODE ${process.env.NODE_ENV} on ${await app.getUrl()}`);
        console.log(`Swagger docs available at ${await app.getUrl()}/docs`);
    });
}
bootstrap();
