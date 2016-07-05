const test = require('tape');
const shiphold = require('ship-hold');
const extension = require('../index');

const sh = shiphold({});
const Users = sh.model('Users', function (sh) {
  return {
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
  instance.fetch('name')
    .then(r=> {
      t.equal(r.name, 'Laurent');
      t.equal(r.age, undefined);
      t.equal(instance.name, 'Laurent');
      t.equal(instance.age, undefined);
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
      t.end();
    });
});

test('update instance', t=> {
  const instance = Users.new({id: 1}).fetch();
  instance.age = 31;
  instance.save({email: 'foo@bar.com'})
    .then(r=> {
      t.equal(r.age, 31);
      t.equal(r.name, 'Laurent');
      t.equal(r.email, 'foo@bar.com');
      t.equal(instance.age, 31);
      t.equal(instance.name, 'laurent');
      t.equal(instance.email, 'foo@bar.com');
      t.end();
    });
});

test('add instances adapter', t=> {
  Users
    .select()
    .where('id', 1)
    .instances({}, function * () {
      try {
        while (true) {
          const row = yield;
          t.equal(row.id, 1);
          t.ok(row.fetch !== undefined);
          t.ok(row.save !== undefined);
          t.ok(row.delete !== undefined);
          t.ok(row.create !== undefined);
          t.end();
        }
      } catch (e) {
        t.fail(e)
      } finally {
        t.end();
      }
    });
});

test('decorate run', t=> {
  Users
    .select()
    .where('id', 1)
    .run()
    .then(function (result) {
      const row = result[0];
      t.equal(row.id, 1);
      t.ok(row.fetch !== undefined);
      t.ok(row.save !== undefined);
      t.ok(row.delete !== undefined);
      t.ok(row.create !== undefined);
      t.end();
    });
});

test('delete instance', t=> {
  const instance = Users.new({id: 1});
  instance
    .delete()
    .then(()=> {
      t.end();
    })
});