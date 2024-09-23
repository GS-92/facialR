import React from "react";
import Tilt from 'react-parallax-tilt';
import './Logo.css';
import brain from './Pictures/brain.png'

const Logo = () => {
    return (
        <div className="ma3 mt0">
            <Tilt className="Tilt br2 shadow-3" style={{ height:125, width: 125}}>
                <div className="Tilt-inner ">
                    <h1>
                        <img src={brain} alt="logo" style={{paddingTop:'5px'}}/>
                    </h1>
                </div>
            </Tilt>
        </div>
    )
}

export default Logo;