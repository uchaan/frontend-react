import React, { useState } from 'react';
import { Box, Checkbox, Typography, FormControlLabel, FormGroup, Button, Alert, IconButton, Collapse, Grid } from '@mui/material';
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

function WarningConfiguration(props) {

    const [checkedState, setCheckedState] = useState(
        checkboxes.map(item => {
            if (item.key !== null && props.data !== null) {
                return props.data[item.key];
            } else { return false; }
        })
    );
    const [open, setOpen] = useState(false);
    const [submit, setSubmit] = useState(false);
    const [alert, setAlert] = useState(false);

    const handleCheck = (position) => {
        const updatedCheckedState = checkedState.map((item, index) =>
            index === position ? !item : item
        );
        setCheckedState(updatedCheckedState);
    };

    const resetCheck = () => {
        setCheckedState([false, false, false])
    }

    const previewOpen = () => {
        setOpen(true);
    };

    const previewClose = () => {
        setOpen(false);
    };

    const submitOpen = () => {
        if (!(checkedState[0] || checkedState[1])) {
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
            calendar_id: props.calendar,
            event_id: props.event,
            level: "warning",
            warning_while_occupied: checkedState[0],
            warning_while_talking: checkedState[1],
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

    const checkbox = (index) => {

        let color;
        (index >= 2) ? color = "text.disabled" : color = "inherit";

        return (
            <FormControlLabel
                key={index}
                sx={{ color: color, }}
                label={
                    <Typography variant='body2'> {checkboxes[index].text} </Typography>
                }
                control={<Checkbox checked={checkedState[index]} color='warning' name={checkboxes[index].name} onChange={(index < 2) ? () => handleCheck(index) : null} />}
            />
        );
    }

    const previewMessage = checkedState.map((isChecked, index) =>
        isChecked ? <li> {checkboxes[index].msg} </li> : null
    );

    return (
        <Box sx={{ width: '100%', height: '100%',  }}>
            <Typography variant='h6' sx={{fontWeight:600, maxWidth:"100vw", wordBreak:"keep-all"}}>
                주의전달이 필요할 상황을 선택해주세요.
            </Typography>
            <FormGroup>
                {checkbox(0)}
                {checkbox(1)}
                {//checkbox(2)
                //checkbox(3)
                //checkbox(4)
                }

            </FormGroup>
            {/* Preview Dialog */}
            <Dialog
                onClose={previewClose}
                open={open}
                fullWidth={true}
                maxWidth="md"
            >
                <BootstrapDialogTitle id="customized-dialog-title" onClose={previewClose}>
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
                    {"다음 상황를 선택한 것이 맞나요?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {previewMessage}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={submitYes} sx={{fontWeight:600, }} color="info">네!</Button>
                    <Button onClick={submitNo} sx={{}} autoFocus color="error">아니오</Button>
                </DialogActions>
            </Dialog>

            <Box sx={{maxWidth:"95vw", marginTop:"2rem" }}>
                <Button variant="contained" color="primary" endIcon={<SendIcon />} onClick={submitOpen} sx={{fontWeight:800}}>저장하기</Button>
                <Button variant="outlined" color="warning" endIcon={<DeleteIcon/>} onClick={resetCheck} sx={{marginLeft:"1rem",  fontWeight:600}}>
                    초기화
                </Button>
            
            </Box>


            <Button color='inherit' startIcon={<HelpOutlineIcon size="large"/>} onClick={previewOpen} sx={{fontSize:"0.7rem", fontWeight:500, marginTop:"0.5rem"}} >
                상대방에게는 어떻게 보이나요?
            </Button>


        </Box>
    );
};

export default WarningConfiguration;