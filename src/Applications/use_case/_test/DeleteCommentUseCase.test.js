const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteCommentUseCase', () => {
  it('should throw error when payload not contain needed property', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({});

    await expect(() => deleteCommentUseCase.execute(useCasePayload))
      .rejects.toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', async () => {
    const useCasePayload = {
      commentId: [],
      threadId: {},
      credentialId: 123,
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({});

    await expect(() => deleteCommentUseCase.execute(useCasePayload))
      .rejects.toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when credential and owner do not match', async () => {
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      credentialId: 'bad_user',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue();
    mockCommentRepository.getCommentById = jest.fn().mockImplementation(() => Promise.resolve({
      id: 'comment-123',
      thread_id: 'thread-123',
      owner: 'user-123',
    }));

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(() => deleteCommentUseCase.execute(useCasePayload))
      .rejects.toThrowError('DELETE_COMMENT.CREDENTIALS_AND_OWNER_DO_NOT_MATCH');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      credentialId: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({}));
    mockCommentRepository.getCommentById = jest.fn().mockImplementation(() => Promise.resolve({
      id: 'comment-123',
      thread_id: 'thread-123',
      owner: 'user-123',
    }));
    mockCommentRepository.deleteCommentById = jest.fn().mockResolvedValue();

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await deleteCommentUseCase.execute(useCasePayload);

    expect(mockCommentRepository.getCommentById).toBeCalledWith('comment-123');
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith('comment-123');
  });
});
