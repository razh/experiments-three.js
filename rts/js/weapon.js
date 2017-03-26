/* exported Weapon */

class Weapon {
  constructor() {
    this.parent = null;
    this.rate = 1;
    this.previousTime = 0;
  }

  canFire(time) {
    const period = 1 / this.rate;
    if (time - this.previousTime < period)  {
      return false;
    }

    this.previousTime = time;
    return true;
  }

  fire() {}
}
