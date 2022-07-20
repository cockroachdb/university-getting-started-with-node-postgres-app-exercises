/**
 * Contains the logic for routing the HTTP Calls to the Controller.
 */
class VehicleRoutes {
  #app = null;
  #controller = null;

  /**
   * Constructs an instance of the Routes (but does not initialize them).
   * @param {*} app The Express App that will be used to register the routes.
   * @param {*} controller The controller to route the requests to.
   */
  constructor(app, controller) {
    this.#app = app;
    this.#controller = controller;
  }

  /**
   * Initializes the Routing.
   * This will register each Route with the Express App.
   */
  init() {
    this.#app.get('/api/vehicles/:vehicle_id', async (req, res, next) => {
      console.log(`[GET] /api/vehicles/${req.params.vehicle_id}`);

      this.#controller.getVehicle(req.params.vehicle_id)
          .then((vehicle) => {
            if (vehicle) {
              res.send(vehicle);
            } else {
              res.sendStatus(404);
            }
          })
          .catch((ex) => {
            next(ex);
          });
    });

    this.#app.post('/api/vehicles/', async (req, res, next) => {
      console.log(`[POST] /api/vehicles/\n${JSON.stringify(req.body)}`);

      this.#controller.addVehicle(req.body)
          .then((vehicle) => {
            if (vehicle) {
              res.send(vehicle);
            } else {
              res.sendStatus(409);
            }
          })
          .catch((ex) => {
            next(ex);
          });
    });

    this.#app.put('/api/vehicles/:vehicle_id', async (req, res, next) => {
      console.log(`[PUT] /api/vehicles/${req.params.vehicle_id}\n${JSON.stringify(req.body)}`);

      this.#controller.updateVehicle(req.params.vehicle_id, req.body)
          .then((vehicle) => {
            if (vehicle) {
              res.send(vehicle);
            } else {
              res.sendStatus(404);
            }
          })
          .catch((ex) => {
            next(ex);
          });
    });
  }
}

module.exports = VehicleRoutes;
