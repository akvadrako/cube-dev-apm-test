# Cube.dev APM Test

The easiest way to test this is by asking me to start the Codespaces environment and heading
to one of these URLs:

- [dashboard](https://akvadrako-redesigned-yodel-jrx457649fj74v-3000.preview.app.github.dev/)
- [collector](https://akvadrako-redesigned-yodel-jrx457649fj74v-5000.preview.app.github.dev/)

## Intro

This is my submission for the [APM test project][apm]. The goals were:

- get a cube.dev cluster running
- write a metrics collector to record events from the API agent.
- a dashboard for queries/minute and requests/minute.
- production ready and horizontally scalable as much as possible.
- 100 queries per second

My implementation:
- I wrote a simple collector in Javascript using the Websocket API I found in the cubejs source.
- The "REST API Request" events are written to the `request` table in pgSQL
- The "query completed" events are written to the `queries` table in pgSQL
- The dashboard is based off the D3 example, simplified a bit and with a built-in load generator.

For scalability:
- It's possible to add more collectors, API servers, store workers, refresh workers and dashboard instances.
- By default there are 4 API servers, since they seemed to be the bottleneck.
- The cubestore uses MinIO to allow workers to be distributed over several systems.

[apm]: https://descriptive-reply-0b7.notion.site/APM-Test-Project-3955dc71b5564923b2dc380c75b49b0b

## Usage 

1. `docker compose up -d`
2. Wait for the containers to build and the dashboard to start (it's the slowest part)
2. Open dashboard at http://localhost:3000
3. For load testing, you can set the `Load` parameter on the dashboard.
4. The collector is running at `ws://localhost:5000` if you want to point more sources at it.

## Possible Future Improvements

To really make it production ready:

- [ ] Put it on a real cluster (say in AWS)
- [ ] Use k8s services
- [ ] Use ingress / reverse-proxy
- [ ] Use kustomize and terraform for setup.
- [ ] Add health checks.
- [ ] Use a login and real secrets.

To scale even more:

- [ ] Replace postgreSQL with clustered DB.
- [ ] Scale S3 service or use real S3.

## TODO: Done

- [x] Create repo
- [x] Write docker-compose
- [x] Write Schema
- [x] Run basic cube cluster
- [x] Write collector
- [x] Write dashboard
    - queries/sec
    - requests/sec
    - top-10 queries by duration 
- [x] [Pre Aggregations](https://cube.dev/docs/schema/reference/pre-aggregations)
    - [x] Add partitions
- [x] Disable devmode.

## Feedback

There is a broken link here:

- https://statsbot.co/blog/node-express-analytics-dashboard-with-cubejs/
- from https://cube.dev/blog/cubejs-open-source-dashboard-framework-ultimate-guide

