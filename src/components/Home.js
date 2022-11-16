import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import { Box, Container } from '@mui/material'

import '@fontsource/roboto/500.css';

function Home() {

    return (
        <Box>
            <Header name="Home" />
            <Container sx={{fontSize: 25}}>
                <ul>
                    <li>
                        <Link to="/actuator-list">Actuator List</Link>
                    </li>
                    <li>
                        <Link to="/rule-list"> Rule List </Link>
                    </li>
                    <li>
                        <Link to="/rule/edit">Rule Configuration</Link>
                    </li>
                    <li>
                        <Link to="/user/signup">User Sign Up</Link>
                    </li>
                </ul>
            </Container>
        </Box>
    );

}

export default Home;