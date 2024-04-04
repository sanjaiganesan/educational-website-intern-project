import { Link, useNavigate } from 'react-router-dom';
import { passwordValidator,repasswordValidator } from '../pages/SignupregexValidator.js';
import React, { useState } from 'react';
import { SignUp } from './API.js';

function Password() {
            
            const [loader,setLoader] = useState(false)  
            let data = sessionStorage.getItem('userdata')
            data = JSON.parse(data)        
            const [input,setInput] = useState({...data,password:'',repassword:''})
            const [errorMessage,seterrorMessage] = useState('')
            // const [successMessage,setsuccessMessage] = useState('')
            const navigate = useNavigate()
            const handleChange = (event) => {
                setInput({...input, [event.target.name]: event.target.value})
            }
            const register = async()=>{
                try {
                    setLoader(true)
                    const data = await SignUp(input)
                    // console.log(res.data)
                    if(data.status === 'success')
                    {
                        setLoader(false)
                        sessionStorage.setItem('userdata',JSON.stringify({username:data.username,email:data.email,image:data.image}))
                        navigate('/main/home')
                    }
                    else
                    {
                        setLoader(false)
                        seterrorMessage(data.status)
                    }
                } catch (error) {
                    alert(error)
                }
            }
            const formSubmitter = (event) => {
                event.preventDefault();
                // setsuccessMessage('');
                seterrorMessage('');

                if(!passwordValidator(input.password)) 
                return seterrorMessage('password should have minimum 8 character with the combination of uppercase,lowercase,numbers and specialcharacter');

                if(!repasswordValidator(input.repassword)) 
                return seterrorMessage('please enter same password');
                
                // setsuccessMessage('Successfully validated')
                register()
                // console.log(input)
            }

            return(
            <>
            <section>
                <form className='box-size'>
                {loader && <div className="loader"/>}
                <div className='Signuppage'>
                    <h1 className='h1f1'><u><strong>New User Account</strong></u></h1>

                    {errorMessage.length > 0 && <div className='msg'>{errorMessage}</div>}
                
                    <img src={data.image} className={'image'} alt='avatar'/>
                    <h1>{data.username}</h1>
                    <h5>{data.email}</h5>
                    <div className='input-group mb-3'>
                        <span className='input-group-addon' id='addon'><i className="uil uil-padlock"></i></span>
                        <input type="password" id="password" className="form-control" name='password' placeholder='Enter Password' required onChange={handleChange}></input>
                    </div>

                    <div className='input-group mb-3'>
                        <span className='input-group-addon' id='addon'><i className="uil uil-padlock"></i></span>
                        <input type="password" id="rpassword" className="form-control" name='repassword' placeholder='Repeat Password' required onChange={handleChange}></input>
                    </div>

                    <div className="form-check form-check-inline mb-5">
                        <input type="checkbox" id="checkbox" className="form-check-input" value=""/>
                        <label htmlFor="checkbox" className="form-check-label">I accept all terms & conditions</label>
                    </div>
            
                    <button id='rbutton'type="submit" className='Signupbutton' value="send" onClick={formSubmitter}>Register</button>
                </div>
                <p className='p1f3'>Already have an account? <Link to='/login' className='signin'>Sign In</Link></p>
                </form>
            </section>
        </>
    )
}
export default Password;