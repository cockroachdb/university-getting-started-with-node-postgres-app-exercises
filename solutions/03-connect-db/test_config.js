const config = {
  cockroachdb: {
    connectionString: 'postgresql://root@localhost:26257/movr_vehicles?sslmode=disable',
  },
  express: {
    port: 3000,
  },
};

module.exports = config;
