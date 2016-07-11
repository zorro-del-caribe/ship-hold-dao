const dao = require('./lib/dao');

function resolveInstanceFactory (name, sh) {
  return name !== undefined ? sh.model(name) : {
    new(row){
      return row
    }
  };
}

module.exports = function (sh) {
  for (const modelName of sh.models()) {
    const model = sh.model(modelName);
    model.new = dao(model);
  }

  const run = sh.adapters.run;

  Object.assign(sh.adapters, {
    instances(params = {}, sink){
      const service = resolveInstanceFactory(this.name, sh);
      const iterator = sink();
      iterator.next();

      this.stream(params, function * () {
        try {
          while (true) {
            const row = yield;
            iterator.next(service.new(row));
          }
        } catch (e) {
          iterator.throw(e);
        } finally {
          iterator.return();
        }
      });
    },
    run(params = {}){
      const service = resolveInstanceFactory(this.name, sh);
      return run.bind(this)(params)
        .then(rows=>rows.map(r=>service.new(r)));
    }
  });

  return sh;
};