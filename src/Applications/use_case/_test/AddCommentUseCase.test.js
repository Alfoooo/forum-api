const CreateComment = require('../../../Domains/comments/entities/CreateComment');
const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const useCasePayload = {
      content: 'Sebuah Komentar',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    const mockCreatedComment = new CreatedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockCreatedComment));
    mockThreadRepository.getThreadById = jest.fn().mockResolvedValue();

    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const createComment = await getCommentUseCase.execute(useCasePayload);

    expect(createComment).toStrictEqual(new CreatedComment({
      id: 'comment-123',
      content: 'Sebuah Komentar',
      owner: 'user-123',
    }));
    expect(mockCommentRepository.addComment).toBeCalledWith(new CreateComment(useCasePayload));
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
  });
});
