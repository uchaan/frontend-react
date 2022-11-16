import React, { useState } from 'react';
import {RadioGroup, Radio, TextField, Box, Checkbox, FormControl, 
    Typography, FormControlLabel, FormGroup, Button, Alert, IconButton, Collapse, Grid, FormLabel, Select, MenuItem } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import BootstrapDialogTitle from './BootStrapDialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import '@fontsource/roboto/500.css';
import previewImage from '../static/preview.jpg';

const serverUrl = require('../data/serverUrl.json');

const HOST = serverUrl['HOST']
const PORT = serverUrl['PORT']
const URL = `${HOST}${PORT}`;

const checkboxes = [
    {
        name: "cb1",
        text: "우리 방에 누군가 있어요",
        msg: "옆방에 사람이 있어요.",
        key: "warning_while_occupied"
    },
    {
        name: "cb2",
        text: "우리 방이 대화 중이에요",
        msg: "옆방에서 대화 중이에요.",
        key: "warning_while_talking"
    },
    
    /*{
        name: "cb3",
        text: "방에서 녹화/녹음 중이면 주의 메시지 전달",
        msg: "옆방에서 강의 녹화/녹음을 하고 있어요."
    },
    {
        name: "cb4",
        text: "방에서 수면 중이면 주의 메시지 전달",
        msg: "옆방에 낮잠 자는 사람이 있어요."
    },
    {
        name: "cb5",
        text: "방에 손님이 있으면 주의 메시지 전달",
        msg: "옆방에 손님이 계세요."
    }*/
];




function RuleEditForm(props) {
    const level = props.ruleLevel
    const onSuccess = props.onSuccess
    const onError = props.onError
    const calendarEvent = props.calendarEvent 
    const eventId = calendarEvent.id // google calendar event id
    const calendar = props.calendar
    const calendarId = calendar.id // google calendar id
    const rule = props.rule
    const ownerKind = props.ownerKind
    const floor = props.floor
    const [description, setDescription] = useState(rule ? rule.description : (calendarEvent.summary + " 중입니다."))
    const [warningAlways, setWarningAlways] = useState( (rule != null ) ? rule.warning_always : true)
    const [warningWhileOccupied, setWarningWhileOccupied] = useState( rule ? rule.warning_while_occupied : false )
    const [warningWhileTalking, setWarningWhileTalking] = useState(rule ? rule.warning_while_talking : false)
    const [destRoomId, setDestRoomId] = useState(rule ? rule.dst_room_id : null);
    const [isDestSelected, setIsDestSelected] = useState( rule ? (rule.dst_room_id!==null) :false)

    const [previewOpen, setPreviewOpen] = useState(false);
    const [submit, setSubmit] = useState(false);
    const [alert, setAlert] = useState(false);

    console.log("RuleEditForm - rule: ", rule)

    const resetForm = () => {
        setWarningWhileOccupied(false)
        setWarningWhileTalking(false)
        setWarningAlways(true)

        //setCheckedState([false, false, false])
    }



    const submitOpen = () => {
        if (!warningAlways && !(warningWhileOccupied || warningWhileTalking)) {
            //setAlert(true);
            props.onError("상황을 1개 이상 지정해주세요.")
        } else {
            setSubmit(true);
        }
    };

    const submitClose = () => {
        setSubmit(false);
    };

    const submitYes = () => {
        setSubmit(false);

        const body = {
            calendar_id: calendarId,
            event_id: eventId,
            level: level,
            warning_while_occupied: warningWhileOccupied,
            warning_while_talking: warningWhileTalking,
            warning_always: warningAlways,
            dst_room_id: isDestSelected ? destRoomId : null,
            description: description
        }

        fetch(`${URL}/rules`,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            })
            .then(response => {
                console.log(response); 
                if (props.onSuccess) {

                    props.onSuccess("저장되었습니다!")
                }
                })
            .catch(error => {
                console.error(error); 
                if (props.onError) {
                    props.onError("에러가 발생했습니다!")
                }
                });
    };

    const submitNo = () => {
        setSubmit(false);
    };

    var msgs = []
    if (warningWhileOccupied) {
        msgs.push("우리 방에 누가 있어요.")
    }
    if (warningWhileTalking) {
        msgs.push("우리 방이 대화중이에요.")
    }
    console.log(msgs)

    /*checkedState.map((isChecked, index) =>
        isChecked ? <li> {checkboxes[index].msg} </li> : null
    );*/

    console.log(warningAlways)
    const warningOccupiedMessage = {
        "user": "내가 주변에 있을 때",
        "actuator" : "우리 방에 누군가 있어요",
        "room": "우리 방에 누군가 있어요"
    }[ownerKind]
    const warningTalkingMessage = {
        "user": "내가 대화 중일 때",
        "actuator" : "우리 방이 대화 중이에요",
        "room": "우리 방이 대화 중이에요"
    }[ownerKind]

    return (
        <Box sx={{ width: '100%', height: '100%',  }}>
            {
                (ownerKind != "user") ? (
                <FormControl>
                    <Typography variant='h6' sx={{fontWeight:600, maxWidth:"100vw", wordBreak:"keep-all"}}>
                        본 일정의 장소는 어디인가요?
                    </Typography>
    
                    <RadioGroup aria-label="destination" defaultValue={isDestSelected ? "single" : "multi"} 
                        name="controlled-radio-buttons-group" onChange={(event, value)=>{
                            setIsDestSelected(value === "single")
                         }}>
                        <FormControlLabel value="multi" control={<Radio />} label={
                            <span>{`${floor.name} 의 여러 방`  }</span>
                        } />
                        <FormControlLabel value="single" control={<Radio />} label={
                            <span>다음 방에서:  <Select
                            labelId="dest_room_id"
                            value={ destRoomId || (floor.nearby_rooms && floor.nearby_rooms[0].id) || ""}
                            label="dest_room_id"
                            onChange={(event, value)=>{

                               // if (!isMulti) {
                                setDestRoomId(event.target.value)   
                                //}
                            }}
                            disabled= { !isDestSelected}
                           
                          >
                              {
                                  floor.nearby_rooms ? floor.nearby_rooms.map((r)=>
                                    <MenuItem value={r.id} key={r.id}>{r.name}
                                    </MenuItem>) : <span/>
                              }
                            

                          </Select></span>
                        } />
                    </RadioGroup>
                </FormControl>
                ): <div/>
            }
            {
                (level === "warning") ? (
                    <div>

                        <FormControl sx={{mt:"1rem"}}>
                            <Typography variant='h6' sx={{fontWeight:600, maxWidth:"100vw", wordBreak:"keep-all"}}>
                                언제 주의를 줄까요?
                            </Typography>
            
                            <RadioGroup aria-label="condition" defaultValue={warningAlways ? "always" : "conditional"} 
                                name="controlled-radio-buttons-group" onChange={(event, value)=>{ setWarningAlways(value==="always") }}>
                                <FormControlLabel value="always" control={<Radio />} label={
                                    <span>일정 동안 <b>항상</b> 주의를 줍니다.</span>
                                } />
                                <FormControlLabel value="conditional" control={<Radio />} label={
                                    <span><b>다음 상황</b>일 때 주의를 줍니다.</span>
                                } />
                            </RadioGroup>
                        </FormControl>
                    </div>
                ) : (<div/>)
            }

            {
                (level === "warning" && !warningAlways) ? 
                (<div>

                    <Typography variant='h6' sx={{fontWeight:600, maxWidth:"100vw", wordBreak:"keep-all", mt: "1rem"}}>
                    주의전달이 필요할 상황을 선택해주세요.
                    </Typography>
                    <FormGroup>
                        <FormControlLabel
                            key={0}
                            label={
                                <Typography variant='body2'> {warningOccupiedMessage} </Typography>
                            }
                            control={<Checkbox checked={warningWhileOccupied} 
                                color='warning' name="warning-while-occupied" onChange={(event)=>{ setWarningWhileOccupied(event.target.checked)}} />}
                        />
                        <FormControlLabel
                            key={1}
                            label={
                                <Typography variant='body2'> {warningTalkingMessage} </Typography>
                            }
                            control={<Checkbox checked={warningWhileTalking} 
                                color='warning' name="warning-while-talking" onChange={(event)=>{ setWarningWhileTalking(event.target.checked)}} />}
                        />
                    </FormGroup>
                </div>) : (<div/>)
            }
            

            <Typography  variant='h6' sx={{fontWeight:600, mt:"1rem"}}>
                <b>한줄 메세지<br /></b>
            </Typography>
            <Typography variant="caption">
                기기 사용자에게 상황을 설명해주세요. 
            </Typography>
            {/* Message Input Field */}
            <Box sx={{ marginTop:"0.5rem", width: "800px", maxWidth:"90vw"}}>
                <TextField
                    placeholder="예: 화상 회의 중이에요. "
                    color='error'
                    fullWidth
                    id="message"
                    multiline
                    maxRows={10}
                    value={description}
                    onChange={(event)=>{setDescription(event.target.value)}}
                />
            </Box>

            <Box sx={{maxWidth:"95vw", marginTop:"2rem" }}>
                <Button color='inherit' variant="contained" color="primary" endIcon={<SendIcon />} onClick={submitOpen} sx={{fontWeight:800}}>
                    저장하기
                </Button>
                <Button color='inherit' variant="outlined" color="warning" endIcon={<DeleteIcon/>} onClick={resetForm} sx={{marginLeft:"1rem",  fontWeight:600}}>
                    초기화
                </Button>
            </Box>


            <Button color='inherit' startIcon={<HelpOutlineIcon size="large"/>} onClick={()=>setPreviewOpen(true)} sx={{fontSize:"0.7rem", fontWeight:500, marginTop:"0.5rem"}} >
                상대방에게는 어떻게 보이나요?
            </Button>




            {/* Preview Dialog */}
            <Dialog
                onClose={()=>setPreviewOpen(false)}
                open={previewOpen}
                fullWidth={true}
                maxWidth="md"
            >
                <BootstrapDialogTitle id="customized-dialog-title" onClose={()=>setPreviewOpen(false)}>
                    <b>미리보기</b>
                </BootstrapDialogTitle>
                
                <DialogContent sx={{ bgcolor: 'white' }}>
                    <Box
                        noValidate
                        component="form"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            m: 'auto',
                            width: 'fit-content',
                        }}
                    >
                        <Typography>아래는 예시 사진입니다. (화면상 문구는 무시해주세요.)</Typography>
                        <img src={previewImage} width={"100%"}/>
                    </Box>
                </DialogContent>
            </Dialog>
            {/* Submit Dialog */}
            <Dialog
                open={submit}
                onClose={submitClose}
            >
                <DialogTitle sx={{fontWeight:600}}>
                    {"다음 상황/문구를 선택한 것이 맞나요?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>

                        {
                            msgs.map((msg, idx)=><li>{msg}</li>)
                        }
                        <Typography sx={{mt:"1rem", fontWeight:550}}>한줄 메시지</Typography>
                        <Typography sx={{}}>{description}</Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={submitYes} sx={{fontWeight:600, }} color="info">네!</Button>
                    <Button onClick={submitNo} sx={{}} autoFocus color="error">아니오</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RuleEditForm;