const Express = require('express');
const BodyParser = require('body-parser');
const VehicleRoutes = require('./routes/vehicle_routes');
const VehicleController = require('./controllers/vehicle_controller');
const VehicleRepository = require('./repositories/vehicle_repository');
const Config = require('./prod_config');

/**
 * This is the entrypoint for the application.
 * It initializes all the components and wires them together.
 * It then starts listening on the configured port.
 */
(async () => {
  const app = new Express();
  app.use(BodyParser.json());

  const repository = new VehicleRepository();
  repository.connect(Config.cockroachdb.connectionString);

  const controller = new VehicleController(repository);
  const routes = new VehicleRoutes(app, controller);

  routes.init();

  const server = app.listen(Config.express.port, () => {
    console.log(`Vehicles Service listening at http://localhost:${Config.express.port}`);
  });

  /**
   * Perform necessary termination steps.
   */
  async function shutdown() {
    console.log('Terminating');
    server.close();
    await repository.disconnect();
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})().catch((err) => console.log(err.stack));
