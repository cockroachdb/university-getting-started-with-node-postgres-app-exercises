const {parse} = require('pg-connection-string');
const {Pool} = require('pg');
const transaction = require('./transaction');

/**
 * A wrapper around the SQL Database.
 */
class VehicleRepository {
  #pool;

  /**
   * Private method to convert a query result into a vehicle.
   * @param {*} queryResult The query result
   * @return {*} The vehicle
   */
  #toVehicle(queryResult) {
    return {
      id: queryResult.id,
      purchaseDate: queryResult.purchase_date.toISOString(),
      serialNumber: queryResult.serial_number,
      make: queryResult.make,
      model: queryResult.model,
      year: queryResult.year,
      color: queryResult.color,
      description: queryResult.description,
    };
  }

  /**
   * This is a Protected function. It is exposed for usage in tests only.
   * @return {*} The node-postgres pool used by the repository.
   */
  _getPool() {
    return this.#pool;
  }

  /**
   * Connect to the database
   * @param {*} connectionString The URI used to connect to the database.
   */
  connect(connectionString) {
    const config = parse(connectionString);
    this.#pool = new Pool(config);
  }

  /**
   * Disconnect from the database.
   */
  async disconnect() {
    await this.#pool.end();
  }

  /**
   * Retrieve a vehicle by its Id.
   * @param {*} id The Id of the vehicle to retrieve.
   * @return {*} The vehicle if it's found, or null otherwise.
   */
  async getVehicle(id) {
    if (!this.#pool) {
      throw new Error('The Repository is not connected to a database. Did you forget to call connect?');
    }

    const selectStatement = 'SELECT * FROM vehicles WHERE id = $1;';

    const result = await this.#pool.query(selectStatement, [id]);

    if (result.rowCount == 1) {
      return this.#toVehicle(result.rows[0]);
    } else {
      return null;
    }
  }

  /**
   * Add a vehicle to the repository.
   * @param {*} vehicle The vehicle to add to the repository.
   * @return {*} The vehicle, including its new Id, after it has been added to the repository.
   */
  async addVehicle(vehicle) {
    if (!this.#pool) {
      throw new Error('The Repository is not connected to a database. Did you forget to call connect?');
    }

    const insertStatement = `
    INSERT INTO vehicles (purchase_date, serial_number, make, model, year, color, description) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING *;`;

    const result = await this.#pool.query(insertStatement, [
      vehicle.purchaseDate,
      vehicle.serialNumber,
      vehicle.make,
      vehicle.model,
      vehicle.year,
      vehicle.color,
      vehicle.description,
    ]);

    if (result.rowCount == 1) {
      return this.#toVehicle(result.rows[0]);
    } else {
      return null;
    }
  }

  /**
   * Update a specific vehicle in the repository.
   * @param {*} id The id of the vehicle to update.
   * @param {*} update An object containing the fields in the vehicle you wish to update.
   * @return {*} The updated vehicle.
   */
  async updateVehicle(id, update) {
    if (!this.#pool) {
      throw new Error('The Repository is not connected to a database. Did you forget to call connect?');
    }

    const selectStatement = 'SELECT * FROM vehicles WHERE id = $1;';
    const updateStatement = `
    UPDATE vehicles 
    SET 
        purchase_date = $2, 
        serial_number = $3,
        make = $4, 
        model = $5, 
        year = $6,
        color = $7,
        description = $8
    WHERE id = $1 
    RETURNING *;`;

    return transaction(this.#pool, async (client) => {
      const selectResult = await client.query(selectStatement, [id]);

      if (selectResult.rowCount == 1) {
        const existing = this.#toVehicle(selectResult.rows[0]);

        const updated = {
          ...existing,
          ...update,
        };

        const result = await client.query(updateStatement, [
          id,
          updated.purchaseDate,
          updated.serialNumber,
          updated.make,
          updated.model,
          updated.year,
          updated.color,
          updated.description,
        ]);

        if (result.rowCount == 1) {
          return this.#toVehicle(result.rows[0]);
        } else {
          return null;
        }
      } else {
        return null;
      };
    });
  }
}

module.exports = VehicleRepository;
