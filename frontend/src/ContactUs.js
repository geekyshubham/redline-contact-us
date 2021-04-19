import React, { Component , useState ,useEffect } from 'react';
import { render } from 'react-dom';
import './index.css';

class App extends Component {
  render() {
    
    return (
      <ContactUs />
    );
  }
}
const validEmailRegex = RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);


class ContactUs extends Component {
  
  constructor(props) {
    super(props);
      this.state = {
      formEmpty: {value:true},
      errorCount: null,
      errors: {
        fullName: '',
        email: '',
        phone: '',
      },
      valid:{
        name:false,
        phone:false,
        email:false        
      }
    };
  }

  onVerifyCaptcha (token) {
    console.log('Verified: '+ token)
    }

  
  handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    let errors = this.state.errors;
    let valid = this.state.valid;
    let formEmpty = this.state.formEmpty;
    formEmpty.value=false;
    switch (name) {
      case 'fullName': 
      valid.name = value.length>5?true:false;
        errors.fullName = 
          value.length < 5
            ? 'Full Name must be 5 characters long!'
            : '';
        break;
      case 'email': 
      valid.email = validEmailRegex.test(value)?true:false;
        errors.email = 
          validEmailRegex.test(value)
            ? ''
            : 'Email is not valid!';
        break;
      case 'phone': 
      valid.phone = value.length === 10?true:false
        errors.phone = 
          value.length < 10
            ? 'phone must be of 10 Digits!'
            : '';
        break;
      default:
        break;
    }

    this.setState({errors, [name]: value});
  }

  

  handleSubmit = async (event) => {
    let valid=this.state.valid;
    let isValid = valid.email && valid.name && valid.phone;
    
    event.preventDefault();

    if(isValid){
    const { name, phone, email, message } = event.target.elements;
    let details = {
      name: name.value,
      phone:phone.value,
      email: email.value,
      message: message.value
    };
    
    let response = await fetch("http://localhost:5000/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(details),
    });

    let result =  await response.json();

    if(result.status === "Message Sent"){
      var inputs = document.querySelectorAll('input');
      inputs.forEach(input => {input.value = ''})
      document.getElementById('message').value = '';
      document.getElementById('form-status').innerHTML = '<br/>Form Submitted, Our team will soon reach out to you ✅';
    } 
    else{
      document.getElementById('form-status').innerHTML = '<br/>Something went wrong, Please try again later. ❌';

    }
  }
   
  }

  
  render() {
    const {errors,valid,formEmpty} = this.state;
    return (
      <div className='wrapper'>
        <div className='form-wrapper'>
          <h2>Create Account</h2>
          <form onSubmit={this.handleSubmit} method='post' noValidate>
            <div className='fullName'>
              <label htmlFor="fullName">Full Name</label>
              <input type='text' id='name' name='fullName' onChange={this.handleChange} noValidate />
              {errors.fullName.length > 0 && 
                <span className='error'>{errors.fullName}</span>}
            </div>
            <div className='email'>
              <label htmlFor="email">Email</label>
              <input type='email' id='email' name='email' onChange={this.handleChange} noValidate />
              {errors.email.length > 0 && 
                <span className='error'>{errors.email}</span>}
            </div>
            <div className='phone'>
              <label htmlFor="phone">Mobile Number</label>
              <input type='tel' id='phone' name='phone' maxLength="10" onChange={this.handleChange} noValidate />
              {errors.phone.length > 0 && 
                <span className='error'>{errors.phone}</span>}
            </div>
            <div className='message'>
              <label htmlFor="message">Message</label>
              <textarea id='message' name='message'/>
            </div>

            <hCaptcha sitekey="b4da1987-303c-4771-97c1-c576311369e1" onVerify={this.onVerifyCaptcha}/>
            <div className='submit'>
              <button type="submit">Submit</button>
            </div>
             <p className="form-status" id='form-status'>Form is {formEmpty.value?'Empty ❔':valid.name && valid.email && valid.phone ? 'valid ✅' : 'invalid ❌'}</p> 
          </form>
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));




export default ContactUs;