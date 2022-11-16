import React, { useState, useEffect } from 'react';
import Header from "./Header";
import { Box, Typography, Link, List, ListItem, Stack, IconButton, Container } from "@mui/material";
import { Edit } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

import '@fontsource/roboto/500.css';

const serverUrl = require('../data/serverUrl.json');

const HOST = serverUrl['HOST'];
const PORT = serverUrl['PORT'];
const URL = `${HOST}${PORT}`;

function RuleList() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const getEid = (item) => {
        let eid = item.google_calendar_event_id + " " + item.google_calendar_id
        return Buffer.from(eid).toString("base64");
    }
    const from = (item) => {
        let from;
        if (item.actuator_id !== null) {
            from = `Actuator (ID=${item.actuator_id})`;
        } else if (item.src_room_id !== null) {
            from = `Room (ID=${item.src_room_id})`;
        } else if (item.user_id !== null) {
            from = `User (ID=${item.user_id})`;
        }
        return from
    }

    let list = <Typography variant='h4' color="textSecondary">Loading...</Typography>;

    useEffect(() => {
        window
            .fetch(`${URL}/rules/?active_only=true`)
            .then((response) => response.json())
            .then((res) => {
                console.log('Fetched Rule list')
                console.log(res)
                setData(res);
                setLoading(false);
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }, []);

    if (loading === false) {
        list = data.map((item) =>
            <ListItem key={item.id}>
                <Box mb={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant='h5'> Rule {item.id} </Typography>
                        <RouterLink to={`/rule/edit?calendar_id=${item.google_calendar_id}&event_id=${item.google_calendar_event_id}`}>
                            <IconButton size="small" aria-label="edit"><Edit /></IconButton>
                        </RouterLink>
                    </Stack>
                    <Typography variant='body1'>Origin: {from(item)}</Typography>
                    <Box pl={2} sx={{ wordBreak: "break-word" }}>
                        <Typography variant='body2' color="textSecondary">
                            calendar ID:&nbsp;
                            <Link href={`https://calendar.google.com/calendar/embed?mode=WEEK&src=${item.google_calendar_id}`} target="_blank">
                                {item.google_calendar_id}
                            </Link>
                        </Typography>
                        <Typography variant='body2' color="textSecondary">
                        event ID:&nbsp;
                        <Link href={`https://www.google.com/calendar/event?eid=${getEid(item)}`} target="_blank">
                            {item.google_calendar_event_id}
                        </Link>
                    </Typography>
                    </Box>
                    
                    <Typography variant='body1'> Level: {item.level} </Typography>
                    <Typography variant='body1'> Description: {item.description} </Typography>
                </Box>
            </ListItem>
        )
    }

    return (
        <Box>
            <Header name="RuleList" />
            <Container>
                <Typography variant='h6' color="textSecondary"> List of currently active rules </Typography>
                <List sx>{list}</List>
            </Container>
        </Box>
    );
}

export default RuleList;