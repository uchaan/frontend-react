import React, { useState,useEffect } from 'react';
import '@fontsource/roboto/500.css';
import { Grid, Typography, Box, Checkbox, FormControlLabel, Paper, Container } from '@mui/material';
import Header from './Header';
import { useLocation } from 'react-router';
import { styled } from '@mui/material/styles';
import WarningConfiguration from './WarningConfiguration';
import ProhibitionConfiguration from './ProhibitionConfiguration';
import WarningIcon from '@mui/icons-material/Warning';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

import RuleEditForm from "./RuleEditForm";
import { SignalWifiStatusbarNullSharp } from '@mui/icons-material';
import getUserLocale from 'get-user-locale';

const serverUrl = require('../data/serverUrl.json');
const HOST = serverUrl['HOST']
const PORT = serverUrl['PORT']
const URL = `${HOST}${PORT}`;


const Item = styled(Paper)(({ theme }) => (
    {
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'left',
        elevation: 0,
        color: theme.palette.text.secondary,
        height: '100%',
    }));

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
    });



function RuleEdit() {

    // POST 를 위해 필요한 값
    const locale = getUserLocale();
    console.log(locale) // "ko-KR" "en-US"
    const location = useLocation();   
    const inKorean = (locale === "ko-KR" || locale === "ko");
    const params = new URLSearchParams(location.search);

    const calendarId = params.get('calendar_id');
    const eventId = params.get('event_id');
    const [level, setLevel] = useState("warning");


    const [rule, setRule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSuccessNotification, setOpenSuccessNotification] = useState(false);
    const [openErrorNotification, setOpenErrorNotification] = useState(false);
    const [notiErrorMessage, setNotiErrorMessage] = useState("");
    const [calendarEvent, setCalendarEvent] = useState(null);
    const [calendar, setCalendar] = useState(null);
    const [ownerKind, setOwnerKind] = useState(null);
    const [floor, setFloor] = useState(SignalWifiStatusbarNullSharp);

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpenSuccessNotification(false);
    }

    const handleCloseErrorNotification = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpenErrorNotification(false);
    }

    useEffect(() => {
        if (!!calendarId && !!eventId) {
            window
                .fetch(`${URL}/rules/query?calendar_id=${calendarId}&calendar_event_id=${eventId}`)
                .then((response) => {
                    const status = response.status
                    if (status == 200) {
                        return response.json()
                    } else {
                        console.log("Rule does not exist")
                        throw "404"
                    }
                    
                })
                .then((res) => {
                    console.log('Fetched rule info', res);
                    setRule(res);
                    setLevel(res.level)
                    setLoading(false);
                })
                .catch((error) => {
                    console.log(error)
                    setLoading(false);
                });

            window
                .fetch(`${URL}/rules/calendar_event?calendar_id=${calendarId}&event_id=${eventId}`)
                .then((response) => response.json())
                .then((res) => {
                    console.log('Fetched calender info', res)
                    setCalendarEvent(res.event)
                    setCalendar(res.calendar)
                    setOwnerKind(res.owner_kind)
                    setFloor(res.floor)
                })
                .catch((error) => {
                    console.log(error)
                });

        } else {
            setLoading(false);
        }
    }, [calendarId, eventId]);

    
    const checkbox = (selectorLevel) => {
        const text = {
            warning: {
                title: inKorean ? "주의!" : "Soft request",
                desc: inKorean ? "(해당 시간) 지정된 상황일 경우 기기 사용 시도시 주의를 줍니다." : "I would be "
            },
            prohibition: {
                title: "금지!",
                desc: "(해당 시간) 기기 사용을 완전히 금지합니다. "
            }
        }[selectorLevel]
        const icon = (selectorLevel === "warning") ? 
            <WarningIcon sx={{marginLeft:1, color:"#ffb805"}}/> : 
            <DoNotDisturbIcon sx={{marginLeft: 1, color:"red"}}/>
        const isWarning = (level === "warning")
        return (
            <FormControlLabel
                sx={{ color: "inherit", maxWidth:"100vw" }}
                label={
                    <Box sx={{ m: 1}}>
                        <Typography variant='h6' sx={{ color: "black" }}>
                            <b>{text.title}</b>
                            {icon}
                        </Typography>
                        <Typography variant='body2' sx={{color:"text.secondary", fontSize:"0.9rem", wordBreak:"keep-all"}}>
                            {text.desc}
                        </Typography>
                        
                    </Box>
                }
                control={
                    <Checkbox
                        style={{
                            transform: "scale(1.5)",
                            paddingTop: 0
                        }}
                        checked={selectorLevel === level }
                        color={isWarning ? 'warning' : 'error'}
                        name={text.title}
                        onChange={() => setLevel(selectorLevel)}
                    />
                }
            />
        );
    }


    const form = () => {
        if (loading) {
            return <Typography variant='h4' color="textSecondary">Loading...</Typography>;
        }
        return (
            <Container>
                <Box>
                    <Typography variant="h5" sx={{color:"#666666"}}>{(calendarEvent != null) ? calendarEvent.summary : "Fetching calendar info..."}</Typography>
                    <Typography variant="caption" sx={{color:"#888888"}}>{(calendar != null) ? calendar.summary : ""}</Typography>
                </Box>
                {
                    (ownerKind === "room" || ownerKind === "actuator") ? (
                        <Grid className='container_1' container item display='flex' spacing={0}>
                            <Grid className='item_1_checkbox' container item xs={12} sm={12} md={12} flexDirection='column'>
                                <Grid item flexGrow='1' flexWrap='wrap'>
                                    { checkbox("warning")} 
                                </Grid>
                                
                                <Grid item flexGrow='1'>
                                    {checkbox("prohibition")} 
                                </Grid>
                            </Grid>
                        </Grid>
                    ) : null
                }
                {
                    (calendar !== null && calendarEvent !== null) ? 
                    (<Grid className='container_3' container item spacing={0} sx={{marginTop:"1rem"}}>
                        <Grid className='item_3_configure' item flexGrow='1'>
                        <RuleEditForm
                            calendarEvent={calendarEvent }
                            calendar={calendar}
                            rule={rule}
                            ruleLevel={level}
                            ownerKind={ownerKind}
                            floor={floor}
                            onSuccess={() => setOpenSuccessNotification(true)}
                            onError={(msg) => {
                                setNotiErrorMessage(msg)
                                setOpenErrorNotification(true);
                            }}
                            />
                        </Grid>
                    </Grid>) : null
                }
            </Container>
        );
    }
    const title = {
        null: "",
        actuator: "규칙 생성/수정",
        room: "규칙 생성/수정",
        user: "양해요청 생성/수정"
    }[ownerKind]
    
    return (
        <Box sx={{flexGrow: 1, }}>
            <Header helper name={title} />
            {form()}
            <Snackbar open={openSuccessNotification} autoHideDuration={5000} onClose={handleCloseNotification} anchorOrigin={{"vertical":"top", "horizontal":"center"}}>
                <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%', fontWeight:500 }}>
                    저장되었습니다!
                </Alert>
            </Snackbar>
            <Snackbar open={openErrorNotification} autoHideDuration={5000} onClose={handleCloseErrorNotification} anchorOrigin={{"vertical":"top", "horizontal":"center"}}>
                <Alert onClose={handleCloseErrorNotification} severity="error" sx={{ width: '100%', fontWeight:500 }}>
                    {notiErrorMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default RuleEdit;