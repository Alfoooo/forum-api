const CreateComment = require('../../Domains/comments/entities/CreateComment');
const CreatedComment = require('../../Domains/comments/entities/CreatedComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository}) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    await this._threadRepository.getThreadById(threadId);
    const createComment = new CreateComment(useCasePayload);
    const addedComment = await this._commentRepository.addComment(createComment);
    return new CreatedComment({ ...addedComment });
  }
}

module.exports = AddCommentUseCase;
