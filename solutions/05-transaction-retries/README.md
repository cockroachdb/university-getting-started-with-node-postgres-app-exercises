## Running

You will need a running Cockroach Database (eg. `cockroach start-single-node --insecure`)

Once your database is running, you will need to add the correct connection string to the prod_config.js file.

Finally, execute the application with:

```
node app.js
```

## Interacting with the Application

### Add a Vehicle

```
curl -X POST -H "Content-Type: application/json" -d '{"purchaseDate": "2022-02-02T19:04:23+0000", "serialNumber":"SSSXL12345", "make":"Segal Scooters", "model":"SpitfireXL", "year": 2020, "color": "Red", "description":"Scratch on left side."}' http://localhost:3000/api/vehicles
```

### Retrieve a Vehicle

```
curl http://localhost:3000/api/vehicles/6a69cef4-d8f5-4cbb-9e55-21796772a7f7
```

### Update a Vehicle

When updating a vehicle, the JSON you pass for the update can use any combination of valid fields for the scooter. Some examples include:

```
curl -X PUT -H "Content-Type: application/json" -d '{"description":"New Paint"}' http://localhost:3000/api/vehicles/6a69cef4-d8f5-4cbb-9e55-21796772a7f7
```

```
curl -X PUT -H "Content-Type: application/json" -d '{"color":"Green"}' http://localhost:3000/api/vehicles/6a69cef4-d8f5-4cbb-9e55-21796772a7f7
```

```
curl -X PUT -H "Content-Type: application/json" -d '{"purchaseDate": "2022-02-02T19:04:23+0000", "serialNumber":"SSSXL12345", "make":"Segal Scooters", "model":"SpitfireXL", "year": 2020, "color": "Blue", "description":"White lightning bolt on left side."}' http://localhost:3000/api/vehicles/6a69cef4-d8f5-4cbb-9e55-21796772a7f7
```