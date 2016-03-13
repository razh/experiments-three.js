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
})();
