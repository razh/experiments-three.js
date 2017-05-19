/* exported withEntity */

function withEntity(Class) {
  return class WithEntity extends Class {
    constructor(...args) {
      super(...args);

      this.components = [];
    }

    addComponent(component) {
      this.components.push(component);
    }

    getComponents(type) {
      return this.components.filter(component => component.type === type);
    }

    removeComponent(component) {
      const index = this.components.indexOf(component);

      if (index >= 0) {
        this.components.splice(index, 1);
      }
    }

    update(dt) {
      this.components.forEach(component => component.update(dt));
    }
  };
}
