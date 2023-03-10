cube(`Queries`, {
    sql: `SELECT * FROM public.queries`,

    preAggregations: {
        queryPerMinute: {
            type: 'rollup',
            measures: [count],
            timeDimension: created,
            granularity: `minute`,
            partitionGranularity: `day`,
        },
    },

    measures: {
        count: {
            type: `count`,
            sql: `id`,
        },

        duration: {
            sql: `duration`,
            type: `max`
        }
    },

    dimensions: {
        query: {
            sql: `query`,
            type: `string`
        },

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
