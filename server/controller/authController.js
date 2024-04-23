const express = require('express');
const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {sendMail} = require('../utility/nodemailer')

// signup function
module.exports.signup = async function signup(req, res){
    try{
        const { name, email, password, confirmPassword, role, profileImage} = req.body;
        if (password != confirmPassword) {
            return res.status(400).json({ message: "Password and confirmPassword do not match" });
        }        

        const encryptedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({ name, email, password: encryptedPassword, role, profileImage })
        // sendMail('signup', user);
        if(user){
            return res.json({
                message : "user signed up",
                data : user
            })
        }
        else{
            res.json({
                message : "err on signup"
            })
        }
    }
    catch(err){
        res.json({
            message : err.message
        })
    }
}

// login check function
module.exports.login = async function login(req,res){
    try{
        let data = req.body;
        if(data.email){
            let user = await userModel.findOne({ email : data.email });
            if(user){
                const doesPasswordMatch = await bcrypt.compare(data.password, user.password)
                if(doesPasswordMatch){
                    const token = jwt.sign({user : user['_id']}, process.env.JWT_PRIVATE_KEY, { expiresIn: '7d' })
                    res.cookie('login',token, {httpOnly:true});
                    return res.status(201).json({
                        message:"logged in successfully",
                        name : user.name,
                        Cookies : token,
                    });
                }
                else{
                    return res.status(401).json({
                        message:"wrong credentials",
                    });
                }
            }
            else{
                return res.status(401).json({
                    message:"user not found",
                });
            }
        }
        else{
            return res.status(401).json({
                message:"plz enter ur mail Id",
            });
        }
    } 
    catch(err){
        return res.status(401).json({
            message:err.mesage,
        });
    } 
}

// isAuthorised -> to check roles
module.exports.isAuthorised = async function isAuthorised(roles) { // Add roles parameter
    return async function(req, res, next) { // Return a function that accepts req, res, next
        const token = req.login;
        if (token) {
            const userId = jwt.verify(token, process.env.JWT_PRIVATE_KEY)
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(401).json({
                    message: "Invalid token"
                })
            }
            req.role = user.role;
            req.id = user.id;
            console.log(req.role);
            if (roles.includes(req.role)) { // Check if user's role is in the array of roles
                next();
            } else {
                res.status(401).json({
                    message: 'Unauthorized access'
                })
            }
        } else {
            res.status(401).json({
                message: 'Unauthorized access'
            })
        }
    }
}


// protect route
module.exports.protectRoute = async function protectRoute(req,res,next){
    try{
        if(req.login){
            const token = req.login;
            if(token){
                const userId = jwt.verify(token, process.env.JWT_PRIVATE_KEY)
                const user = await userModel.findById(userId);
                if(!user){
                    return res.status(401).json({
                        message : "invalid token"
                    })
                }
                req.role = user.role;
                req.id = user.id;
                console.log(req.role);
                next();
            }
            else{
                return res.status(401).json({
                    message:'please login'
                })
            }
        }
        else{
            let client = req.get("User-Agent");
            if(client.includes("mozilla") == true){
                return res.redirect('/login');
            }
            return res.json({
                message:"Operation not allowed"
            });
        }
    }
    catch(err){
        return res.json({
            message:err.message,
        });
    }
}

//forgetPassword
module.exports.forgetpassword = async function forgetpassword(req, res) {
    let { email } = req.body;
    try {
        const user = await userModel.findOne({ email: email });
        if (user) {
            //createResetToken is used to create a new token
            const resetToken = user.createResetToken();
            await user.save();

            // http://abc.com/resetpassword/resetToken
            const host = req.headers.origin;
            let resetPasswordLink = `${host}/resetpassword/${resetToken}`;
            console.log(resetPasswordLink);
            
            //send email to the user
            let obj = {
                resetPasswordLink : resetPasswordLink,
                email : email,
                name : user.name
            }
            sendMail('resetpassword',obj);
            return res.status(201).json({
                message:"reset link sent",
            })
        } 
        else {
            return res.status(500).json({
                mesage: "please signup",
            });
        }
    } 
    catch (err) {
      res.status(500).json({
        mesage: err.message,
      });
    }
};

// reset password
module.exports.resetpassword = async function resetpassword(req, res) {
    try {
      const token = req.params.token;
      console.log(token);
      let { password, confirmPassword } = req.body;
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Password and confirmPassword do not match" });
      }
      const user = await userModel.findOne({ resetToken: token });
      if (user) {
        //resetPasswordHandler will update user's password in db
        await user.resetPasswordHandler(password, confirmPassword);
        await user.save();
        res.status(201).json({
          message: "password changed succesfully, please login again",
        });
      } 
      else {
        res.status(404).json({
          message: "user not found",
        });
      }
    } 
    catch (err) {
      res.json({
        message: err.message,
      });
    }
};

// logout user
module.exports.logout = function logout(req,res){
    res.clearCookie('login');
    // res.cookie('login', ' ', {maxAge:0});
    res.json({
        message : 'user logged out Succesfully'
    })
}
  
  