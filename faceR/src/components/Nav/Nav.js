import React from 'react';

const Nav = ({onRouteChange, isSignedIn}) => {
        if(isSignedIn){
            return (
                <nav style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <p onClick={() => onRouteChange('signOut')}  className='f3 link dim black underline pa1 pointer'>
                        Sign out
                    </p>
                </nav>
            );
        } else {
            return (
                <nav style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <p onClick={() => onRouteChange('signIn')}  className='f4 link dim black underline pa1 pointer'>
                        Sign In
                    </p>
                    <p onClick={() => onRouteChange('signUp')}  className='f4 link dim black underline pa1 pointer'>
                        Sign Up
                    </p>
                </nav>
            );
        }
}

export default Nav;