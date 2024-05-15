import React from "react";

class SignUp extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            email: '',
            password: '',
            name: '',
        }
    }

    onNameChange = (event) =>{
        this.setState({name: event.target.value})
    }

    onEmailChange = (event) =>{
        this.setState({email: event.target.value})
    }

    onPasswordChange = (event) =>{
        this.setState({password: event.target.value})
    }

    onSubmitSignUp = () =>{
        //check if any input fields are empty
        if(!this.state.name.trim() || !this.state.email.trim() || !this.state.password.trim()){
            alert("Please fill in all fields");
            return;
        }

        fetch('http://localhost:3030/signup', {
            method: 'post',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({
                name: this.state.name,
                email: this.state.email,
                password: this.state.password,
            })
        }).then(response => response.json()).then(user => {
            if(user){
                this.props.loadUser(user);
                this.props.onRouteChange('home');
            }
        }).catch(console.log)  
    }

    render(){
        return(
            <article className="br2 ba dark-gray b--black-10 mv7 w-100 w-50-m w-25-l mw6 center shadow-5 ">
                <main className="pa4 black-80">
                    <div className="measure">
                        <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                            <legend className="f4 fw6 ph0 mh0 center">Sign Up</legend>
                            <div className="mt3">
                                <label className="db fw6 lh-copy f6 " htmlFor="name">Name</label>
                                <input className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="text" name="name"  id="name" 
                                onChange={this.onNameChange}/>
                            </div>
                            <div className="mt3">
                                <label className="db fw6 lh-copy f6" htmlFor="email-address">Email</label>
                                <input className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="email" name="email-address"  id="email-address" 
                                onChange={this.onEmailChange}/>
                            </div>
                            <div className="mv3">
                                <label className="db fw6 lh-copy f6" htmlFor ="password">Password</label>
                                <input className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" type="password" name="password"  id="password" 
                                onChange={this.onPasswordChange}/>
                            </div>
                        </fieldset>
                        <div className="center">
                        <input className=" center b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib pointer" type="submit" value="Sign up" 
                        onClick={this.onSubmitSignUp}/>
                        </div>
                    </div>
                </main>
            </article>
        )
    }
    
}

export default SignUp;