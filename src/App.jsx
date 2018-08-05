import React from 'react';
import { connect } from 'react-redux';

const AppDisplay = ({test})=>(
    <div>
        <h1>This is a test {test} </h1>
    </div>
);
const mapStateToProps = (state,ownProps)=>{
    return {
        ...state
    }
};
// export default AppDisplay;
export default connect(mapStateToProps) (AppDisplay);