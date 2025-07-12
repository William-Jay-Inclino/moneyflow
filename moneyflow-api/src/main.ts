import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('/moneyflow/api');
    app.enableCors();

    // Request logging middleware
    app.use((req: any, res: any, next: any) => {
        const { method, url, body, params, query } = req;
        console.log(`🌐 [${new Date().toISOString()}] ${method} ${url}`);
        if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
            console.log('📦 Request body:', JSON.stringify(body, null, 2));
        }
        if (Object.keys(params || {}).length > 0) {
            console.log('🔗 Request params:', params);
        }
        if (Object.keys(query || {}).length > 0) {
            console.log('🔍 Request query:', query);
        }
        next();
    });

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
