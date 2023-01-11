const models = require('../models');
const crypto = require('crypto'); //추가됐음
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

const makePassword = ( (inputPassword)=>{
    const saltRounds = 10; // salt 돌리는 횟수
    console.log("9999999999999991->", inputPassword);
    bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) return err;
        bcrypt.hash(inputPassword, salt, function (err, hashedPassword) {

            console.log("9999999999999992->", inputPassword, hashedPassword);

            if (err) return err;
            inputPassword = hashedPassword; // 에러없이 성공하면 비밀번호의 Plain Text를 hashedPassword로 교체해줌
            return inputPassword;
        })
    })

})

const comparePassword = ((userid,userpass,Password) =>{

    bcrypt.compare(Password, userpass, (err, result) => {
        if (result) {
            return true;
        }

        console.log(err);
        return false;
    });

})


const hashPassword = async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

const validatePassword = async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}


module.exports = {makePassword, comparePassword,hashPassword, validatePassword};

