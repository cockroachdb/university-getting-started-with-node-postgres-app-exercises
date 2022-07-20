const chai = require('chai');
chai.should();
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const VehicleHelpers = require('../vehicle_helpers');
const VehicleController = require('../../controllers/vehicle_controller');

describe('Vehicle Controller', () => {
  let controller;
  let repository;

  beforeEach(function(done) {
    repository = {};
    controller = new VehicleController(repository);
    done();
  });

  describe('getVehicle', () => {
    it('should fail if the vehicleId is not a UUID.', async () => {
      const vehicleId = 'Not A UUID';

      await expect(controller.getVehicle(vehicleId)).to.be.rejectedWith(
          Error,
          'Invalid Vehicle Id',
      );
    });

    it('should retrieve the vehicle from the repository.', async () => {
      const vehicle = VehicleHelpers.createVehicle();

      repository.getVehicle = async (id) => {
        id.should.equal(vehicle.id);
        return vehicle;
      };

      const result = await controller.getVehicle(vehicle.id);

      result.should.eql(vehicle);
    });
  });

  describe('addVehicle', () => {
    it('should fail if the request does not include a serial number', async () => {
      const vehicleRequest = VehicleHelpers.createAddVehicle();
      delete vehicleRequest.serialNumber;

      await expect(controller.addVehicle(vehicleRequest)).to.be.rejectedWith(
          Error,
          'Invalid Request. A required field is missing.',
      );
    });

    it('should fail if the request does not include a make', async () => {
      const vehicleRequest = VehicleHelpers.createAddVehicle();
      delete vehicleRequest.make;

      await expect(controller.addVehicle(vehicleRequest)).to.be.rejectedWith(
          Error,
          'Invalid Request. A required field is missing.',
      );
    });

    it('should fail if the request does not include a model', async () => {
      const vehicleRequest = VehicleHelpers.createAddVehicle();
      delete vehicleRequest.model;

      await expect(controller.addVehicle(vehicleRequest)).to.be.rejectedWith(
          Error,
          'Invalid Request. A required field is missing.',
      );
    });

    it('should fail if the request does not include a year', async () => {
      const vehicleRequest = VehicleHelpers.createAddVehicle();
      delete vehicleRequest.year;

      await expect(controller.addVehicle(vehicleRequest)).to.be.rejectedWith(
          Error,
          'Invalid Request. A required field is missing.',
      );
    });

    it('should add the vehicle to the repository and return the result.', async () => {
      const vehicleRequest = VehicleHelpers.createAddVehicle();
      const vehicle = {
        id: VehicleHelpers.createVehicleId(),
        ...vehicleRequest,
      };

      repository.addVehicle = async (req) => {
        req.should.eql(vehicleRequest);
        return vehicle;
      };

      const result = await controller.addVehicle(vehicleRequest);

      result.should.eql(vehicle);
    });
  });

  describe('updateVehicle', () => {
    it('should fail if the vehicleId is not a UUID.', async () => {
      const vehicleId = 'Not A UUID';
      const update = VehicleHelpers.createUpdateVehicle();

      await expect(controller.updateVehicle(vehicleId, update)).to.be.rejectedWith(
          Error,
          'Invalid Vehicle Id',
      );
    });

    it('should fail if the request does not contain any valid fields.', async () => {
      const vehicleId = VehicleHelpers.createVehicleId();
      const update = {};

      await expect(controller.updateVehicle(vehicleId, update)).to.be.rejectedWith(
          Error,
          'Invalid Request. The update does not contain any valid fields.',
      );
    });

    it('should return NOT YET IMPLEMENTED.', async () => {
      const originalVehicle = VehicleHelpers.createVehicle();
      const update = VehicleHelpers.createUpdateVehicle();

      const result = await controller.updateVehicle(originalVehicle.id, update);

      result.should.eql('NOT YET IMPLEMENTED');
    });
  });
});
