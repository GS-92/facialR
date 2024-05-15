import React from "react";
import "./FaceRec.css";

const FaceRec = ({imageUrl, boxes}) => {
    return (
        <div className="center ma">
            <div className="absolute mt2">
               <img id='inputImage'alt='' className="pa1" src={imageUrl} width ='500px' height='auto'/>
               {boxes.map((box, index) => {
                return (
                    <div 
                        key={index}
                        className="bounding-box" 
                        style={{
                            top: box.topRow, 
                            right: box.rightCol, 
                            bottom: box.bottomRow, 
                            left: box.leftCol
                        }}
                ></div>
                )
               })} 
            </div>    
        </div>
    );
}

export default FaceRec;