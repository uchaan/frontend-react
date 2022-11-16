import React, { useState, useEffect, useRef } from 'react';
import { Typography, Box, Button, List, ListItem, Fab} from '@mui/material'
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';
import RefreshIcon from '@mui/icons-material/Refresh';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import '@fontsource/roboto/500.css';
import SpeechBalloon from "./SpeechBalloon";


const mqtt = require('mqtt')  // require mqtt


const serverUrl = require('../data/serverUrl.json');

const HOST = serverUrl['HOST']
const PORT = serverUrl['PORT']
const MQTT_BROKER_URL = serverUrl.MQTT

const URL = `${HOST}${PORT}`;

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
    });

function ActuatorControl(props) {

    const { params } = props.match;
    const actuator_id = params.id;

    const [error, setError] = useState(null);
    const [subtitle, setSubtitle] = useState('');
    const [status, setStatus] = useState('loading...');
    const [color, setColor] = useState('white');
    const [reasons, setReason] = useState([]);
    const [actuator, setActuator] = useState(null);
    const [refreshIn, setRefreshIn] = useState(0);
    const [openErrorNotification, setOpenErrorNotification] = useState(false);
    const [notiErrorMessage, setNotiErrorMessage] = useState("");
    const [openSuccessNotification, setOpenSuccessNotification] = useState(false);
    const [isVisible, setIsVisible] = useState(false)
    const [screenBlankTimer, setScreenBlankTimer] = useState(null);
    const screenBlankTimerRef = useRef(screenBlankTimer);
    screenBlankTimerRef.current= screenBlankTimer

    const operateButton = () => {
        // sudo operation
    };

    const reportDeviceUse = ()=>{
        let startTime = new Date()
        console.log("ACTIVATE")
        setOpenSuccessNotification(true)
        window
            .fetch(`${URL}/actuators/${actuator_id}/activate?target_state=ON&force=true`)
            .then(async(response) => {
                if (response.ok) {
                    return await response.json()
                } else {
                    throw new Error(response.status + " Failed Fetch")
                }
            })
            .then((res)=>{
                let timeElapsed = Math.round((new Date() - startTime) / 10) / 100
                console.log(`ACTIVATE Done (${timeElapsed} seconds)`)
            })
            .catch((error) => {
                console.log(error)
                setOpenSuccessNotification(false)
                setOpenErrorNotification(true)
                setNotiErrorMessage("네트워크 상 문제가 발생했어요.")
            })
    }

    const handleCloseErrorNotification = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpenErrorNotification(false);
    }

    const handleCloseNotification = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpenSuccessNotification(false);
    }

    const updateScreen = (res) => {
        console.log(res)
        if (res['errors'].length !== 0) {
            const isRemediable = res["errors"].every((v)=>v.remediable)
            let msg = isRemediable ? "문을 닫아주세요!" : "작동 불가!"
            setStatus(msg);
            setSubtitle(isRemediable ? "작동 불가!" : "")

            setColor("#f44336");
            setReason(res['errors']);
        }
        else if (res['warnings'].length !== 0) {
            const isRemediable = res["warnings"].every((v)=>v.remediable)

            let msg = isRemediable ? "문을 닫아주세요!" : "작동시 주의요함!"
            setStatus(msg);
            setSubtitle(isRemediable ? "작동시 주의요함!" : "")

            setColor(isRemediable ? "#f44336" : "#ffd966");
            setReason(res['warnings']);
        }
        else {
            setStatus("작동 가능");
            setSubtitle( "")
            //setColor("success.light");
            setColor("#77dd77");
            setReason([{ 'reason': '작동 소음으로 인해 피해받는 사람이 없어요' }])
        }
    }

    const resetScreenBlankingTimer = () => {
        // 20초 화면 켜기 w/ Debouncing
        console.log("screenBlankTimer", screenBlankTimerRef)
        if (screenBlankTimerRef.current !== null) {
            clearTimeout(screenBlankTimerRef.current)
            console.log("clearTimeout", screenBlankTimerRef.current, new Date())
        }
        let newTimer = setTimeout(async () => {
            setIsVisible(false)
            console.log("blanking", new Date())
        }, 20 * 1000)
        setScreenBlankTimer(newTimer)
        console.log("setScreenBlankTimer", newTimer, screenBlankTimerRef.current, new Date())
    }

    // get compliance of actuator
    useEffect(() => {
        let startTime = new Date()
        console.log("CHECK_ACTUATOR")
        window
            // .fetch(`${URL}/actuators/${actuator_id}/`) // 나중에 이것으로 교체할 것
            .fetch(`${URL}/actuators/`)
            .then(async(response) => {
                if (response.ok) {
                    return await response.json()
                } else {
                    throw new Error(response.status + " Failed Fetch")
                }
            })
            .then((res)=>{
                let actuator = res.find((elem, idx, arr)=> {
                    return (elem.id === parseInt(actuator_id));
                })
                setActuator(actuator)
                console.log(actuator)

                let timeElapsed = Math.round((new Date() - startTime) / 10) / 100
                console.log(`CHECK_ACTUATOR Done (${timeElapsed} seconds)`)
            })
            .catch((error) => {
                console.log(error)
                setOpenErrorNotification(true)
                setNotiErrorMessage("네트워크 상 문제가 발생했어요.")
            })
    }, [actuator_id]);

    useEffect(()=>{
        if (!isVisible) return

        const timerId = setTimeout(() => {
            var currRefreshIn = refreshIn
            currRefreshIn -= 1

            var next
            if (currRefreshIn <= 0) {
                next = 5
                let startTime = new Date()
                console.log("REFRESH")
                window
                    .fetch(`${URL}/actuators/${actuator_id}/compliance?target_state=ON`)
                    .then(async(response) => {
                        if (response.ok) {
                            return await response.json()
                        } else {
                            throw new Error(response.status + " Failed Fetch")
                        }
                    })
                    .then((res) => {
                        updateScreen(res)
                        let timeElapsed = Math.round((new Date() - startTime) / 10) / 100
                        console.log(`REFRESH Done (${timeElapsed} seconds)`)
                    })
                    .catch((error) => {
                        //setError(error);
                        console.log(error)
                        setOpenErrorNotification(true)
                        setNotiErrorMessage("네트워크 상 문제가 발생했어요.")
                    });
            } else {
                next = Math.floor(currRefreshIn)
            }
            setRefreshIn(next)
            //var counter = (refreshIn == 0) ? 4 : ((refreshIn - 1) % 5)

        }, 1000)

        return () => clearTimeout(timerId)
    }, [refreshIn, isVisible])

    useEffect(()=> {
        if (actuator === null) {
            return;
        }

        let client = mqtt.connect(MQTT_BROKER_URL)
        client.on("connect", ()=>{
            let topic = `sociobuilding/actuator/${actuator.name}/control`
            client.subscribe(topic, (err)=>{
                if (err != null) {
                    console.error(err)
                }
                console.log("MQTT Connected!!!")
            })
        })

        client.on("message", async (topic, message) => {
            //console.log(topic, ))
            //
            let msg = JSON.parse(message.toString())
            console.log(topic, msg)

            let actuatorId = msg.actuator_id
            let actuatorName = msg.actuator_name
            let report = msg.inspection_report
            let allowed = (report.errors.length === 0) && (report.warnings.length === 0)

            if (!allowed) {
                setRefreshIn(5)
                updateScreen(report)
                setIsVisible(true)
                resetScreenBlankingTimer()
            }

        })
        return () => client.end()
    }, [actuator])
    /*

              <Box sx={{ pr: "1rem", pt:"1rem", pl:"1rem", position:"fixed" }} justifyContent="space-between" >

                    <Fab variant="extended" onClick={()=>{setRefreshIn(0)}}>
                        <RefreshIcon sx={{mr:1}}/>
                        {`Refresh in ${refreshIn}s`}
                    </Fab>
                </Box>


    */
    let display =  (
        <div style={{ height: "100vh", width: '100%', backgroundColor:color }}>
             <Box sx={{ width: '100%',  paddingTop:"0.5rem", paddingBottom:"0.5rem", bgcolor:"#666666"}}>
                <Typography align='center'>
                    <b style={{fontSize:"2rem", color:"#efefef", minFontSize:"1rem"}}>{(actuator != null) ? actuator.name: ""}</b>
                </Typography>
            </Box>
            <Box sx={{ width: '100%', pl:0, pr:0, pb:0, pt: "1rem", bgcolor:"inherit"}}>


                <Box id="status">
                    <Typography variant='h5' align='center' sx={{marginTop:"0rem"}}><b style={{fontSize:"2rem", color:"#00000066", wordBreak:"keep-all"}}>{subtitle}</b> </Typography>
                    <Typography variant='h3' align='center' sx={{marginTop:"0rem"}}><b style={{fontSize:"3rem", wordBreak:"keep-all"}}>{status}</b> </Typography>
                </Box>

                <Box id="reasons" justifyContent="center" display='flex' sx={{marginTop:"1rem"}}>
                    <List>
                    {reasons.map(({ reason }, idx) => {
                        return (<SpeechBalloon idx={idx} reason={reason}/> );
                    })}
                    </List>
                </Box>
                <Fab variant="extended" justifyContent="center" onClick={()=>{ reportDeviceUse() }} sx={{transform:"scale(2.25, 2.25)", bottom:"4rem",  position:"fixed", right:"8rem"}}>
                    <PlayCircleIcon sx={{mr:1}}/>
                    {`그래도 쓸래요!`}
                </Fab>
            </Box>
            <Snackbar open={openSuccessNotification} autoHideDuration={4000}
                onClose={handleCloseNotification} anchorOrigin={{"vertical":"top", "horizontal":"center"}}>
                <Alert onClose={handleCloseNotification} severity="success" sx={{ width: '100%', fontWeight:700 }}>
                    작동 요청 중.. (5초 정도 걸려요)
                </Alert>
            </Snackbar>

            <Snackbar open={openErrorNotification} autoHideDuration={4000}
                onClose={handleCloseErrorNotification} anchorOrigin={{"vertical":"top", "horizontal":"center"}}>
                <Alert onClose={handleCloseErrorNotification} severity="error" sx={{ width: '100%', fontWeight:500 }}>
                    {notiErrorMessage}
                </Alert>
            </Snackbar>
        </div>
    );
    let black = (<div style={{ height: "100vh", width: '100vw', backgroundColor:"#000000" }}/>)
    return isVisible ? display : black
    // server off 용 
    // return (
    //     <div style={{ height: "100vh" }}>
    //         <Box sx={{ width: '100%', height: '100%', bgcolor: 'warning.light', }}>
    //             <Box sx={{ p: 1 }} display='flex' flexDirection='row-reverse'>
    //                 <Button
    //                     color='error'
    //                     variant='contained'
    //                     startIcon={<PlayCircleFilledWhiteIcon />}
    //                     onClick={operateButton}
    //                 >
    //                     SUDO
    //                 </Button>
    //             </Box>
    //             <Box id="status">
    //                 <Typography variant='h3' align='center'> <br /><br /> <b>주의!</b>  </Typography>
    //             </Box>
    //             <Box id="reasons" justifyContent="center" display='flex'>
    //                 <ul>
    //                     <li><Typography variant='h5'> 옆방에서 대화중이에요! </Typography></li>
    //                 </ul>
    //             </Box>
    //         </Box>
    //     </div>
    // );
}

export default ActuatorControl;