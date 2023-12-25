const GetThread = require('../../Domains/threads/entities/GetThread');
const GetComment = require('../../Domains/comments/entities/GetComment');

class GetThreadUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const mappedComments = [];

    comments.map(comment => {
      mappedComments.push(new GetComment({ ...comment }));
    });

    return new GetThread({ ...thread, comments: mappedComments });
  }
};

module.exports = GetThreadUseCase;
