import axios from 'axios';
import React, { useState } from 'react';
import { useHistory , useParams} from 'react-router-dom';
import '../Styles/login.css'
const apiUrl = process.env.REACT_APP_API_URL;


function ResetPassword() {
    const history = useHistory();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { token } = useParams();

    const handleResetPassword = async() => {
        try{
            const response = await axios.post(`${apiUrl}/user/resetpassword/${token}`,{
                password : password,
                confirmPassword : confirmPassword
            });
            if (!response.data) {
                console.error("Password reset failed");
                return;
            }
            console.log(response.data);
            history.push('/login');
        }
        catch (error) {
            console.error("Error resetting password:", error.message);
        }
    }

    return (
        <div className="container-grey">
            <div className="form-container">
                <div className='h1Box'>
                    <h1 className='h1'>RESET PASSWORD</h1>
                    <div className="line"></div>
                </div>
                <div className="loginBox">
                <div className="entryBox">
                        <div className="entryText">Password</div>
                        <input className="password input" type="password" name="Password" placeholder="**********" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="entryBox">
                        <div className="entryText">Confirm  Password</div>
                        <input className="confirmPassword input" type="password" name="ConfirmPassword" placeholder="**********" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <button className="loginBtn  form-button" type="button" onClick={handleResetPassword}>
                        Reset Password
                    </button>

                </div>
            </div>
        </div>
    )
}

export default ResetPassword
