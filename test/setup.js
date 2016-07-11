const pg = require('pg');
const url = require('url');


const connection = {
  protocol: 'postgres',
  slashes: true,
  hostname: process.env.DB_HOSTNAME || 'localhost',
  port: process.env.DB_PORT || 5432,
  pathname: '/' + process.env.DB_NAME || 'ship-hold-dao-test'
};

if (process.env.DB_USERNAME) {
  const {username, password} = {username: process.env.DB_USERNAME, password: process.env.DB_PASSWORD};
  connection.auth = [username, password].join(':')
}

const connectionString = url.format(connection);

let remaining = 2;
function jobDone () {
  remaining--;
  if (remaining === 0) {
    pg.end();
  }
}

pg.connect(connectionString, function (err, client, done) {
  if (err) {
    throw err;
  }

  const dropq = `DROP TABLE IF EXISTS users`;

  client.query(dropq, function (err, result) {
    if (err) {
      throw err;
    }

    const createq = `CREATE TABLE users
    (
    id serial PRIMARY KEY,
    age integer,
    name varchar(100),
    email varchar(100)
    );`;

    client.query(createq, function (err, result) {
      if (err) {
        throw err;
      }

      client.query(`INSERT INTO users (age,name,email) VALUES(29, 'Laurent', 'laurent34azerty@gmail.com');`, function (err, result) {
        if (err) {
          throw err;
        }
        done();
        pg.end();
      });
    });
  });
});