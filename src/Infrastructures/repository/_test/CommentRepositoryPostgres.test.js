const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CreateComment = require('../../../Domains/comments/entities/CreateComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async ()  => {
    await UsersTableTestHelper.addUser({id: 'user-123', username: 'dicoding'});
  });
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });
  afterAll(async () => {
    await pool.end();
  });

  describe('AddComment function', () => {
    it('should add comment to database return created comment correctly', async () => {
      await ThreadsTableTestHelper.addThread({id: 'thread-123', owner: 'user-123'});
      const createComment = new CreateComment({
        content: 'Sebuah Komentar',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const result = await commentRepositoryPostgres.addComment(createComment);

      expect(await CommentsTableTestHelper.findCommentById('comment-123')).toHaveLength(1);
      expect(result).toStrictEqual({
        id: 'comment-123',
        content: 'Sebuah Komentar',
        owner: 'user-123',
      });
    });
  });

  describe('getCommentById function', () => {
    it('should throw NotFoundError when comment not available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(() => commentRepositoryPostgres.getCommentById({}))
        .rejects.toThrowError(NotFoundError);
    });

    it('should get comment object from database correctly', async () => {
      const commentPayload = {
        id: 'comment-123',
        content: 'Sebuah Komentar',
        createdAt: '2023-11-28T17:17:49.829Z',
        threadId: 'thread-123',
        owner: 'user-123',
      };
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment(commentPayload);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const comment = await commentRepositoryPostgres.getCommentById('comment-123');

      expect(comment).toStrictEqual({
        id: 'comment-123',
        content: 'Sebuah Komentar',
        created_at: '2023-11-28T17:17:49.829Z',
        updated_at: '2023-11-28T17:17:49.829Z',
        owner: 'user-123',
        thread_id: 'thread-123',
        is_delete: null,
      });
    });
  });

  describe('updateCommentById function', () => {
    it('should soft delete comment and update database correctly', async () => {
      const commentPayload = {
        id: 'comment-123',
        content: 'Sebuah Komentar',
        created_at: '2023-11-28T17:17:49.829Z',
        thread_id: 'thread-123',
        owner: 'user-123',
        isDelete: null,
      };
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment(commentPayload);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await commentRepositoryPostgres.deleteCommentById('comment-123');
      const deletedComment = await CommentsTableTestHelper.findCommentById('comment-123');

      expect(deletedComment[0].is_delete).toEqual(true);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return all comments related to thread correctly', async () => {
      const thread = {
        id: 'thread-123',
        title: 'Judul A',
        body: 'Badan B',
        owner: 'user-123',
        date: '2023-11-30T06:57:41.032Z',
      };
      const comment = {
        id: 'comment-123',
        content: 'Sebuah Komentar',
        date: '2023-11-30T07:00:59.201Z',
        threadId: thread.id,
        owner: 'user-123',
        isDelete: null,
      };
      const deletedComment = {
        id: 'comment-456',
        content: 'Sebuah Komentar',
        date: '2023-11-30T07:01:17.153Z',
        threadId: thread.id,
        owner: 'user-123',
        isDelete: true,
      };
      await ThreadsTableTestHelper.addThread(thread);
      await CommentsTableTestHelper.addComment(comment);
      await CommentsTableTestHelper.addComment(deletedComment);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      expect(comments).toStrictEqual([
        {
          id: 'comment-123',
          username: 'dicoding',
          created_at: '2023-11-30T07:00:59.201Z',
          updated_at: '2023-11-30T07:00:59.201Z',
          owner: 'user-123',
          thread_id: 'thread-123',
          is_delete: null,
          content: 'Sebuah Komentar'
        },
        {
          id: 'comment-456',
          username: 'dicoding',
          created_at: '2023-11-30T07:01:17.153Z',
          updated_at: '2023-11-30T07:01:17.153Z',
          owner: 'user-123',
          thread_id: 'thread-123',
          is_delete: true,
          content: 'Sebuah Komentar',
        },
      ]);
    });
  });
});