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

    getComponent(Type) {
      return this.components.find(component => component instanceof Type);
    }

    getComponents(Type) {
      return this.components.filter(component => component instanceof Type);
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

    fixedUpdate(...args) {
      this.components.forEach(component => component.fixedUpdate(...args));
    }

    update(...args) {
      this.components.forEach(component => component.update(...args));
    }
  };
}
