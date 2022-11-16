import {ListItem, Typography} from "@mui/material";
import person from '../static/person.png'

const SpeechBalloon = (props) => {
    const {idx, reason} = props;
    return (
        <ListItem key={idx}>
            <img src={person} alt={"person"} width="80"/>
            <div style={{
                width: "0",
                height: '0',
                "border-top": "14px solid transparent",
                "border-bottom": "14px solid transparent",
                "border-right": "60px solid white"
            }}>
            </div>
            <Typography id='typography' variant='h5' align='center' sx={{
                backgroundColor: 'white',
                border: "#ffffff solid 1px",
                borderRadius: ".4em",
                fontSize: "2rem",
                wordBreak: "keep-all",
                padding: "12px",
            }}>
                {reason}
            </Typography>
        </ListItem>
    )
}

export default SpeechBalloon;