const previousSym = Symbol();

function getValidParams (service, instance, params = {}) {
  const parameters = Object.assign({}, instance, params);
  const columns = service.columns;
  const validKeys = Object.keys(parameters)
    .filter(key=>parameters[key] !== instance[previousSym][key] && columns.includes(key));

  const validParams = {};
  for (const prop of validKeys) {
    validParams[prop] = parameters[prop];
  }
  return validParams;
}

module.exports = function (service) {
  const proto = {
    delete(){
      const id = this[service.primaryKey];
      return service.delete()
        .where(service.primaryKey, '$id')
        .run({id});
    },
    fetch(...args){
      const id = this[service.primaryKey];
      return service
        .select(...args)
        .where(service.primaryKey, '$id')
        .run({id})
        .then((res)=> {
          const instance = res[0];
          if (!instance) {
            return Promise.reject(new Error('could not find the instance based on the primary key ' + this[service.primaryKey]));
          }
          if (instance) {
            this[previousSym] = Object.assign({}, this, instance);
          }
          return Object.assign(this, instance);
        });
    },
    save(params = {}){
      const validParams = getValidParams(service, this, params);
      const keys = Object.keys(validParams);
      const builder = service.update();

      for (const p of keys) {
        builder.set(p, '$' + p);
      }

      return keys.length ? builder
        .where(service.primaryKey, '$id')
        .run(Object.assign({}, validParams, {id: this[service.primaryKey]}))
        .then(res=> {
          const result = res[0];
          this[previousSym] = Object.assign({}, this, result);
          return Object.assign(this, result);
        }) : Promise.resolve(this);
    },
    create(params = {}){
      //reset params
      this[previousSym] = {};
      const validParams = getValidParams(service, this, params);
      const keys = Object.keys(validParams);
      const builder = service.insert();

      for (const p of keys) {
        builder.value(p, '$' + p);
      }

      return keys.length ? builder
        .run(Object.assign({}, validParams))
        .then(res=> {
          const instance = res[0];
          this[previousSym] = Object.assign({}, this, instance);
          Object.assign(this, instance);
          return this;
        }) : Promise.resolve(this);
    }
  };

  return function (attributes = {}) {
    const instance = Object.create(proto);
    Object.assign(instance, attributes);
    instance[previousSym] = Object.assign({}, instance);
    return instance;
  };
};