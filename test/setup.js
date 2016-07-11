const shiphold = require('ship-hold');
const sh = shiphold({
  hostname: process.env.DB_HOSTNAME || '192.168.99.100',
  username: process.env.DB_USERNAME || 'docker',
  password: process.env.DB_PASSWORD || 'docker',
  database: process.env.DB_NAME || 'ship-hold-dao-test'
});


sh.getConnection()
  .then(function ({client, done}) {
    return new Promise(function (resolve, reject) {

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
            sh.stop();
            resolve();
          });
        });
      });
    });
  })
  .catch(function (err) {
    console.log(err);
  });