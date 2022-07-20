CREATE DATABASE movr_vehicles;

CREATE TABLE movr_vehicles.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_date TIMESTAMPTZ DEFAULT now(),
    serial_number STRING NOT NULL,
    make STRING NOT NULL,
    model STRING NOT NULL,
    year INT2 NOT NULL,
    color STRING NOT NULL,
    description STRING
);

CREATE USER movr WITH PASSWORD secure_password;
GRANT SELECT, INSERT, UPDATE ON TABLE movr_vehicles.vehicles TO movr;