cube(`ActiveUsers`, {
  sql: `SELECT user_id, created_at FROM public.orders`,

  measures: {
    // requests per minute
    reqPerMinute: {
      sql: `requests`,
      type: `sum`,
      rollingWindow: {
        trailing: `30 day`,
        offset: `start`,
      },
    },

    // DB queries per minute
    queryPerMinute: {
      sql: `queries`,
      type: `sum`,
      rollingWindow: {
        trailing: `7 day`,
        offset: `start`,
      },
    },

    // top 10 SQL queries by execution time
    topTenQueries: {
      sql: `user_id`,
      type: `...`,
      rollingWindow: {
        trailing: `1 day`,
        offset: `start`,
      },
    },
  },

  dimensions: {
    createdAt: {
      sql: `created_at`,
      type: `time`,
    },
  },
});
