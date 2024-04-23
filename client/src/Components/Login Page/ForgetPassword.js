import axios from 'axios';
import React, { useState } from 'react';
import '../Styles/login.css'
const apiUrl = process.env.REACT_APP_API_URL;

function ForgetPassword() {
    const [email, emailSet] = useState("");
    const [alert, setAlert] = useState("");

    const handleForgetPassword=async()=>{
        try{
            const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
            const response = await axios.post(`${apiUrl}/user/forgetpassword`, {
                email: email,
            }, {
                headers: {
                    'X-Frontend-Port': port
                }
            });
            if(response.status >= 200 && response.status < 300){ 
                setAlert("please check ur mail !");
            }
        }
        catch(err){
            setAlert("Failed to send email. Please try again.");
        }
    }

    return (
        <div className="container-grey">
            <div className="form-container">
                <div className='h1Box'>
                    <h1 className='h1'>FORGET PASSWORD</h1>
                    <div className="line"></div>
                </div>
                <div className="loginBox">
                    <div className="entryBox">
                        <div className="entryText">Email</div>
                        <input className="email input" type="email" name="Email" placeholder="Your Email" required="" onChange={(e) => emailSet(e.target.value)} />
                    </div>
                    <button className="loginBtn  form-button" type="submit" onClick={handleForgetPassword}>
                        Send Email
                    </button>
                     {/* Display alert message  */}
                    {alert && <div className="error-message">{alert}</div>} 
                </div>
            </div>
        </div>
    )
}

export default ForgetPassword
