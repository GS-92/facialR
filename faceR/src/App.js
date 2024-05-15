import React, {Component} from 'react';
import Nav from './components/Nav/Nav.js';
import Logo from './components/Logo/Logo.js';
import ImageForm from './components/ImageForm/ImageForm.js';
import Rank from './components/Rank/Rank.js';
import ParticlesBg from 'particles-bg';
import FaceRec from './components/FaceRec/FaceRec.js';
import SignIn from './components/SignIn/SignIn.js';
import SignUp from './components/SignUp/SignUp.js';
import './App.css';


const returnClarifaiRequestOptions =(imageUrl) => {
  const PAT = 'dac978f975774b93b6abb8f7755dc424';

  // Specify the correct user_id/app_id pairings

  // Since you're making inferences outside your app's scope
  const USER_ID = 'p354sp444d9v';
  const APP_ID = 'face-rec';
  // Change these to whatever model and image URL you want to use
  const IMAGE_URL = imageUrl;

  const raw = JSON.stringify({

    "user_app_id": {

        "user_id": USER_ID,

        "app_id": APP_ID

    },

    "inputs": [
        {
            "data": {
                "image": {
                    "url": IMAGE_URL
                }
            }
        }
    ]
  })

 const requestOptions = {

    method: 'POST',

    headers: {

        'Accept': 'application/json',

        'Authorization': 'Key ' + PAT

    },

    body: raw
  }
  return requestOptions;
}


class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      boxes: [],
      route:'signIn',
      isSignedIn: false,
      user: {
        id: '',
			  name: '',
			  email: '',
			  entries:  0,
			  joined: '',
      }
    }
  }

  loadUser = (data) =>{
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries:  data.entries,
      joined: data.joined,
    }
  })
  }

//get face data and outline it
  calculateFaceLocation = (data) => {
    //check if the data structure we're looking for is available
    if (!data.outputs || data.outputs.length === 0 ||!data.outputs[0].data.regions || data.outputs[0].data.regions.length === 0){
      console.log("invalid data structure", data);
      return []
    }

    const image = document.getElementById('inputImage')
    const width = Number(image.width);
    const height = Number(image.height);
    //get the face information and map the facial recognition of each
    return data.outputs[0].data.regions.map(region => {
      const clarifaiFace = region.region_info.bounding_box
      //return each face
      return {
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row * height)
      }
    })
  }

  //display the face boxes
  displayFaceBox = (boxes) => {
    this.setState({boxes})
  }

  //display photo
  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  // after 'detect' button is hit, display face outline(s)
  onPictureSubmit = () => {
    this.setState({imageUrl: this.state.input});

    //url
    let fd = 'face-detection'
    let url = "https://api.clarifai.com/v2/models/" + fd + "/outputs"

    //fetch the clarifai API
    fetch(url, returnClarifaiRequestOptions(this.state.input))
    .then(response => response.json())
    .then(result => {
      //make sure data is what we're looking for
      if(result && result.outputs && result.outputs[0] && result.outputs[0].data.regions){
        const faceBoxes = this.calculateFaceLocation(result)
        this.displayFaceBox(faceBoxes)

        //fetch API data to update count after 'detect' button is pressed
        fetch('http://localhost:3030/image', {
            method: 'put',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({
                id: this.state.user.id //id sent to app.Put("/image")
            })
        })
        .then(response => response.json()) //get count info from server
        .then(count =>{
          this.setState(Object.assign(this.state.user,{entries: count}))
        })
        .catch(error => console.log("Error updating entries count", error));
      } else {
        console.log("Invalid response structure", result);
     }
    })
    .catch(error => console.log("error1", error));
  }

onRouteChange = (route) => {
  if (route === 'signOut'){
    this.setState({isSignedIn: false})
  } else if ( route === 'home'){
    this.setState({isSignedIn: true})
  }
  this.setState({route: route});
}

  render(){
    const {imageUrl, boxes, route, isSignedIn} = this.state;
    return (
      <div className='App'>
       <ParticlesBg type='cobweb' bg={true} />
        <Nav isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        {
        route === 'home' ? 
        <div>
          <Logo />
          <Rank name={this.state.user.name} entries={this.state.user.entries}/>
          <ImageForm onInputChange = {this.onInputChange} onPictureSubmit={this.onPictureSubmit}/>
          <FaceRec boxes={boxes} imageUrl={imageUrl} />
        </div> : 
        (
          route === 'signIn' ?
          <SignIn loadUser={this.loadUser} onRouteChange ={this.onRouteChange} /> : <SignUp loadUser={this.loadUser} onRouteChange = {this.onRouteChange} />
        )
        
          }
      </div>
    )
  }
}

export default App;
