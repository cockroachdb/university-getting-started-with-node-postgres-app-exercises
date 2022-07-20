/* eslint-disable */

const crypto = require('crypto');

function rnd(max = 1000) {
  return Math.floor(Math.random() * max);
}

function createVehicleId() {
  return crypto.randomUUID();
}

function createSerialNumber() {
  return `SerialNumber${rnd()}`;
}

function createMake() {
  return `Make${rnd()}`;
}

function createModel() {
  return `Make${rnd()}`;
}

function createYear() {
  return 1970+rnd(50);
}

function createPurchaseDate() {
  return new Date().toISOString();
}

function createColor() {
  return `Color${rnd()}`;
}

function createDescription() {
  return `Description${rnd()}`;
}

function createVehicle() {
  return {
    id: createVehicleId(),
    purchaseDate: createPurchaseDate(),
    serialNumber: createSerialNumber(),
    make: createMake(),
    model: createModel(),
    year: createYear(),
    color: createColor(),
    description: createDescription(),
  };
}

function createAddVehicle() {
  return {
    purchaseDate: createPurchaseDate(),
    serialNumber: createSerialNumber(),
    make: createMake(),
    model: createModel(),
    year: createYear(),
    color: createColor(),
    description: createDescription(),
  };
}

function createUpdateVehicle() {
  return {
    color: createColor(),
    description: createDescription(),
  };
}

module.exports = {
  createVehicleId,
  createVehicle,
  createAddVehicle,
  createUpdateVehicle,
};
