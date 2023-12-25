const GetComment = require('../GetComment');

describe('a GetComment entity', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      id: 'getCom1'
    };

    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      id: [],
      content: 'Sebuah Komentar',
      created_at: '2023-12-01T19:28:00.604Z',
      is_delete: null,
      username: 'dicoding',
    };

    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create comment object correctly', () => {
    const comment = {
      id: 'comment-123',
      content: 'Sebuah Komentar',
      created_at: '2023-12-01T19:28:00.604Z',
      is_delete: null,
      username: 'dicoding',
    };

    const deletedComment = {
      id: 'comment-456',
      content: 'Sebuah Komentar',
      created_at: '2023-12-01T19:28:00.604Z',
      is_delete: true,
      username: 'dicoding',
    };

    const getComment = new GetComment(comment);
    const getDeletedComment = new GetComment(deletedComment);

    expect(getComment.id).toEqual(comment.id);
    expect(getComment.username).toEqual(comment.username);
    expect(getComment.date).toEqual(comment.created_at);
    expect(getComment.content).toEqual(comment.content);
    expect(getDeletedComment.id).toEqual(deletedComment.id);
    expect(getDeletedComment.username).toEqual(deletedComment.username);
    expect(getDeletedComment.date).toEqual(deletedComment.created_at);
    expect(getDeletedComment.content).toEqual('**komentar telah dihapus**');
  });
});