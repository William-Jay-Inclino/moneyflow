import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Reflector } from '@nestjs/core';
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

    // Global class serializer interceptor to handle @Exclude decorators
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

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

    await app.listen(port, '0.0.0.0', async () => {
        console.log(`Running API in NODE ${process.env.NODE_ENV} on http://0.0.0.0:${port}`);
        console.log(`Swagger docs available at http://localhost:${port}/moneyflow/api/docs`);
    });
}
bootstrap();
