#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

EXERCISES_FOLDER="exercises"
SOLUTIONS_FOLDER="solutions"
SOLUTIONS=($(ls $SOLUTIONS_FOLDER | grep '^[0-9]'))
COMMAND=${1:-"help"}

function help {
    echo "This script is intended to contain the commands that can be executed to"
    echo "build various components for the course."
    echo "Custom logic for the individual course may be embedded in this script."
    echo "Re-usable logic should be put into scripts in the build-scripts folder."
    echo ""
    echo "USAGE: build.sh command <args>"
    echo ""
    echo "Commands:"
    echo "  verify - Run all tests for all exercises."
    echo "  start_cockroachdb - Start a single instance of CockroachDB for running tests."
    echo "  stop_cockroachdb - Stop the running instance of CockroachDB for running tests."
    echo "  initdb [connectionString] - Initializes the database. An optional connectionString can be provided. Otherwise it will assume a local, insecure CockroachDB."
    echo "  help - print this text."
}

# Loop through each exercise and execute the tests.
function verify_all_exercises {    
    local WORKING=$(pwd)

    echo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    echo VERIFYING STUDENT FOLDER $EXERCISES_FOLDER
    echo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    cd $EXERCISES_FOLDER
    run_all_tests
    cd $WORKING

    for solution in "${SOLUTIONS[@]}"
    do
        echo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        echo VERIFYING SOLUTION $solution
        echo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        cd $SOLUTIONS_FOLDER/$solution
        run_all_tests
        cd $WORKING
    
    done
}

# Execute the tests for a specific exercise.
function run_all_tests {
    echo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    echo RUNNING TESTS
    echo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    pwd
    npm install
    npm test
}

function init_db {
    connectionString=$1

    echo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    echo INITIALIZING THE DATABASE at $connectionString
    echo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    cockroach sql --url "$connectionString" --execute="
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
    "
}

function start_cockroachdb {
    echo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    echo STARTING COCKROACHDB
    echo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    cockroach start-single-node --insecure --background
}

function stop_cockroachdb {
    PID=$(pgrep -f 'cockroach start-single-node --insecure' || echo 0)
    
    echo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    echo TERMINATING COCKROACHDB - PID: $PID
    echo ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    if [ "$PID" != 0 ]; then
        kill $PID
    fi
}

# Determine which command is being requested, and execute it.
if [ "$COMMAND" = "verify" ]; then
    verify_all_exercises
elif [ "$COMMAND" = "init_db" ]; then
   init_db ${2:-"postgresql://root@localhost:26257/movr_vehicles?sslmode=disable"}
elif [ "$COMMAND" = "start_cockroachdb" ]; then
    start_cockroachdb
elif [ "$COMMAND" = "stop_cockroachdb" ]; then
    stop_cockroachdb
elif [ "$COMMAND" = "help" ]; then
    help
else
    echo "INVALID COMMAND: $COMMAND"
    help
    exit 1
fi
