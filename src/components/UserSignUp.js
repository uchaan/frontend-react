// Import FirebaseAuth and firebase.
import React, { useEffect, useState } from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

import Header from './Header';
import { Box, Button, Container, Typography, Link, FormControl, InputLabel, Select, MenuItem } from '@mui/material'

// Configure Firebase.
const config = { // deleted due to the security isse
};
firebase.initializeApp(config);

// Configure FirebaseUI.
const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // We will display Google and Facebook as auth providers.
    signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
        // Avoid redirects after sign-in.
        signInSuccessWithAuthResult: () => false,
    },
};

// URL
const serverUrl = require('../data/serverUrl.json');
const HOST = serverUrl['HOST']
const PORT = serverUrl['PORT']
const URL = `${HOST}${PORT}`;

function SignInScreen() {
    const [isSignedIn, setIsSignedIn] = useState(false); // Local signed-in state.
    const [userData, setUserData] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [roomId, setRoomId] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Listen to the Firebase Auth state and set the local state.
    useEffect(() => {
        const unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
            setIsSignedIn(!!user);
        });
        return () => unregisterAuthObserver(); // Make sure we un-register Firebase observers when the component unmounts.
    }, []);

    useEffect(() => {
        if (isSignedIn) onSignIn()
    }, [isSignedIn]);

    const onSignIn = async () => {
        setLoading(true)
        const requestBody = {
            name: firebase.auth().currentUser.displayName,
            email: firebase.auth().currentUser.email,
        }
        try {
            let response = await fetch(
                `${URL}/users/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                }
            )
            if (response.status === 409) {
                response = await fetch(`${URL}/users/email/${requestBody.email}`)
            }
            if (!response.ok) return
            let data = await response.json()
            console.log("Fetched user data")
            console.log(data)
            setUserData(data)
            setRoomId(data.curr_room_id)
            
            let roomsResponse = await fetch(`${URL}/rooms`)
            let rooms = await roomsResponse.json()
            rooms = rooms.filter(r => !r.is_corridor)
            console.log("Fetched Rooms")
            console.log(rooms)
            setRooms(rooms)

            setLoading(false)
        } catch(err) {
            console.log(err)
            setError(err)
            setLoading(false)
        }
    }

    const onLocationSelect = async (event) => {
        console.log("Location changed")
        let roomId = (event.target.value === -1) ? null : event.target.value
        setRoomId(roomId)
    }

    useEffect(async () => {
        if (!userData) return
        if (userData.curr_room_id === roomId) return
        let requestBody = {
            room_id: (roomId === -1) ? null : roomId,
            location_expire_at: new Date("2021-12-31T23:59:59+09:00").toISOString()
        }
        try {
            console.log("Update location", JSON.stringify(requestBody))
            let response = await fetch(
                `${URL}/users/email/${userData.email}/location`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                }
            )
            if (!response.ok) return
            let data = await response.json()
            console.log("Updated user data")
            console.log(data)
            setUserData(data)
        } catch(err) {
            console.log(err)
            setError(err)
        }
    }, [roomId])

    const SelectLocation = () => {
        return (
            <Box sx={{pt: 3}}>
                <FormControl>
                    <InputLabel id="select-location-label">나의 평소 위치</InputLabel>
                    <Select
                        labelId="select-location-label"
                        id="select-location"
                        value={roomId || -1}
                        label="나의 평소 위치"
                        onChange={onLocationSelect}
                    >
                        <MenuItem value={-1}>Out of Office</MenuItem>
                        { rooms.map(r => (
                            <MenuItem key={r.id} value={r.id}>{`${r.name} - ${r.description}`}</MenuItem>
                        )) }
                    </Select>
                </FormControl>
            </Box>
        )
    }

    const UserInfoScreen = () => {
        return (
            <Box>
            {rooms && SelectLocation()}
            {userData && (
                <Box>
                <Box sx={{my: 3}}>
                    <Link href={`https://calendar.google.com/calendar/render?cid=${userData.google_calendar_id}`}>
                        <Button variant="contained">나의 SocioBuilindg 캘린더로 이동</Button>
                    </Link>
                    <Typography variant='caption' color="textSecondary" sx={{mt: 2, lineHeight: 1, display: "block"}}>
                        Calendar ID <br/>
                        <Link href={`https://calendar.google.com/calendar/embed?mode=WEEK&src=${userData.google_calendar_id}`} target="_blank">
                            {userData.google_calendar_id}
                        </Link>
                    </Typography>
                </Box>
                <Box sx={{pt: 2, overflowX: "auto"}}>
                    <iframe src={`https://calendar.google.com/calendar/embed?mode=WEEK&src=${userData.google_calendar_id}&showPrint=0`} style={{borderWidth: 0}} width="800" height="600" title="Calendar" frameBorder="0" scrolling="no"></iframe>
                </Box>
                </Box>
            )}
            </Box>
        )
    }
    
    if (!isSignedIn) {
        return (
            <Box>
                <Typography variant="h5" align="center">구글 계정으로 로그인해주세요.</Typography>
                <Typography variant="body1" color="textSecondary" align="center" sx={{mb:3}}>로그인하시면 자동으로 SocioBuilding 캘린더가 생성됩니다.</Typography>
                <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
            </Box>
        );
    }

    return (
        <Box sx={{ textAlign: "center"}}>
            <Box sx={{ wordBreak: "break-word" }}>
                <Typography variant="h5" align="center">Welcome {firebase.auth().currentUser.displayName}!</Typography>
                <Typography  variant='body1' color="textSecondary" align="center">SocioBuilding 실험에 참여해주셔서 감사합니다!</Typography>
                <Button onClick={() => firebase.auth().signOut()}>Sign-out</Button>
            </Box>
            {loading ? (<Typography sx={{ mt: 2 }}>캘린더 정보 로딩중 ...</Typography>) : UserInfoScreen()}
            
        </Box>
    );
}

function UserSignUp() {
    return (
        <Box>
            <Header name="SocioBuilding 계정 생성"/>
            <Container>
                <SignInScreen />
            </Container>
        </Box>
    )
}
        
export default UserSignUp;