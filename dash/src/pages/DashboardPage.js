import React from "react";
import Grid from "@material-ui/core/Grid";
import ChartRenderer from "../components/ChartRenderer";
import Dashboard from "../components/Dashboard";
import DashboardItem from "../components/DashboardItem";
const DashboardItems = [
    {
        id: 0,
        name: "Requests per minute",
        vizState: {
            query: {
                measures: ["Requests.count"],
                timeDimensions: [
                    {
                        dimension: "Requests.created",
                        granularity: "minute",
                        dateRange: "last 60 minutes"
                    }
                ],
                filters: []
            },
            chartType: "line"
        }
    },
    {
        id: 1,
        name: "Queries per minute",
        vizState: {
            query: {
                measures: ["Queries.count"],
                timeDimensions: [
                    {
                        dimension: "Queries.created",
                        granularity: "minute",
                        dateRange: "last 60 minutes",
                    }
                ]
            },
            chartType: "line",
        }
    },
    {
        id: 2,
        name: "Slowest 10 Queries",
        vizState: {
            query: {
                "measures": [
                    "Queries.duration"
                ],
                "timeDimensions": [
                    {
                        "dimension": "Queries.created"
                    }
                ],
                "order": [
                    [
                        "Queries.duration",
                        "desc"
                    ],
                    [
                        "Queries.created",
                        "asc"
                    ]
                ],
                "limit": 10,
                "dimensions": [
                    "Queries.query"
                ]
            },
            chartType: "table"
        }
    },
];


const DashboardPage = () => {
    const dashboardItem = item => (
        <Grid item xs={12} lg={6} key={item.id}>
            <DashboardItem title={item.name}>
                <ChartRenderer vizState={item.vizState} />
            </DashboardItem>
        </Grid>
    );

    return <Dashboard>{DashboardItems.map(dashboardItem)}</Dashboard>
};

export default DashboardPage;
