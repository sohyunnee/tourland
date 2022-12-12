const express = require('express');
const router = express.Router();
const sequelize = require("sequelize");
const Op = sequelize.Op;
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');

const models = require("../../models");
const fs = require('fs');
const querystring = require('querystring');
const crypto = require('crypto'); //추가됐음
const {getPagingData, getPagination} = require('../../controller/pagination');
const {makePassword, comparePassword} = require('../../controller/passwordCheckUtil');


router.get('/', async (req, res, next) => {

    const currentProductPrice = {};
    const currentProductPrice2 = {};
    const currentProduct ={};
    const currentProduct2 ={};

    const popup1 = await models.popup.findOne({
        raw: true,
        where : {
            position : "R"
        }
    });

    console.log("pppp ->", popup1);
    const startDate = new Date(popup1.enddate) - new Date(popup1.startdate);
    const endDate = Math.abs(startDate/(24*60*60*1000));

    console.log("startdate->", startDate);
    console.log("enddate->", endDate);

    const cookieConfig = {
        expires: new Date(Date.now() + endDate*24*60*60),
        path: '/',
        signed: true
    };
    res.cookie("popup1", popup1.pic, cookieConfig)

    const popup2 = await models.popup.findOne({
        raw: true,
        where : {
            position : "L"
        }
    });

    const startDate2 = new Date(popup2.enddate) - new Date(popup2.startdate);
    const endDate2 = Math.abs(startDate2/(24*60*60*1000));

    const cookieConfig2 = {
        expires: new Date(Date.now() + endDate2*24*60*60),
        path : '/',
        signed: true,
    };
    res.cookie("popup2", popup2.pic, cookieConfig2)


    const banner1 = await models.banner.findOne({
        raw: true,
        where : {
            position : "L"
        }
    });
    const banner2 = await models.banner.findOne({
        raw: true,
        where : {
            position : "R"
        }
    });
    const Auth = {};
    const login = {};
    const Manager = {};
    const searchkeyword = {};


    res.render('tourlandMain', {
        currentProductPrice,
        currentProductPrice2,
        currentProduct,
        currentProduct2,
        popup1:popup1,
        popup2,
        banner1,
        banner2,
        Auth,
        login,
        Manager,
        searchkeyword
    });

});


router.get('/tourlandRegister', function (req, res, next) {

    let autoNo = "";
    let Auth ={};
    let login = "";
    let Manager = {};
    let searchkeyword = {};

    let userVO = {};




    res.render("user/tourlandRegisterForm",  {autoNo, Auth,login, Manager, searchkeyword,userVO});
});

router.post('/tourlandRegister', async (req,res,next)=> {
    let query;
    console.log("register->", req.body);

    // Check if the email is already in use
    let userExists = await models.user.findOne({
        raw: true,
        where : {
            userid: req.body.userid
        }
    });

    if (userExists) {
        res.status(401).json({ message: "Email is already in use." });
        return;
    }

    // Define salt rounds
    const saltRounds = 10;
    // Hash password
    bcrypt.hash(req.body.userpass, saltRounds, (err, hash) => {
        if (err) throw new Error("Internal Server Error");

        req.body.userpass = hash;

        const user = models.user.create(req.body);
        query = querystring.stringify({
            "registerSuccess": true,
            "id": user.userid
        });
        res.redirect('/customer/loginForm/?'+query);
    });

});


router.get('/idCheck/:userid', async (req,res,next)=> {

    const userid = req.params.userid;

    try{
        let checkUserid = await models.user.findOne({
            raw: true,
            attributes : ['userid'],
            where : {
                userid : userid
            }
        })

        if( checkUserid != null)
        {
            console.log("check->", checkUserid.userid);
            if( checkUserid.userid != null) {
                res.status(200).send("exist");
            }
        }
        else{
            res.status(200).send("notexist");
        }
    }
    catch (e){
        console.error(e);
        next(e);
    }

});



router.get('/loginForm', async (req,res,next)=> {
    let { registerSuccess, id} = req.query;

    let UserStay = {userid:id};

    let EmpStay = {};
    let error = "";
    let Auth ={};
    let login ="";
    let Manager = {};
    let searchkeyword = "";


    res.render("user/tourlandLoginForm", {Auth,login, Manager,searchkeyword, registerSuccess, UserStay, EmpStay, error});
});



router.post('/loginForm', async (req,res,next)=> {
    let { id, pass} = req.body;
    if(id == null) res.status(400).send('idempty');
    if(pass == null) res.status(400).send('passempty');


    if( id !== null && pass !=null){
        // ID,PASS가 입력된 경우
        let userVO = await  models.user.findOne({
            raw : true,
            // attributes: ['userid', 'userpass','usersecess'],
            where : {
                userid : id
            }
        })

        // 직원 ID가 없는 경우
        if(userVO.userid == null){
            return res.status(402).send("idnoneexist");
        }else{

            // 직원 ID가 있고 탈퇴한 회원
            if(userVO.usersecess === 1){
                return res.status(402).send("retiredcustomer");
            }else if(userVO.usersecess === 0){

                // Compare passwords
                bcrypt.compare(pass, userVO.userpass, (err, result) => {
                    console.log("comparePassword2222->",result);
                    if (result) {
                        return res.redirect('/tourlandMain?');
                    }

                    console.log(err);
                    return res.status(401).json({ message: "Invalid Credentials" });
                })

            }
            else{
                return res.status(405).send("error----");
            }

        }

    }
    else{
        return res.redirect('/tourlandLoginForm');
    }

    let empVO ={};
    let session = {};

    let registerSuccess = {};
    let UserStay = {};
    let EmpStay = {};
    let error = "";
    let Auth ={};
    let login ="";
    let Manager = {};
    let searchkeyword = "";

    return res.render("user/tourlandLoginForm", {Auth,login, Manager,searchkeyword, registerSuccess, UserStay, EmpStay, error});
});


module.exports = router;
