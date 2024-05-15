import React from "react";

const ImageForm = ({onInputChange, onPictureSubmit}) => {
    return (
        <div>
            <p className="f2 center">
                {'Face Detection'}
            </p>
            <div className="center">
                <div className="pa2 w-40 center shadow-2">
                    <input className="f5 pa2 w-60 br3" type="text" onChange={onInputChange} placeholder="Type"/>
                    <button className="w-20 grow f4 dib white bg-light-purple br3" onClick={onPictureSubmit}>Detect</button>
                </div>
                
            </div>
        </div>
    )
}

export default ImageForm;