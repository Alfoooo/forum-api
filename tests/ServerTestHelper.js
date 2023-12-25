/* istanbul ignore file */
const UsersTableTestHelper = require('./UsersTableTestHelper');
const Jwt = require('@hapi/jwt');

const ServerTestHelper = {
  async getAccessToken({
    id = 'user-123',
    username = 'dicoding',
    password = 'secret',
    fullname = 'Dicoding Indonesia',
  }) {
    const userPayload = { id, username, password, fullname };
    await UsersTableTestHelper.addUser(userPayload);
    return Jwt.token.generate(userPayload, process.env.ACCESS_TOKEN_KEY);
  },
  async cleanTable() {
    await UsersTableTestHelper.cleanTable();
  },
};

module.exports = ServerTestHelper;
