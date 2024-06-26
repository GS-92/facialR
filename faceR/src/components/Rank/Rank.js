import React from "react";

const Rank = ({name, entries}) => {
    return (
        <div className="center mv5">
            <div className="white f3">
                {`${name}, Your current entry count is ...`}
            </div>
            <div className="white f3">
                {`${entries}`}
            </div>
        </div>
    );
}

export default Rank;