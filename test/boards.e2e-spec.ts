import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';

describe('BoardsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let userToken: string;
  let adminToken: string;

  let userId: number;
  let adminId: number;

  let createdBoardId: number;
  let userTaskId: number;
  let otherTaskId: number;

  const userEmail = 'user@test.com';
  const adminEmail = 'admin@test.com';
  const password = '123456';

  beforeAll(async () => {

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.use(cookieParser());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    const userRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: userEmail, password })
      .expect(201);

    userToken = userRes.body.accessToken;

    const adminRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: adminEmail, password })
      .expect(201);

    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    adminId = adminUser!.id;

    await prisma.user.update({
      where: { id: adminId },
      data: { role: Role.ADMIN },
    });

    const loginUser = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userEmail, password })
      .expect(200);

    userToken = loginUser.body.accessToken;

    const loginAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password })
      .expect(200);

    adminToken = loginAdmin.body.accessToken;

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    userId = user!.id;
  });

  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.board.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { in: [userEmail, adminEmail] } },
    });

    await app.close();
  });

  it('1. role column exists', async () => {

    const user = await prisma.user.findFirst();

    expect(user).toHaveProperty('role');
  });

  it('2. register/login without token works', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'temp@test.com', password })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: userEmail, password })
      .expect(200);

  });

  it('3. GET /boards без токена → 401', async () => {
    await request(app.getHttpServer()).get('/boards').expect(401);
  });

  it('4. GET /boards USER → 200', async () => {
    await request(app.getHttpServer())
      .get('/boards')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
  });

  it('5. POST /boards USER → 403', async () => {
    await request(app.getHttpServer())
      .post('/boards')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'User board' })
      .expect(403);
  });

  it('6. POST /boards ADMIN → 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/boards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Тестовая доска' })
      .expect(201);

    createdBoardId = res.body.id;
  });

  it('7. POST /tasks берет userId из токена', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Task',
        description: 'desc',
        status: 'OPEN',
        boardId: createdBoardId,

      })
      .expect(201);

    userTaskId = res.body.id;

    expect(res.body.userId).toBe(userId);
  });

  it('8. PATCH своей задачи → 200', async () => {
    await request(app.getHttpServer())
      .patch(`/tasks/${userTaskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'updated' })
      .expect(200);
  });

  it('9. PATCH чужой задачи USER → 403', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Admin task',
        description: 'desc',
        status: 'OPEN',
        boardId: createdBoardId,
      });

    otherTaskId = res.body.id;

    await request(app.getHttpServer())
      .patch(`/tasks/${otherTaskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'hack' })
      .expect(403);
  });

  it('10. DELETE чужой задачи ADMIN → 200', async () => {
    await request(app.getHttpServer())
      .delete(`/tasks/${otherTaskId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  describe('GET /users/me', () => {
    it('без токена → 401', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('USER → 200 + без password', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('tasks');
      expect(res.body).not.toHaveProperty('password');
    });
  });
});