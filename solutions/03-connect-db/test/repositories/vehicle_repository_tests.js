/* eslint-disable require-jsdoc */

const chai = require('chai');
chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const TestConfig = require('../../test_config');
const ProdConfig = require('../../prod_config');

const VehicleRepository = require('../../repositories/vehicle_repository');

class TestRepo extends VehicleRepository {
  async count() {
    return await this._getPool().query('SELECT * FROM vehicles;').then((result) => result.rowCount);
  }
}

// This is an Integration Test and it will require a running database.
describe('VehicleRepository', () => {
  let repository;

  before(async () => {
    repository = new TestRepo();

    TestConfig.cockroachdb.connectionString.should.not.equal(
        ProdConfig.cockroachdb.connectionString,
        'You are attempting to run your tests against your production database.',
    );

    await repository.connect(TestConfig.cockroachdb.connectionString);
  });

  it('should be able to query the database.', async () => {
    const result = await repository.count();
    result.should.be.at.least(0);
  });

  after(async () => {
    await repository.disconnect();
  });
});
