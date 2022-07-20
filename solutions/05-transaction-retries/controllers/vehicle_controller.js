const validator = require('validator');

/**
 * Interfaces with the vehicle repository to perform the necessary operations that will be exposed by the REST API.
 */
class VehicleController {
  #repository;

  /**
   * Validates the vehicle Id and throws an exception if it is not a UUID.
   * @param {*} id The vehicleId to validate.
   */
  #validateVehicleId(id) {
    if (!validator.isUUID(id)) {
      throw new Error('Invalid Vehicle Id');
    }
  }

  /**
   * Construct a Vehicle Controller and inject the Repository.
   * @param {*} repository
   */
  constructor(repository) {
    this.#repository = repository;
  }

  /**
   * Retrieve a vehicle from the repository.
   * @param {*} id The Id of the vehicle to retrieve.
   * @return {*} The vehicle or null if it doesn't exist.
   */
  async getVehicle(id) {
    console.log(`Vehicle(${id})`);

    this.#validateVehicleId(id);

    return this.#repository.getVehicle(id);
  }

  /**
   * Add a vehicle to the repository.
   * @param {*} request The details about the vehicle to add.
   * @return {*} The resulting vehicle, after it has been added.
   */
  async addVehicle(request) {
    console.log(`addVehicle(${JSON.stringify(request)})`);

    if (!request.serialNumber || !request.make || !request.model || !request.year) {
      throw new Error('Invalid Request. A required field is missing.');
    }

    return this.#repository.addVehicle(request);
  }

  /**
   * Update a vehicle in the repository.
   * @param {*} id The id of the vehicle to update.
   * @param {*} update The individual fields of the vehicle to be updated.
   * @return {*} The updated vehicle.
   */
  async updateVehicle(id, update) {
    console.log(`updateVehicle(${id},${JSON.stringify(update)})`);

    this.#validateVehicleId(id);

    if (!update.purchaseDate &&
       !update.serialNumber &&
       !update.make &&
       !update.model &&
       !update.year &&
       !update.color &&
       !update.description) {
      throw new Error('Invalid Request. The update does not contain any valid fields.');
    }

    return this.#repository.updateVehicle(id, update);
  }
}

module.exports = VehicleController;
