const GetThread = require('../GetThread');

describe('a GetThread entity', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {};

    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      id: {},
      title: 'Judul A',
      body: 'Badan B',
      created_at: [],
      username: 'dicoding',
      comments: [],
    };

    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetThread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'Judul A',
      body: 'Badan B',
      created_at: '2023-12-01T20:17:29.065Z',
      username: 'dicoding',
      comments: [],
    };

    const thread = new GetThread(payload);

    expect(thread.id).toEqual(payload.id);
    expect(thread.title).toEqual(payload.title);
    expect(thread.body).toEqual(payload.body);
    expect(thread.date).toEqual(payload.created_at);
    expect(thread.username).toEqual(payload.username);
  });
});
