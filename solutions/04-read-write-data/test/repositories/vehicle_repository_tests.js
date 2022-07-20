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

// This is an Integration Test and it will require a running database.
describe('VehicleRepository', () => {
  let repository;

  before(async () => {
    repository = new VehicleRepository();

    TestConfig.cockroachdb.connectionString.should.not.equal(
        ProdConfig.cockroachdb.connectionString,
        'You are attempting to run your tests against your production database.',
    );

    await repository.connect(TestConfig.cockroachdb.connectionString);
  });


  describe('addVehicle', () => {
    it('should fail if the repository has not been connected.', async () => {
      const uninitializedRepo = new VehicleRepository();

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
      const uninitializedRepo = new VehicleRepository();

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

  after(async () => {
    await repository.disconnect();
  });
});
