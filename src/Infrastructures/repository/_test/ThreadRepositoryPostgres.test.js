const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CreateThread = require('../../../Domains/threads/entities/CreateThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
  });
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist create thread', async () => {
      const createThread = new CreateThread({
        title: 'Judul a',
        body: 'Badan b',
        owner: 'user-123'
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await threadRepositoryPostgres.addThread(createThread);

      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return created thread correctly', async () => {
      const createThread = new CreateThread({
        title: 'Judul a',
        body: 'Badan b',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const createdThread = await threadRepositoryPostgres.addThread(createThread);

      expect(createdThread).toStrictEqual({
        id: 'thread-123',
        title: 'Judul a',
        owner: 'user-123',
      });
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.getThreadById('dicoding'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return thread object correctly', async () => {
      const thread = {
        id: 'thread-123',
        title: 'Judul A',
        body: 'Badan B',
        owner: 'user-123',
        date: '2023-11-28T17:17:49.829Z'
      };

      await ThreadsTableTestHelper.addThread(thread);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const result = await threadRepositoryPostgres.getThreadById('thread-123');

      expect(result).toStrictEqual({
        id: thread.id,
        title: thread.title,
        body: thread.body,
        created_at: thread.date,
        updated_at: '2023-11-28T17:17:49.829Z',
        owner: 'user-123',
        username: 'dicoding',
      });
    });
  });
});
