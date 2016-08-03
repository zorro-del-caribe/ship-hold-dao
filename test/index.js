const test = require('tape');
const shiphold = require('ship-hold');
const extension = require('../src/index');

const sh = shiphold({
  hostname: process.env.DB_HOSTNAME || '192.168.99.100',
  username: process.env.DB_USERNAME || 'docker',
  password: process.env.DB_PASSWORD || 'docker',
  database: process.env.DB_NAME || 'ship-hold-dao-test'
});
const Users = sh.model('Users', function (sh) {
  return {
    table: 'users',
    columns: {
      id: 'integers',
      name: 'string',
      email: 'string',
      age: 'integer'
    }
  }
});

extension(sh);

test('fetch only selected parameters', t=> {
  const instance = Users.new({id: 1});
  instance
    .fetch('name')
    .then(r=> {
      t.equal(r.name, 'Laurent');
      t.equal(r.age, undefined);
      t.equal(instance.name, 'Laurent');
      t.equal(instance.age, undefined);
      sh.stop();
      t.end();
    });
});

test('reject the promise if could not find the instance', t=> {
  const instance = Users.new({id: 666});
  instance.fetch('name')
    .then(r=> {
      t.fail('should not resolve the promise')
    })
    .catch(e=> {
      t.equal(e.message, 'could not find the instance based on the primary key 666');
      sh.stop();
      t.end();
    });
});

test('create a new instance and save it', t=> {
  const instance = Users.new({age: 55, email: 'foo@bar.com', name: 'Raymond'});
  instance.create()
    .then(r=> {
      t.equal(r.age, 55);
      t.equal(r.name, 'Raymond');
      t.equal(r.email, 'foo@bar.com');
      t.equal(instance.age, 55);
      t.equal(instance.name, 'Raymond');
      t.equal(instance.email, 'foo@bar.com');
      t.ok(instance.id !== undefined);
      sh.stop();
      t.end();
    })
    .catch(err=>console.log(err))
});

test('update instance', t=> {
  Users.new({id: 1})
    .fetch()
    .then(instance=> {
      instance.age = 31;
      instance.save({email: 'foo@bar.com'})
        .then(r=> {
          t.equal(r.age, 31);
          t.equal(r.name, 'Laurent');
          t.equal(r.email, 'foo@bar.com');
          t.equal(instance.age, 31);
          t.equal(instance.name, 'Laurent');
          t.equal(instance.email, 'foo@bar.com');
          sh.stop();
          t.end();
        });
    });
});

test('add streamInstances adapter', t=> {
  Users
    .select()
    .where('id', 1)
    .streamInstances({}, function * () {
      try {
        while (true) {
          const row = yield;
          t.equal(row.id, 1);
          t.ok(row.fetch !== undefined);
          t.ok(row.save !== undefined);
          t.ok(row.delete !== undefined);
          t.ok(row.create !== undefined);
        }
      } catch (e) {
        t.fail(e)
      } finally {
        sh.stop();
        t.end();
      }
    });
});

test('add instances adapter', t=> {
  Users
    .select()
    .where('id', 1)
    .instances()
    .then(function (result) {
      const row = result[0];
      t.equal(row.id, 1);
      t.ok(row.fetch !== undefined);
      t.ok(row.save !== undefined);
      t.ok(row.delete !== undefined);
      t.ok(row.create !== undefined);
      sh.stop();
      t.end();
    });
});

test('delete instance', t=> {
  const instance = Users.new({id: 1});
  instance
    .delete()
    .then(()=> {
      sh.stop();
      t.end();
    })
    .catch(e=>console.log(e))
});