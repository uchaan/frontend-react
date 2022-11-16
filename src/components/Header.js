import React, { useState } from 'react';
import { AppBar, Toolbar, Box, Typography, IconButton, Dialog, Container } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DialogContent from '@mui/material/DialogContent';
import BootstrapDialogTitle from './BootStrapDialogTitle';

import '@fontsource/roboto/700.css';

function Header(props) {

    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const helper =
        <IconButton
            color="inherit"
            size='large'
            onClick={handleClickOpen}
        >
            <HelpOutlineIcon />
        </IconButton>

    return (
        <Box mb={2}>
            <AppBar position="static">
                <Container maxWidth="lg">
                    <Toolbar disableGutters sx={{paddingLeft: "0px", paddingRight: "0px"}}>
                        <Typography variant="h4" sx={{ fontSize:"1.5rem", fontWeight:600 }}>
                            {props.name}
                        </Typography>
                        {props.helper === 1 ? helper : null}
                    </Toolbar>
                </Container>
            </AppBar>

            <Dialog
                onClose={handleClose}
                open={open}
                fullWidth={true}
                maxWidth="md"
            >
                <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
                    <b>도움말</b>
                </BootstrapDialogTitle>
                <DialogContent>
                    <Typography variant='body2'>

                        이 페이지에서 주변 <b> 소음 발생 기기 사용 규칙 </b> 을 설정할 수 있습니다. <br /><br />

                        설정한 규칙은 일정이 시작되면 적용되고, 일정이 끝나면 적용되지 않습니다. <br /><br />

                        <b> ‘경고’, ‘주의’ </b> 총 2가지 규칙이 있습니다. <br />

                        <ol>
                            <li> <Typography variant='body2'> <b>‘주의’</b> 규칙을 설정하면, 누군가 주변에서 기기를 사용하려고 하면 주의 메시지가 전달됩니다. </Typography> </li>
                            <li><Typography variant='body2'>  <b>‘경고’</b> 규칙을 설정하면, 주변의 소음 발생 기기가 작동되지 않습니다.  </Typography> </li>
                        </ol>

                        <b>(*모든 메시지는 익명으로 전달됩니다.)</b><br /><br />

                        우측 하단의 PREVIEW 버튼을 클릭하면 기기 옆 모니터에 표시될 메시지를 미리 볼 수 있습니다. <br /><br />

                        SUBMIT 버튼을 클릭하면 규칙이 주변 기기들에 적용됩니다. <br />이전에 설정한 규칙이 있으면, 새로 설정한 규칙으로 업데이트됩니다. <br /><br />

                        규칙 설정에 관하여 궁금한 점이 있으시면 관리자 (C.P. 010-9485-3932) 에게 연락주세요. 감사합니다.

                    </Typography>
                </DialogContent>
            </Dialog>
        </Box>
    )
}

export default Header;