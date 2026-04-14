import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { applyWidgetEmbedCors } from './widget/widget-embed-cors.middleware';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(applyWidgetEmbedCors);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET) returns status', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('services');
      });
  });

  it('/widget/message (POST) requires API key', () => {
    return request(app.getHttpServer())
      .post('/widget/message')
      .send({ message: 'test', chatId: 'test-123' })
      .expect(401);
  });

  it('/widget/message (OPTIONS) preflight allows embed origin', () => {
    return request(app.getHttpServer())
      .options('/widget/message')
      .set('Origin', 'https://customer-embed.example')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type')
      .expect(204)
      .expect('Access-Control-Allow-Origin', '*')
      .expect('Access-Control-Allow-Headers', /Content-Type/);
  });

  it('/widget/chat/:id (GET) includes embed CORS headers', () => {
    return request(app.getHttpServer())
      .get('/widget/chat/some-id?apiKey=invalid')
      .set('Origin', 'https://customer-embed.example')
      .expect(401)
      .expect('Access-Control-Allow-Origin', '*');
  });
});
