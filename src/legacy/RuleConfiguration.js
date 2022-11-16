import React, { useState } from 'react';
import Header from "../components/Header";
import { Typography, Box, Checkbox, FormControlLabel, Container } from '@mui/material';
import WarningConfiguration from '../components/WarningConfiguration';
import ProhibitionConfiguration from '../components/ProhibitionConfiguration';
import { useLocation } from 'react-router';

import '@fontsource/roboto/500.css';

// POST 

const checkboxes = [
    {
        name: "warning",
        text: "주의"
    },
    {
        name: "error",
        text: "경고"
    }
]

function RuleConfiguration() {

    const [checkedState, setCheckedState] = useState(
        [true, false]
    );

    const handleCheck = () => {
        const updatedCheckedState = checkedState.map((item) =>
            !item
        );
        setCheckedState(updatedCheckedState);
    };

    const location = useLocation();
    const params = new URLSearchParams(location.search);

    // const calendar_id = params.get('calendar_id');
    // const event_id = params.get('event_id');

    const checkbox = (index) => {
        return (
            <FormControlLabel
                sx={{ color: "inherit", }}
                label={checkboxes[index].text}
                control={<Checkbox checked={checkedState[index]} color={index === 0 ? 'warning' : 'error'} name={checkboxes[index].name} onChange={() => handleCheck(index)} />}
            />
        );
    }

    return (
        <Box sx={{ m: 1 }}>
            <Header name="Rule Edit" />
            <Box sx={{ m: 2 }}>
                <Typography variant='h6'> <br /> 이 페이지에서 캘린더에서 만드신 일정에 적용되는 <b> 소음 발생 기기 사용 규칙</b>을 설정하실 수 있습니다. </Typography>
                <br />
                <Typography variant='h6'> 규칙은 <b>‘경고’, ‘주의’</b> 총 2가지 종류가 있습니다. </Typography>
                <ul>
                    <li><Typography variant='h6'> <b>‘주의’</b> 규칙으로 설정하실 경우, 해당 시간대에 소음 발생 기기 사용자에게 <b>주의 메시지가 전달</b>됩니다. </Typography></li>
                    <li><Typography variant='h6'> <b>‘경고’</b> 규칙으로 설정하실 경우, 해당 시간대에 소음 발생 기기가 <b>작동되지 않습니다.</b></Typography></li>
                </ul>
                <Typography variant='h6'> 설정 후 우측의 PREVIEW 버튼을 클릭하시면 기기를 작동시키려는 사용자에게 전달될 메시지를 미리보기 하실 수 있습니다. </Typography>
                <br />
                <Typography variant='h6'> SUBMIT 버튼을 클릭하시면 해당 일정에 대한 규칙이 현재 거주하고 계신 공간에 적용됩니다.</Typography>
                <Typography variant='h6'> 이전에 해당 일정에 설정해 놓은 규칙이 있으시면면, 새롭게 업데이트됩니다.</Typography>
                <br />

                <Typography variant='h6'> 규칙 설정에 관하여 궁금하신 점이 있으시면 관리자 (C.P. 010-9485-3932) 에게 연락주세요. 감사합니다. </Typography>
                <br /><br /><hr />
            </Box>
            <Box sx={{ m: 2 }}>
                <Box sx={{ marginTop: 3, width: '100%', typography: 'body1' }}>
                    <Typography variant='h6'> 어떤 규칙을 만들고 싶으신가요? </Typography>
                    <Box sx={{ display: 'flex', }}>
                        {checkbox(0)}
                        {checkbox(1)}
                    </Box>
                    <br /><hr /><br />
                    <Container maxWidth='xl'>
                        {checkedState[0] ? <WarningConfiguration /> : <ProhibitionConfiguration />}
                    </Container>
                </Box>
                {/* <Box sx = {{ width: '100%'}}>
                        <Typography variant="body2">Calendar ID: {calendar_id}</Typography>
                        <Typography variant="body2">Event ID: {event_id}</Typography>
                    </Box> */}
            </Box>
        </Box>
    );
}

export default RuleConfiguration;