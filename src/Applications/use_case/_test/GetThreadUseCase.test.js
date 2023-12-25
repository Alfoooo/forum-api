const GetThreadUseCase = require('../GetThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThread = require('../../../Domains/threads/entities/GetThread');
const GetComment = require('../../../Domains/comments/entities/GetComment');

describe('GetThreadUseCase', () => {
  it('should orchestrating get thread use case action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
    };
    const thread = {
      id: 'thread-123',
      title: 'Judul A',
      body: 'Badan B',
      created_at: '2023-11-28T17:17:49.829Z',
      updated_at: '2023-11-28T17:17:49.829Z',
      owner: 'user-123',
      username: 'dicoding',
    };
    const comment = {
      id: 'comment-123',
      username: 'dicoding',
      created_at: '2023-12-04T15:38:53.043Z',
      updated_at: '2023-12-04T15:38:53.043Z',
      owner: 'user-123',
      thread_id: 'thread-123',
      is_delete: null,
      content: 'Sebuah Komentar'
    };
    const deletedComment = {
      id: 'comment-456',
      username: 'dicoding',
      created_at: '2023-12-04T15:39:10.218Z',
      updated_at: '2023-12-04T15:39:10.218Z',
      owner: 'user-123',
      thread_id: 'thread-123',
      is_delete: true,
      content: 'Sebuah Komentar',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(thread));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        comment,
        deletedComment,
      ]));

    const getThreadUseCase = new GetThreadUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const getThread = await getThreadUseCase.execute(useCasePayload);

    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(getThread).toStrictEqual(new GetThread({
      id: 'thread-123',
      title: 'Judul A',
      body: 'Badan B',
      created_at: '2023-11-28T17:17:49.829Z',
      username: 'dicoding',
      comments: [
        new GetComment({
          id: 'comment-123',
          username: 'dicoding',
          created_at: '2023-12-04T15:38:53.043Z',
          updated_at: '2023-12-04T15:38:53.043Z',
          owner: 'user-123',
          thread_id: 'thread-123',
          is_delete: null,
          content: 'Sebuah Komentar'
        }),
        new GetComment({
          id: 'comment-456',
          username: 'dicoding',
          created_at: '2023-12-04T15:39:10.218Z',
          updated_at: '2023-12-04T15:39:10.218Z',
          owner: 'user-123',
          thread_id: 'thread-123',
          is_delete: true,
          content: 'Sebuah Komentar',
        }),
      ],
    }));
  });
});
