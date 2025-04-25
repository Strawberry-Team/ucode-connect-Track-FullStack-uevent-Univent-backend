// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as csurf from 'csurf';
import { CsrfExceptionFilter } from './common/filters/csrf-exception.filter';
import { CsrfError } from './common/filters/csrf-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { applySwaggerSecurity } from './common/enhancers/swagger-security.enhancer';

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
    // const enableCsrfProtection = nodeEnv === 'production';

    app.useGlobalFilters(new CsrfExceptionFilter());
    app.setGlobalPrefix(globalPrefix);
    app.useStaticAssets('public');

    app.use((req: any, res: any, next: any) => {
        if (req.originalUrl === '/payments/stripe/webhook') {
            express.raw({ type: 'application/json' })(req, res, next);
        } else {
            express.json()(req, res, next);
        }
    });

    app.enableCors({
        //TODO: read more about cors. about Postman.
        origin: frontendOrigin,
        methods: corsConfig.methods,
        allowedHeaders: corsConfig.allowedHeaders,
        credentials: corsConfig.credentials, // Required to send cookies cross-origin
    });

    app.use(
        csurf({
            cookie: {
                key: csrfConfig.cookie.key,
                httpOnly: csrfConfig.cookie.httpOnly, //Not available via JS
                secure: nodeEnv === 'production', //Cookies are only transmitted via HTTPS
                sameSite: csrfConfig.cookie.sameSite, //Cookies will only be sent for requests originating from the same domain (site)
            },
            ignoreMethods: csrfConfig.ignoreMethods,
        }),
    );
    app.use((err: any, req: any, res: any, next: any) => {
        if (err && err.code === 'EBADCSRFTOKEN') {
            next(new CsrfError());
        } else {
            next(err);
        }
    });

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true, // Automatically convert incoming primitive values into instances of classes specified in the DTO
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
            'access-token',
        )
        .addApiKey(
            {
                type: 'apiKey',
                name: 'X-CSRF-TOKEN',
                in: 'header',
            },
            'csrf-token',
        )
        .build();

    const document = SwaggerModule.createDocument(app, configAPIDoc);

    applySwaggerSecurity(app, document, globalPrefix);

    SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
            ...(nodeEnv !== 'production' && { docExpansion: 'none' }),
            filter: true,
            withTryItOutOption: true, // whether to display the button at all
            tryItOutEnabled: false, // whether to activate the test mode automatically
            displayRequestDuration: true,
        },
        customSiteTitle: 'Uevent API',
        customfavIcon: './project/logo.png',
    });

    app.use(
        '/',
        (
            req: { originalUrl: string },
            res: { redirect: (arg0: string) => any },
            next: () => void,
        ) => {
            if (req.originalUrl === '/' || req.originalUrl === '') {
                return res.redirect('/api');
            }
            next();
        },
    );

    await app.listen(port);

    console.log(`\n✔ Application is running on: ${baseUrl}`);
    console.log(`\n✔ API Docs is available on: ${baseUrl}/${globalPrefix}\n`);
}

bootstrap();
