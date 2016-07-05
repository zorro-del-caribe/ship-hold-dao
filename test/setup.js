const pg = require('pg');
const connection = 'postgres://docker:docker@192.168.99.100:5432/ship-hold-dao-test';

let remaining = 2;
function jobDone () {
  remaining--;
  if (remaining === 0) {
    pg.end();
  }
}

pg.connect(connection, function (err, client, done) {
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
    id integer PRIMARY KEY,
    age integer,
    name varchar(100),
    email varchar(100)
    );`;

    client.query(createq, function (err, result) {
      if (err) {
        throw err;
      }

      client.query(`INSERT INTO users VALUES(1, 29, 'Laurent', 'laurent34azerty@gmail.com');`, function (err, result) {
        if (err) {
          throw err;
        }
        done();
        pg.end();
      });

    });
  });
});