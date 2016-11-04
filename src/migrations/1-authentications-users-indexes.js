async function up(done) {
  const db = this.db;

  const authentications = db.collection('authentications');
  await authentications.createIndex({ name: 1 }, { unique: true });

  const users = db.collection('users');
  await users.createIndex({ name: 1 }, { unique: true });

  done();
}

function down() {}

module.exports = { id: require('path').basename(__filename), up, down };
