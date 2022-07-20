const express = require('express');
const chai = require('chai');
chai.should();
const chaiHttp = require('chai-http');
const BodyParser = require('body-parser');
const VehicleHelpers = require('../vehicle_helpers');
const VehicleController = require('../../controllers/vehicle_controller');
const VehicleRoutes = require('../../routes/vehicle_routes');

chai.use(chaiHttp);

describe('Vehicle Routes', () => {
  let app;
  let server;
  let controller;
  let routes;

  before(function(done) {
    app = express();

    app.use(BodyParser.json());

    controller = new VehicleController();

    routes = new VehicleRoutes(app, controller);
    routes.init();

    server = app.listen((err) => {
      if (err) {
        return done(err);
      }
      done();
    });
  });

  describe('[GET] /api/vehicles/:vehicle_id', () => {
    it('should call VehicleController.getVehicle and return the result.', (done) => {
      const vehicle = VehicleHelpers.createVehicle();

      controller.getVehicle = async (i) => {
        i.should.equal(vehicle.id);
        return vehicle;
      };

      chai.request(app)
          .get(`/api/vehicles/${vehicle.id}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.eql(vehicle);
            done();
          });
    });

    it('should return a 404 if the vehicle does not exist', (done) => {
      const id = VehicleHelpers.createVehicleId();

      controller.getVehicle = async (_) => null;

      chai.request(app)
          .get(`/api/vehicles/${id}`)
          .end((err, res) => {
            res.text.should.equal('Not Found');
            done();
          });
    });

    it('should return the error if the controller throws an exception', (done) => {
      const id = VehicleHelpers.createVehicleId();

      controller.getVehicle = async (_) => {
        throw new Error('BOOM');
      };

      chai.request(app)
          .get(`/api/vehicles/${id}`)
          .end((err, res) => {
            res.should.have.status(500);
            done();
          });
    });
  });

  describe('[POST] /api/vehicles/', () => {
    it('should call VehicleController.addVehicle and return the result.', (done) => {
      const vehicle = VehicleHelpers.createVehicle();

      controller.addVehicle = async (v) => {
        v.should.eql(vehicle);
        return vehicle;
      };

      chai.request(app)
          .post(`/api/vehicles`)
          .send(vehicle)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.eql(vehicle);
            done();
          });
    });

    it('should return 409 if addVehicle refuses the request (due to a duplicate for example).', (done) => {
      const vehicle = VehicleHelpers.createVehicle();

      controller.addVehicle = async (vehicle) => null;

      chai.request(app)
          .post(`/api/vehicles`)
          .send(vehicle)
          .end((err, res) => {
            res.should.have.status(409);
            res.text.should.equal('Conflict');
            done();
          });
    });

    it('should return the error if the controller throws an exception', (done) => {
      const vehicle = VehicleHelpers.createVehicle();

      controller.addVehicle = async (vehicle) => {
        throw new Error('BOOM');
      };

      chai.request(app)
          .post(`/api/vehicles`)
          .send(vehicle)
          .end((err, res) => {
            res.should.have.status(500);
            done();
          });
    });
  });

  describe('[PUT] /api/vehicles/:vehicle_id', () => {
    it('should call VehicleController.updateVehicle and return the result.', (done) => {
      const vehicle = VehicleHelpers.createVehicle();

      controller.updateVehicle = async (i, v) => {
        i.should.equal(vehicle.id);
        v.should.eql(vehicle);
        return vehicle;
      };

      chai.request(app)
          .put(`/api/vehicles/${vehicle.id}`)
          .send(vehicle)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.eql(vehicle);
            done();
          });
    });

    it('should return a 404 if the vehicle does not exist.', (done) => {
      const vehicle = VehicleHelpers.createVehicle();

      controller.updateVehicle = async (i, v) => null;

      chai.request(app)
          .put(`/api/vehicles/${vehicle.id}`)
          .send(vehicle)
          .end((err, res) => {
            res.should.have.status(404);
            res.text.should.equal('Not Found');
            done();
          });
    });

    it('should return the error if the controller throws an exception', (done) => {
      const vehicle = VehicleHelpers.createVehicle();

      controller.updateVehicle = async (i, v) => {
        throw new Error('BOOM');
      };

      chai.request(app)
          .put(`/api/vehicles/${vehicle.id}`)
          .send(vehicle)
          .end((err, res) => {
            res.should.have.status(500);
            done();
          });
    });
  });

  after(function(done) {
    server.close(() => {
      done();
    });
  });
});
