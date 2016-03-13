/* exported Antikythera */
var Antikythera = (function() {
  'use strict';

  // https://en.wikipedia.org/wiki/Antikythera_mechanism#/media/File:Gearing_Relationships_of_the_Antikythera_Mechanism.svg
  // By Scott Shambaugh - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=30481166
  var teeth = {
    // Input.
    a1: 48,

    // Main gear.
    b1: 223,

    b2: 64,
    b3: 32,

    c1: 38,
    c2: 48,

    d1: 24,
    d2: 127,

    e1: 32,
    e2: 32,
    e3: 223,
    e4: 188,
    e5: 50,
    e6: 50,

    f1: 53,
    f2: 30,

    g1: 54,
    // Saros cycle.
    g2: 20,

    h1: 60,
    h2: 15,
    // Exeligmos cycle.
    i1: 60,

    l1: 38,
    l2: 53,

    m1: 96,
    m2: 15,
    m3: 27,

    n1: 53,
    n2: 57,
    // Metonic cycle.
    n3: 15,

    // Olympiad cycle.
    o1: 60,

    p1: 60,
    p2: 12,
    // Callipic cycle.
    q1: 60,

    sun1: 40,
    sun2: 40,
    // Sun pointer.
    sun3: 40,

    lun1: 27,
    lun2: 27,
    lun3: 20,
    // Lunar pointer.
    lun4: 20,

    // Mercury.
    mer1: 104,
    mer2: 33,

    // Venus.
    ven1: 64,

    // Mars.
    mar1: 37,
    mar2: 79,
    mar3: 69,
    // Mars pointer.
    mar4: 69,

    // Jupiter.
    jup1: 76,
    jup2: 83,
    jup3: 86,
    // Jupiter pointer.
    jup4: 86,

    // Saturn
    sat1: 57,
    sat2: 59,
    sat3: 60,
    // Saturn pointer.
    sat4: 60
  };

  /*
    http://www.nature.com/nature/journal/v444/n7119/extref/nature05357-s1.pdf

    [
      Average outer radius to gear tips (mm),
      Inner radius from best-fit circle (+/- 0.5mm),
      Outer radius from best-fit circle (+/- 0.5mm)
    ]
   */
  var radius = {
    a1: [ 13.6 ],
    b1: [ 64.9, 63.8, 65.0 ],
    b2: [ 15.5, 14.9, 15.7 ],
    b4: [  8.6,  8.2,  9.3 ],
    c1: [ 10.3,  9.4, 10.3 ],
    c2: [ 11.3, 10.5, 11.0 ],
    d1: [  5.6,  5.1,  5.8 ],
    d2: [ 31.6, 30.6, 31.7 ],
    e1: [  9.4,  8.6,  9.7 ],
    e2: [  7.8,  7.1,  7.8 ],
    e3: [ 52.6, 51.5, 52.4 ],
    e4: [ 50.2, 49.1, 49.9 ],
    e5: [ 13.4, 12.2, 13.1 ],
    e6: [ 13.9, 12.9, 13.9 ],
    f1: [ 14.0, 13.6, 14.6 ],
    f2: [  8.3,  7.4,  8.2 ],
    g1: [ 14.2, 13.4, 14.4 ],
    g2: [  4.9,  4.1,  4.9 ],
    h1: [ 14.0, 13.0, 13.7 ],
    h2: [  3.9,  3.0,  3.8 ],
    i1: [ 13.4, 12.6, 13.2 ],
    k1: [ 13.5, 12.6, 13.3 ],
    k2: [ 14.0, 13.1, 14.0 ],
    l1: [  9.1,  8.3,  9.0 ],
    l2: [ 13.1, 12.5, 13.3 ],
    m1: [ 24.5, 23.6, 24.7 ],
    m2: [  4.4,  3.7,  4.0 ],
    o1: [ 13.3, 12.2, 12.8 ],
    q1: [  5.3 ],
    r1: [ 16.4, 15.9, 16.9 ]
  };
})();
