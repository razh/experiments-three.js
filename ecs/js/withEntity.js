/* exported withEntity */

function withEntity(Class) {
  return class WithEntity extends Class {
    constructor(...args) {
      super(...args);

      this.components = [];
    }

    addComponent(...components) {
      components.forEach(component => {
        if (this.hasComponent(component)) {
          return;
        }

        component.parent = this;
        this.components.push(component);
      });

      return this;
    }

    hasComponent(component) {
      return this.components.includes(component);
    }

    getComponent(type) {
      return this.components.find(component => component.type === type);
    }

    getComponents(type) {
      return this.components.filter(component => component.type === type);
    }

    removeComponent(...components) {
      components.forEach(component => {
        const index = this.components.indexOf(component);

        if (index >= 0) {
          this.components
            .splice(index, 1)
            .forEach(component => (component.parent = undefined));
        }
      });

      return this;
    }

    update(...args) {
      this.components.forEach(component => component.update(...args));
    }
  };
}
