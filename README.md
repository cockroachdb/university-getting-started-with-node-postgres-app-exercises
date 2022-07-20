# university-getting-started-with-node-postgres-app-exercises

Exercise code for the Cockroach University - Getting Started with node-postgres course

# Using the code

This code is intended to be used with the (Cockroach University)[university.cockroachlabs.com] course "Getting Started with node-postgres." For detailed instructions on how to use this code, please register and follow the course.

# Contributing

The code is made available through Github so that students can offer suggestions on improvements as they go through the code. If you see room for improvement, please consider submitting a pull request.

# Running Tests

You can run all of the tests for all of the exercises by executing.

**Note:** This requires a local cockroachdb installation and is only intended for course development/continuous integration. Students can ignore these instructions.

```
./build.sh start_cockroachdb
./build.sh verify
./build.sh stop_cockroachdb
```