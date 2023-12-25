class GetComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { id, username, created_at: createdAt, content, is_delete: isDelete } = payload;
    
    this.id = id;
    this.username = username;
    this.date = createdAt;
    this.content = isDelete ? '**komentar telah dihapus**' : content;
  }

  _verifyPayload(payload) {
    const { id, username, created_at: createdAt, content } = payload;

    if (!id || !username || !createdAt || !content) {
      throw new Error('GET_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string' ||
      typeof username !== 'string' ||
      typeof createdAt !== 'string' ||
      typeof content !== 'string'
    ) {
      throw new Error('GET_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = GetComment;
