# Cube.dev APM Test

Goals:

- production ready and horizontally scalable as much as possible.
- 100 queries per second

Questions:
- what counts as a request? Here I am counting only "REST API Request".

## Usage 

    docker compose up -d
    
    # open Dashboard
    open http://localhost:3000 

## TODO

- [x] Create repo
- [x] Write docker-compose
- [x] Write Schema
- [x] Run basic cube cluster
- [x] Write collector
- [ ] Write dashboard
    - queries/sec
    - requests/sec
    - top-10 queries by duration 
- [x] [Pre Aggregations](https://cube.dev/docs/schema/reference/pre-aggregations)
    - [x] Add partitions
- [ ] Disable devmode.

To really make it production ready:

- [ ] Put it on a real cluster (say in AWS)
- [ ] Use k8s services
- [ ] Use ingress / reverse-proxy
- [ ] Use kustomize and terraform for setup.
- [ ] Add health checks.
- [ ] Add authentication (JWT), https://cube.dev/docs/security

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

