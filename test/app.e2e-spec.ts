import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';

describe('app e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);

    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(async () => {
    app.close();
  });

  describe('auth', () => {
    const dto: AuthDto = {
      email: 'test@testmail.com',
      password: 'test1234',
    };

    describe('signUp', () => {
      it('should create a user', async () => {
        return pactum
          .spec()
          .post('/auth/signUp')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('signIn', () => {
      it('should sign in', async () => {
        return pactum
          .spec()
          .post('/auth/signIn')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });

      it('should throw error when no body provided', async () => {
        return pactum
          .spec()
          .post('/auth/signIn')
          .withBody({})
          .expectStatus(400);
      });
    });
  });
  describe('user', () => {
    describe('getUser', () => {
      it('should get user', async () => {
        return pactum
          .spec()
          .get('/user/me')
          .withHeaders({ authorization: 'Bearer $S{userAt}' })
          .expectStatus(200);
      });
      it('should reject without jwtToken user', async () => {
        return pactum.spec().get('/user/me').expectStatus(401);
      });
    });
    describe('editUser', () => {
      const userDto = {
        email: 'newmail@testnet.de',
        firstName: 'Max',
        lastName: 'Mustermann',
      };
      it('should edit user', () => {
        return pactum
          .spec()
          .patch('/user/edit')
          .withHeaders({ authorization: 'Bearer $S{userAt}' })
          .withBody(userDto)
          .expectStatus(200);
      });
    });
  });
  describe('bookmarks', () => {
    describe('Create bookmark', () => {
      it('should create bookmark', () => {
        const createBookmarkDto = {
          title: 'My Bookmark',
          link: 'https://www.google.com',
          description: 'My description',
        };
        return pactum
          .spec()
          .post('/bookmarks/')
          .withHeaders({ authorization: 'Bearer $S{userAt}' })
          .withBody(createBookmarkDto)
          .stores('bmId', 'id')
          .expectStatus(201);
      });
    });
    describe('Get bookmarks', () => {
      it('should get a created bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/$S{bmId}')
          .withHeaders({ authorization: 'Bearer $S{userAt}' })
          .expectStatus(200);
      });
    });
    describe('Get bookmarks by user', () => {
      it('should get a created bookmark by userId', () => {
        return pactum
          .spec()
          .get('/bookmarks/')
          .withHeaders({ authorization: 'Bearer $S{userAt}' })
          .expectStatus(200);
      });
    });
    describe('Edit Bookmark', () => {
      it('should edit a created bookmark', () => {
        const updatedBookmarkDto = {
          link: 'https://www.elunic.de',
          description: 'IIOT 4.0',
        };
        return pactum
          .spec()
          .patch('/bookmarks/$S{bmId}')
          .withBody(updatedBookmarkDto)
          .withHeaders({ authorization: 'Bearer $S{userAt}' })
          .expectStatus(200);
      });
    });
    describe('Delete Bookmark', () => {
      it('should get a created bookmark by userId', () => {
        return pactum
          .spec()
          .delete('/bookmarks/$S{bmId}')
          .withHeaders({ authorization: 'Bearer $S{userAt}' })
          .inspect()
          .expectStatus(200);
      });
    });
  });
});
