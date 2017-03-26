/* eslint no-unused-vars: ["error", { "vars": "local" }] */

/*

const DARK_AGE = 'DARK_AGE';
const FEUDAL_AGE = 'FEUDAL_AGE';
const CASTLE_AGE = 'CASTLE_AGE';
const IMPERIAL_AGE = 'IMPERIAL_AGE';

const nodes = [
  { id: DARK_AGE },
  { id: FEUDAL_AGE },
  { id: CASTLE_AGE },
  { id: IMPERIAL_AGE }
];

const links = [
  { source: DARK_AGE, target: FEUDAL_AGE },
  { source: FEUDAL_AGE, target: CASTLE_AGE },
  { source: CASTLE_AGE, target: IMPERIAL_AGE },
];

*/

'use strict';

function getNodesById(nodes) {
  return nodes.reduce((nodesById, node) => {
    nodesById[node.id] = node;
    return nodesById;
  }, {});
}

function getParents(graph, id) {
  return graph.links
    .filter(link => link.target === id)
    .map(link => graph.nodesById[link.source]);
}

function getChildren(graph, id) {
  return graph.links
    .filter(link => link.source === id)
    .map(link => graph.nodesById[link.target]);
}

function hasParents(state, id) {
  const parents = getParents(state.graph, id);
  return parents.every(parent => state.nodes.includes(parent));
}

function upgrade(state, id) {
  const node = state.graph.nodesById[id];

  // Not enough money.
  if (state.balance < node.cost) {
    return false;
  }

  // Parent requirements not met.
  if (!hasParents(state, id)) {
    return false;
  }

  return Object.assign({}, state, {
    nodes: (state.nodes || []).concat(node),
    balance: state.balance - node.cost,
  });
}
