const {parse} = require('pg-connection-string');
const {Pool} = require('pg');

/**
 * A wrapper around the SQL Database.
 */
class VehicleRepository {
  #pool;

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
}

module.exports = VehicleRepository;
