class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._verifyUseCasePayload(useCasePayload);

    const { commentId, threadId, credentialId } = useCasePayload;

    await this._threadRepository.getThreadById(threadId);
    const comment = await this._commentRepository.getCommentById(commentId);

    if (credentialId !== comment.owner) {
      throw new Error('DELETE_COMMENT.CREDENTIALS_AND_OWNER_DO_NOT_MATCH');
    }

    await this._commentRepository.deleteCommentById(comment.id);
  }

  _verifyUseCasePayload(useCasePayload) {
    const { commentId, threadId, credentialId } = useCasePayload;

    if (!commentId || !threadId || !credentialId) {
      throw new Error('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof commentId !== 'string' || typeof threadId !== 'string' || typeof credentialId !== 'string') {
      throw new Error('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteCommentUseCase;