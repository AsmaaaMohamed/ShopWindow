# Catalog API Load Test

This directory contains a k6 load test for the uncached catalog API.

## Endpoints Tested

The load test covers:

* Product listing:
  `GET /products?page=1&limit=20`

* Product detail:
  `GET /products/cobalt-notebook-x`

## Prerequisites

* The backend must be running locally on port `5000`.
* k6 must be installed.

Verify the k6 installation:

```bash
k6 version
```

## Running the Test

Start the backend first:

```bash
npm run start:dev
```

Then, from the `server` directory, run:

```bash
k6 run test/load/catalog.js
```

## Test Configuration

The test currently runs with:

* **Virtual Users:** 10
* **Duration:** 30 seconds
* **Listing page:** 1
* **Listing limit:** 20
* **Product slug:** `cobalt-notebook-x`

Each iteration sends:

1. A request to the product listing endpoint.
2. A request to the product detail endpoint.

## What the Test Measures

k6 reports several performance metrics, including:

* Request count
* Requests per second
* Average request duration
* Median request duration
* 90th percentile latency
* 95th percentile latency
* Failed requests
* Data received and sent

The test also checks that both endpoints return HTTP `200`.

## Baseline Result

The initial uncached test was executed with 10 VUs for 30 seconds.

Results:

| Metric                   |   Result |
| ------------------------ | -------: |
| Total requests           |   18,606 |
| Requests/second          |   619.82 |
| Average request duration | 16.05 ms |
| p90 latency              | 21.43 ms |
| p95 latency              | 24.61 ms |
| Failed requests          |       0% |
| Successful checks        |     100% |

This result serves as the baseline for the uncached catalog API. The same test configuration can be reused later to compare performance after caching is introduced.

## Latency Baseline

Latency was measured before Redis caching was introduced using k6 with:

* **Virtual Users:** 10
* **Duration:** 30 seconds
* **Listing:** `GET /products?page=1&limit=20`
* **Detail:** `GET /products/cobalt-notebook-x`

### Results

| Endpoint                          |         p50 |          p95 |
| --------------------------------- | ----------: | -----------: |
| `GET /products?page=1&limit=20`   | 18.05145 ms | 25.499425 ms |
| `GET /products/cobalt-notebook-x` |  11.0792 ms |   16.2917 ms |

### Test Reliability

* Total checks: 19,432
* Successful checks: 100%
* Failed requests: 0%

These measurements represent the baseline latency of the uncached catalog API before Redis caching is introduced.
