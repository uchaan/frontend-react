import React, { useState, useEffect } from 'react';
import Header from "./Header";
import { Link } from 'react-router-dom';

import '@fontsource/roboto/500.css';
import { Box, Container } from '@mui/material';

const serverUrl = require('../data/serverUrl.json');

const HOST = serverUrl['HOST']
const PORT = serverUrl['PORT']
const URL = `${HOST}${PORT}`;

function ActuatorList() {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    let list;

    useEffect(() => {
        window
            .fetch(`${URL}/actuators`)
            .then((response) => response.json())
            .then((res) => {
                console.log('Fetching Actuator List....')
                setData(res);
                setLoading(false);
            })
            .catch((err) => {
                setError(err);
                setLoading(false);
            });
    }, []);

    if (loading === false) {
        list = data.map((item) =>
            <li>
                <Link to={{
                    pathname: `/actuator-control/${item.id}`,
                }}>{item.name}</Link>
            </li>
        )
    }

    return (
        <Box>
            <Header name="ActuatorList" />
            <Container sx={{fontSize: 25}}>
                <p>{list}</p>
            </Container>
        </Box>
    );
}

export default ActuatorList;