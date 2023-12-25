const CreateThread = require('../../Domains/threads/entities/CreateThread');
const CreatedThread = require('../../Domains/threads/entities/CreatedThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const createThread = new CreateThread(useCasePayload);
    const addedThread = await this._threadRepository.addThread(createThread);
    return new CreatedThread({ ...addedThread });
  }
}

module.exports = AddThreadUseCase;
