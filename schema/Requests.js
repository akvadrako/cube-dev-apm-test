cube(`Requests`, {
    sql: `SELECT * FROM public.requests`,
    
    preAggregations: {
        requestsPerMinute: {
            type: 'rollup',
            measures: [count],
            timeDimension: created,
            granularity: `minute`,
            partitionGranularity: `day`,
        },
    },

    measures: {
        count: {
            sql: `id`,
            type: `count`,
        },
    },

    dimensions: {
        id: {
            sql: `id`,
            type: `string`,
            primaryKey: true
        },

        created: {
            sql: `created`,
            type: `time`
        }
    },

    dataSource: `default`,
    refreshKey: {
        every: `5 seconds`,
    },
});
