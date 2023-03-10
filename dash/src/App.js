import React, {useState, useEffect, useMemo} from "react";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import cubejs from "@cubejs-client/core";
import { CubeProvider } from "@cubejs-client/react";

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2Nzg0ODE1MjIsImV4cCI6MTY4MTA3MzUyMn0.fPN-jRIJfX8tXGDrzK08N6dgOf-KY2kKMQt4KDV94Ew';

const cubejsApi = cubejs(TOKEN, {
  apiUrl: 'http://localhost:4000/cubejs-api/v1',
});

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: '#f3f3fb'
  }
}));

const AppLayout = ({ children }) => {
    const classes = useStyles();
    const [rate, setRate] = useState(1);

    return (
        <div className={classes.root}>
            <h1>Cube.dev Metrics Dashboard</h1>
            <p>Token: {TOKEN}</p>
            <p>Load: <input value={rate}
                onChange={e => setRate(e.target.value)} 
                type="number"
            /> per second, per server</p>
            <ServerLoad server="localhost:4000" rate={rate} />
            <ServerLoad server="localhost:4001" rate={rate} />
            <ServerLoad server="localhost:4002" rate={rate} />
            <ServerLoad server="localhost:4003" rate={rate} />
            <div className="App">{children}</div>
        </div>
    );
};

const ServerLoad = ({ server, rate }) => {
    const [updated, setUpdated] = useState('never');
    const [count, setCount] = useState('?');

    const serverApi = useMemo(() => cubejs(TOKEN, {
        apiUrl: `http://${server}/cubejs-api/v1`,
    }), [])

    useEffect(() => {
        let cancel = false;
        let start, delay, latency;

        async function runQuery() {
            start = Date.now();
            try {
                const result = await serverApi.load({
                    measures: ['Requests.count'],
                    timeDimensions: [
                        {
                            dimension: "Requests.created",
                            granularity: "minute",
                            dateRange: "last 5 minutes",
                        }
                    ]
                });

                latency = Date.now() - start;
                delay = (1000 / rate) - latency;

                setUpdated(new Date().toString() + ', ' + delay + 'ms delay, ' + latency + 'ms latency');
                setCount(JSON.stringify(result.loadResponse.data.map(x => x['Requests.count'])));
            } catch(e) {
                console.error(e)
            }

            if(cancel) {
                console.log('canceled');
            } else {
                setTimeout(runQuery, Math.max(0, delay));
            }
        }

        setTimeout(runQuery, 0)

        return () => { cancel = true; };
    }, [rate]);


    return <div>
        <h2>Server {server}</h2>
            <p>Last updated: {updated}</p>
            <p>Requests in last minutes: {count}</p>
        </div>
}

const App = ({ children }) => (
  <CubeProvider cubejsApi={cubejsApi}>
    <AppLayout>{children}</AppLayout>
  </CubeProvider>
);

export default App;
