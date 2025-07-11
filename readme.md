# Database Comparison Benchmark

This project is designed to compare the performance characteristics of MongoDB and PostgreSQL databases in a Node.js environment. It provides a containerized testing environment to run standardized benchmarks against both databases using identical data models and query patterns.

## Overview

The system runs benchmark tests that measure and compare:
- Insert/write performance
- Read performance
- Query performance (simple and complex)
- Relationship handling
- Memory usage
- Update and delete operations

Both databases are populated with identical synthetic data generated using Faker.js, and benchmarks are executed through HTTP endpoints.

## Project Structure
- `/mongo` - MongoDB implementation with Express server
- `/postgres` - PostgreSQL implementation with Express server
- `/shared` - Common utilities for benchmarking and data generation

## Setup and Operation

- **Basic Commands**
docker compose up --build

docker compose down
docker compose build
docker compose up

- **End Points**
http://localhost:3000/benchmark
http://localhost:3001/benchmark

## Available Benchmark Endpoints

### Main Benchmark
`GET /benchmark?count=1000&postsPerUser=3`

Runs a comprehensive benchmark suite with the following operations:
- Data insertion
- Related data insertion
- Data retrieval
- Various query types (filtering, sorting, aggregation)
- Update operations
- Delete operations

Query parameters:
- `count`: Number of users to generate (default: 1000)
- `postsPerUser`: Number of posts to generate per user (default: 3)

### Stress Test
`GET /benchmark/stress?iterations=10&batch=100`

Runs repeated insert/read operations to test consistency under load.

Query parameters:
- `iterations`: Number of test iterations (default: 10)
- `batch`: Number of records per batch (default: 100)

## Ports
- MongoDB application: http://localhost:3001
- PostgreSQL application: http://localhost:3002
- MongoDB database: localhost:27017
- PostgreSQL database: localhost:5432