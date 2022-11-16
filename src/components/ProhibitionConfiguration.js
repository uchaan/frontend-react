import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, IconButton, Collapse, Grid } from '@mui/material';
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
import previewImage from '../static/preview.jpg';

import '@fontsource/roboto/500.css';

const serverUrl = require('../data/serverUrl.json');

const HOST = serverUrl['HOST']
const PORT = serverUrl['PORT']
const URL = `${HOST}${PORT}`;

function ProhibitionConfiguration(props) {

    const [value, setValue] = useState(props.data?.description);
    const [open, setOpen] = useState(false);
    const [submit, setSubmit] = useState(false);
    const [alert, setAlert] = useState(false);

    const handleCheck = (event) => {
        setValue(event.target.value);
    };

    const resetText = (event) => {
        setValue("");
    };

    const previewOpen = () => {
        setOpen(true);
    };

    const previewClose = () => {
        setOpen(false);
    };

    const submitOpen = () => {
        if (value === '') {
            //setAlert(true);
            props.onError("한줄 메세지가 필요합니다.")
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
            level: "prohibition",
            description: value,
        }

        fetch(`${URL}/rules`, 
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                referrerPolicy: 'no-referrer',
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

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <Typography  variant='h6' sx={{fontWeight:600}}>
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
                    value={value}
                    onChange={handleCheck}
                />
            </Box>
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
                    {"다음 메세지가 맞나요?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {value}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={submitYes} sx={{fontWeight:600, }} color="info">네!</Button>
                    <Button onClick={submitNo} sx={{}} autoFocus color="error">아니오</Button>
                </DialogActions>
            </Dialog>
            <Box sx={{maxWidth:"95vw", marginTop:"2rem" }}>
                <Button color='inherit' variant="contained" color="primary" endIcon={<SendIcon />} onClick={submitOpen} sx={{fontWeight:800}}>저장하기</Button>
                <Button color='inherit' variant="outlined" color="warning" endIcon={<DeleteIcon/>} onClick={resetText} sx={{marginLeft:"1rem",  fontWeight:600}}>
                    초기화
                </Button>
            
            </Box>

            <Button color='inherit' startIcon={<HelpOutlineIcon size="large"/>} onClick={previewOpen} sx={{fontSize:"0.7rem", fontWeight:500, marginTop:"0.5rem"}} >
                상대방에게는 어떻게 보이나요?
            </Button>


        </Box>
    );
};

export default ProhibitionConfiguration;

