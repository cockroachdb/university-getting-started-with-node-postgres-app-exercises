/* eslint-disable require-jsdoc */

const chai = require('chai');
chai.should();
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const VehicleHelpers = require('../vehicle_helpers');
const TestConfig = require('../../test_config');
const ProdConfig = require('../../prod_config');


const VehicleRepository = require('../../repositories/vehicle_repository');

// Version of the repo that allows us to clear it after our tests are finished.
// Because this is destructive, we need to ensure that this is not run against the wrong database.
class TestRepo extends VehicleRepository {
  async count() {
    return await this._getClient().query('SELECT * FROM vehicles;').then((result) => result.rowCount);
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


  describe('addVehicle', () => {
    it('should fail if the repository has not been connected.', async () => {
      const uninitializedRepo = new TestRepo();

      const vehicle = VehicleHelpers.createVehicle();

      await expect(uninitializedRepo.addVehicle(vehicle)).to.be.rejectedWith(
          Error,
          'The Repository is not connected to a database. Did you forget to call connect?',
      );
    });

    it('should return the saved result including the Id.', async () => {
      const vehicle = VehicleHelpers.createAddVehicle();
      const result = await repository.addVehicle(vehicle);

      expect(result.id).to.not.be.null;

      const expected = {
        id: result.id,
        ...vehicle,
      };

      result.should.eql(expected);
    });

    it('should ignore the id if its included in the request.', async () => {
      const vehicle = VehicleHelpers.createVehicle();

      const result = await repository.addVehicle(vehicle);

      const expected = {
        ...vehicle,
        id: result.id,
      };

      result.id.should.not.equal(vehicle.id);
      result.should.eql(expected);
    });

    it('should ignore extra fields.', async () => {
      const vehicle = VehicleHelpers.createAddVehicle();
      vehicle.extra = 'An Extra Field';

      const result = await repository.addVehicle(vehicle);

      const expected = {
        id: result.id,
        ...vehicle,
      };
      delete expected.extra;
      expect(result).to.eql(expected);
    });
  });

  describe('getVehicle', () => {
    it('should fail if the repository has not been connected.', async () => {
      const uninitializedRepo = new TestRepo();

      const vehicleId = VehicleHelpers.createVehicleId();

      await expect(uninitializedRepo.getVehicle(vehicleId)).to.be.rejectedWith(
          Error,
          'The Repository is not connected to a database. Did you forget to call connect?',
      );
    });

    it('should return null when the record does not exist.', async () => {
      const vehicleId = VehicleHelpers.createVehicleId();

      const result = await repository.getVehicle(vehicleId);

      expect(result).to.be.null;
    });

    it('should return a previously added vehicle.', async () => {
      const vehicle = await repository.addVehicle(VehicleHelpers.createAddVehicle());
      const result = await repository.getVehicle(vehicle.id);

      result.should.eql(vehicle);
    });
  });

  describe('updateVehicle', () => {
    it('should fail if the repository has not been connected.', async () => {
      const uninitializedRepo = new TestRepo();

      const vehicleId = VehicleHelpers.createVehicleId();
      const update = VehicleHelpers.createUpdateVehicle();

      await expect(uninitializedRepo.updateVehicle(vehicleId, update)).to.be.rejectedWith(
          Error,
          'The Repository is not connected to a database. Did you forget to call connect?',
      );
    });

    it('should return null when the vehicle does not exist.', async () => {
      const vehicleId = VehicleHelpers.createVehicleId();
      const update = VehicleHelpers.createUpdateVehicle();

      const result = await repository.updateVehicle(vehicleId, update);

      expect(result).to.be.null;
    });

    it('should return the updated vehicle.', async () => {
      const originalVehicle = await repository.addVehicle(VehicleHelpers.createAddVehicle());
      const update = {make: 'Definitely a different make.'};
      const result = await repository.updateVehicle(originalVehicle.id, update);
      const expectedVehicle = {
        ...originalVehicle,
        ...update,
      };

      result.should.eql(expectedVehicle);
    });

    it('should update the vehicle in the database.', async () => {
      const originalVehicle = await repository.addVehicle(VehicleHelpers.createAddVehicle());
      const update = {make: 'Definitely a different make.'};
      await repository.updateVehicle(originalVehicle.id, update);
      const updatedVehicle = await repository.getVehicle(originalVehicle.id);
      const expectedVehicle = {
        ...originalVehicle,
        ...update,
      };

      updatedVehicle.should.eql(expectedVehicle);
    });

    it('should ignore the id if it is included in the request.', async () => {
      const originalVehicle = await repository.addVehicle(VehicleHelpers.createAddVehicle());
      const update = {
        id: VehicleHelpers.createVehicleId(),
        make: 'Definitely a different make.',
      };

      const expectedVehicle = {
        ...originalVehicle,
        make: update.make,
      };

      const result = await repository.updateVehicle(originalVehicle.id, update);

      result.should.eql(expectedVehicle);
    });

    it('should ignore extra fields.', async () => {
      const originalVehicle = await repository.addVehicle(VehicleHelpers.createAddVehicle());
      const update = {extra: 'An Extra Field'};
      const result = await repository.updateVehicle(originalVehicle.id, update);

      result.should.eql(originalVehicle);
    });
  });

  after(async () => {
    await repository.disconnect();
  });
});
