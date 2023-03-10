cube(`Queries`, {
    sql: `SELECT query, exe_sec FROM queries`,

    measures: {
        count: {
            sql: `query`,
            type: `count`,
        },

        exeTime: {
            sql: `exe_sec`,
            type: `number`,
        },
    },
    
    dimensions: {
        query: {
            sql: `query`,
            type: `string`,
        },
        when: {
            sql: `when`,
            type: `time`,
        },
    },
   
    /*preAggregations: {
        queryPerMinute: {
            type: 'rollup',
            measures: [count],
            timeDimension: when,
            granularity: `minute`,
            partitionGranularity: `day`,
        },
    },*/

    refreshKey: {
        every: `1 second`,
    },
});

cube(`Requests`, {
    sql: `SELECT count FROM requests`,

    measures: {
        reqPerMinute: {
            sql: `count`,
            type: `sum`,
        },
    },

    dimensions: {
        when: {
            sql: `when`,
            type: `time`,
        },
    },

    refreshKey: {
        every: `1 second`,
    },
});
