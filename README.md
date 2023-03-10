# Cube.dev APM Test

Goals:

- production ready and horizontally scalable as much as possible.
- 100 queries per second

## Usage 

    docker compose up -d

    open http://localhost:4000 

## TODO

- [x] Create repo
- [x] Write docker-compose
- [x] Write Schema
- [ ] Run basic cube cluster
- [ ] Write "agent"
- [ ] Write dashboard
    - Developer Playground ?
    - q/sec
    - r/sec
    - top-10 q by exe_seconds.
- [ ] Add partitions
- [ ] [Pre Aggregations](https://cube.dev/docs/schema/reference/pre-aggregations)

To really make it production ready:

- [ ] Put it on a real cluster (say in AWS)
- [ ] Use k8s services
- [ ] Use ingress / reverse-proxy
- [ ] Use kustomize and terraform for setup.
- [ ] Add health checks.
- [ ] Add authentication (JWT), https://cube.dev/docs/security
- [ ] Disable devmode.

To scale even more:

- [ ] Replace postgreSQL with clustered DB.
- [ ] Scale redis service.
- [ ] Scale S3 service or use real S3.

## Feedback

Broken link
- https://statsbot.co/blog/node-express-analytics-dashboard-with-cubejs/
- from https://cube.dev/blog/cubejs-open-source-dashboard-framework-ultimate-guide

## Dev Docs

- https://descriptive-reply-0b7.notion.site/APM-Test-Project-3955dc71b5564923b2dc380c75b49b0b
- https://cube.dev/docs/examples
- https://cube.dev/blog/cubejs-open-source-dashboard-framework-ultimate-guide

Queries:

    {
        measures: ['Users.count'],
        dimensions: ['Users.city'],
        timeDimensions: [{
            dimension: 'Users.signedUp',
           granularity: 'month',
           dateRange: ['2020-01-31', '2020-12-31']
        }
    }

