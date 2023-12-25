const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ServerTestHelper = require("../../../../tests/ServerTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const container = require("../../container");
const pool = require("../../database/postgres/pool");
const createServer = require('../createServer');

describe('/threads/{id}/comments endpoint', () => {
  afterEach(async () => {
    await ServerTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });
  
  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{id}/comments', () => {
    it('should response 201 and persisted comments', async () => {
      const requestPayload = {
        content: 'Sebuah Komentar',
      };
      const accessToken = await ServerTestHelper.getAccessToken({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threads[0].id}/comments`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {};
      const accessToken = await ServerTestHelper.getAccessToken({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threads[0].id}/comments`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        content: [],
      };
      const accessToken = await ServerTestHelper.getAccessToken({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threads[0].id}/comments`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 401 when client is unauthenticated', async () => {
      const requestPayload = {
        content: 'Sebuah Komentar',
      };
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threads[0].id}/comments`,
        payload: requestPayload,
      });

      expect(response.statusCode).toEqual(401);
    });

    it('should response 404 when thread not available', async () => {
      const requestPayload = {
        content: 'Sebuah Komentar',
      };
      const accessToken = await ServerTestHelper.getAccessToken({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadId = 'awdafqwe';

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 404 when thread not available', async () => {
      const accessToken = await ServerTestHelper.getAccessToken({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123'});
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const threadId = 'awkakakrfaw';
      const commentId = 'comment-123';

      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment not available', async () => {
      const accessToken = await ServerTestHelper.getAccessToken('user-123');
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123'});
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const threadId = 'thread-123';
      const commentId = 'aawkrqwtj';

      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 403 when credential and comment\'s owner not match', async () => {
      const accessToken = await ServerTestHelper.getAccessToken({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: 'other_user', username: 'other_user' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'other_user',
      });
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak berhak mengakses resource ini');
    });

    it('should response 401 when client is unauthenticated', async () => {
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
      });

      expect(response.statusCode).toEqual(401);
    });

    it('should response 200 and soft delete the comment correctly', async () => {
      const accessToken = await ServerTestHelper.getAccessToken({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123'});
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });
      const comment = await CommentsTableTestHelper.findCommentById(commentId);

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(comment[0].is_delete).toEqual(true);
    });
  });
});