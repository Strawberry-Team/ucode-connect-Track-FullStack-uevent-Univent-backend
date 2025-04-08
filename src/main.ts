// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import { CsrfExceptionFilter } from './common/filters/csrf-exception.filter';
import { CsrfError } from './common/filters/csrf-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.use(cookieParser());

    const configService = app.get(ConfigService);
    const globalPrefix = String(configService.get<string>('app.globalPrefix'));
    const port = Number(configService.get<number>('app.port'));
    const host = String(configService.get<number>('app.host'));
    const protocol = String(configService.get<number>('app.protocol'));
    const baseUrl = `${protocol}://${host}${port ? `:${port}` : ''}`;
    const frontendOrigin = String(
        configService.get<string>('app.frontendLink'),
    ).endsWith('/')
        ? String(configService.get<string>('app.frontendLink')).slice(0, -1)
        : String(configService.get<string>('app.frontendLink'));
    const csrfConfig = configService.get('app.csrf');
    const corsConfig = configService.get('app.cors');
    const nodeEnv = String(configService.get('app.nodeEnv'));

    app.useGlobalFilters(new CsrfExceptionFilter());

    app.setGlobalPrefix(globalPrefix);

    app.useStaticAssets('public');

    app.enableCors({ //TODO: read more about cors. about Postman.
        origin: frontendOrigin,
        methods: corsConfig.methods,
        allowedHeaders: corsConfig.allowedHeaders,
        credentials: corsConfig.credentials, // Required to send cookies cross-origin
    });

    // app.use( //TODO: uncomment when using csrf
    //     csurf({
    //         cookie: {
    //             key: csrfConfig.cookie.key,
    //             httpOnly: csrfConfig.cookie.httpOnly, //Not available via JS
    //             secure: nodeEnv === 'production', //cookies are only transmitted via HTTPS
    //             sameSite: csrfConfig.cookie.sameSite, //Cookies will only be sent for requests originating from the same domain (site)
    //         },
    //         ignoreMethods: csrfConfig.ignoreMethods,
    //     }),
    // );
    //
    // app.use((err: any, req: any, res: any, next: any) => {
    //     if (err && err.code === 'EBADCSRFTOKEN') {
    //         next(new CsrfError());
    //     } else {
    //         next(err);
    //     }
    // });

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true, // automatically convert incoming primitive values into instances of classes specified in the DTO
            transformOptions: {
                enableImplicitConversion: true, // Enable implicit type conversion
                exposeDefaultValues: true, // Expose default values in the transformed object
            },
            whitelist: true, // Filters out properties that do not have decorators
            forbidNonWhitelisted: false, // Does not generate an error if there are extra fields
            validateCustomDecorators: true, // Validate custom decorators
        }),
    );

    const configAPIDoc = new DocumentBuilder()
        .setTitle('uevent API')
        .setDescription('The uevent API documentation')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'Authorization',
                description: 'Enter JWT access token',
                in: 'header',
            },
            'JWT',
        )
        .addTag('Auth')
        .addTag('Users')
        .addTag('Companies')
        .addTag('Companies')
        .addTag('Events')
        .addTag('Orders')
        .addTag('Tickets')
        .addTag('Promo codes')
        .build();

    const document = SwaggerModule.createDocument(app, configAPIDoc);

    SwaggerModule.setup('api', app, document,  {
        /* Keeps token even after reload */
        swaggerOptions: {
            persistAuthorization: true,
        },
    });

    await app.listen(port);

    console.log(`\n✔ Application is running on: ${baseUrl}`);
    console.log(`\n✔ API Docs is available on: ${baseUrl}/${globalPrefix}\n`);
}

bootstrap();
