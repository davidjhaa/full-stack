import React, { useState, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useHistory } from 'react-router';
const apiUrl = process.env.REACT_APP_API_URL;


export const AuthContext = React.createContext();
//custom hook that allows components to access context data
export function useAuth() {
    return useContext(AuthContext)
}

function AuthProvider({ children }) {
    const history = useHistory();
    const [user, setUser] = useState("");
    const [loading, setLoading] = useState(false);

    async function signUp(name,email,password,confirmPassword) {
        setLoading(true);
        try {
            await axios.post(`${apiUrl}/user/signup`, {
                name: name,
                email: email,
                password: password,
                confirmPassword: confirmPassword
            });
            setLoading(false);
            history.push("/login");
        } 
        catch (error) {
            console.error('Sign up failed:', error);
            setLoading(false);
        }
    }

    async function login(email, password) {
        try {
            const response = await axios.post(`${apiUrl}/user/login`, {
                email: email,
                password: password
            });
            if (response.status >= 200 && response.status < 300) {
                Cookies.set('login', response.data.Cookies, { expires: 7 });
                localStorage.setItem("user" , response.data.name);
                setUser(response.data.name)
                console.log("response", response.data);
            } 
            else {
                console.log("Request failed with status:", response.status);
            }

            setUser(response.data.name); 
            history.push("/")            
        }
        catch (err) {
            console.log(err);
        }
    }

    async function logout() {
        try{
            await axios.post(`${apiUrl}/user/logout`)
            localStorage.removeItem('user');
            Cookies.remove('login');
            window.location.reload();
            setUser(null);
        }
        catch(err){
            console.error('Logout failed: ', err);
        }
        
    }


    // useEffect( () => {
    //     let data = Cookies.get('login');
    //     const storedUser = localStorage.getItem("user");
    //     if (data && storedUser) {
    //         console.log(user);
    //         setUser(storedUser);
    //         history.push("/");
    //     } else {
    //         setUser(null);
    //     }
    // }, [])

    const value = {
        user,
        setUser,
        login,
        signUp,
        logout
    }

    return (
        < AuthContext.Provider value={value} >
            {!loading && children}
        </AuthContext.Provider >
    )
}

export default AuthProvider


