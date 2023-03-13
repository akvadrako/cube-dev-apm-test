import React, {useState, useEffect, useMemo} from "react";
import "./App.css";
import { makeStyles } from "@material-ui/core/styles";
import cubejs from "@cubejs-client/core";
import { CubeProvider } from "@cubejs-client/react";

console.log("ENV", process.env);

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2Nzg0ODE1MjIsImV4cCI6MTY4MTA3MzUyMn0.fPN-jRIJfX8tXGDrzK08N6dgOf-KY2kKMQt4KDV94Ew';

function cubeURL(port) {
    let cs = process.env.REACT_APP_CODESPACE_NAME;
    if(cs)
        return `https://${cs}-${port}.preview.app.github.dev/cubejs-api/v1`
    else
        return `http://localhost:${port}/cubejs-api/v1`
}

const cubejsApi = cubejs(TOKEN, { apiUrl: cubeURL(4000) });

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
            <fieldset>
                <legend>basics</legend>
                <ul>
                    <li>Token: {TOKEN.substr(0, 20) + '...'}</li>
                    <li>Cube URL: {cubeURL(4000)}</li>
                </ul>
            </fieldset>
            <fieldset>
                <legend>Load Generator</legend>
                <p>Load: <input value={rate}
                    onChange={e => setRate(e.target.value)} 
                    type="number"
                /> per second, per server</p>
                <ul>
                    <ServerLoad port={4000} rate={rate} />
                    <ServerLoad port={4001} rate={rate} />
                    <ServerLoad port={4002} rate={rate} />
                    <ServerLoad port={4003} rate={rate} />
                </ul>
            </fieldset>
            <div className="App">{children}</div>
        </div>
    );
};

const ServerLoad = ({ port, rate }) => {
    const [updated, setUpdated] = useState('never');
    const [count, setCount] = useState('?');
    const server = cubeURL(port);
    const serverApi = useMemo(() => cubejs(TOKEN, { apiUrl: server }), [port]);
    
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
                let when = (new Date()).toISOString().substring(11, 19) + ' UTC';

                setUpdated(when + ', ' + delay + 'ms delay, ' + latency + 'ms latency');

                setCount(JSON.stringify(result.rawData().map(x => x['Requests.count'])));
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


    return <li title={server}>Port {port}:<br/> updated {updated}<br/>last minutes: {count}</li>
}

const App = ({ children }) => (
  <CubeProvider cubejsApi={cubejsApi}>
    <AppLayout>{children}</AppLayout>
  </CubeProvider>
);

export default App;
