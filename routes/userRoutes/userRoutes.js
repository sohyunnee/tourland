const express = require('express');
const router = express.Router();
const sequelize = require("sequelize");
const Serializer = require('sequelize-to-json')
const Op = sequelize.Op;
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const {QueryTypes, where} = require("sequelize");
const moment = require("moment");
let {userAuth}= require("../../controller/userData");

const {sessionCheck, sessionEmpCheck} = require('../../controller/sessionCtl');


const models = require("../../models/index");
const {
    product,
    airplane,
    tour,
    hotel,
    rentcar,
    pairstatus,
    ptourstatus,
    photelstatus,
    prentstatus
} = require('../../models/index');

const fs = require('fs');
const querystring = require('querystring');
const crypto = require('crypto'); //추가됐음
const {getPagingData, getPagingDataCount, getPagination} = require('../../controller/pagination');
const {makePassword, comparePassword} = require('../../controller/passwordCheckUtil');
const {fixed} = require("lodash/fp/_falseOptions");
const path = require("path");
const bodyParser = require('body-parser');
const parser = bodyParser.urlencoded({extended: false});
const {upload} = require("../../controller/fileupload");



// 투어랜드 메인 페이지
router.get('/', async (req, res, next) => {

    const currentProductPrice = {};
    const currentProductPrice2 = {};
    const currentProduct = {};
    const currentProduct2 = {};

    const popup1 = await models.popup.findOne({
        raw: true,
        where: {
            position: "R"
        }
    });

    const startDate = new Date(popup1.enddate) - new Date(popup1.startdate);
    const endDate = Math.abs(startDate / (24 * 60 * 60 * 1000));

    // console.log("startdate->", startDate);
    // console.log("enddate->", endDate);

    const cookieConfig = {
        expires: new Date(Date.now() + endDate * 24 * 60 * 60),
        path: '/',
        signed: true
    };
    res.cookie("popup1", popup1.pic, cookieConfig)

    const popup2 = await models.popup.findOne({
        raw: true,
        where: {
            position: "L"
        }
    });

    const startDate2 = new Date(popup2.enddate) - new Date(popup2.startdate);
    const endDate2 = Math.abs(startDate2 / (24 * 60 * 60 * 1000));

    const cookieConfig2 = {
        expires: new Date(Date.now() + endDate2 * 24 * 60 * 60),
        path: '/',
        signed: true,
    };
    res.cookie("popup2", popup2.pic, cookieConfig2)


    const banner1 = await models.banner.findOne({
        raw: true,
        where: {
            position: "L"
        }
    });
    const banner2 = await models.banner.findOne({
        raw: true,
        where: {
            position: "R"
        }
    });

    let msg = `세션이 존재하지 않습니다.`

    // if (req.userAuth) {
    //     msg = `${req.userAuth.username}`;
    //     if(userAuth != null){
    //         userAuth = {
    //             role : req.userAuth.role,
    //             username: req.userAuth,username,
    //         };
    //     }
    // }


    let {searchType, keyword, keyword2} = req.query;
    let searchkeyword = keyword;
    if (req.session.user) {
        userAuth = req.session.user;
    }


    res.render('tourlandMain', {
        currentProductPrice,
        currentProductPrice2,
        currentProduct,
        currentProduct2,
        popup1: popup1,
        popup2,
        banner1,
        banner2,
        searchkeyword,
        userAuth
    });

});

// 회원가입
router.get('/tourlandRegister', function (req, res, next) {
    if (req.session.user) {
        userAuth = req.session.user;
    }
    let autoNo = "";

    let userVO = {};

    let Auth = null;
    let login = "";

    let msg = `세션이 존재하지 않습니다.`
    if (req.session.user) {
        const userAuth = req.session.user.userAuth;
    }

    console.log("Auth->", Auth, msg);

    let Manager = {};
    let {searchType, keyword, keyword2} = req.query;
    let searchkeyword = keyword;


    res.render("user/tourlandRegisterForm", {autoNo, Auth, login, Manager, searchkeyword, userVO});
});
// 회원가입 전송
router.post('/tourlandRegister', async (req, res, next) => {
    let query;
    console.log("register->", req.body);

    // Check if the email is already in use
    let userExists = await models.user.findOne({
        raw: true,
        where: {
            userid: req.body.userid
        }
    });

    if (userExists) {
        res.status(401).json({message: "Email is already in use."});
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
        res.redirect('/customer/loginForm/?' + query);
    });

});

// id check
router.get('/idCheck/:userid', async (req, res, next) => {

    const userid = req.params.userid;

    try {
        let checkUserid = await models.user.findOne({
            raw: true,
            attributes: ['userid'],
            where: {
                userid: userid
            }
        })

        if (checkUserid != null) {
            console.log("check->", checkUserid.userid);
            if (checkUserid.userid != null) {
                res.status(200).send("exist");
            }
        } else {
            res.status(200).send("notexist");
        }
    } catch (e) {
        console.error(e);
        next(e);
    }

});

// 회원의 비밀번호 확인
router.post('/EditPasswordCheck', async (req, res, next) => {

        const {userid, checkPass} = req.body;

        try {
            let checkUserid = await models.user.findOne({
                raw: true,
                attributes: ['userid', 'userpass'],
                where: {
                    userid: userid
                }
            });

            if (checkUserid) {
                bcrypt.compare(checkPass, checkUserid.userpass, (err, result) => {

                    res.status(201).json("Pass");

                });
            } else {
                res.status(301).json("NoPass");

            }
        } catch
            (e) {
            console.error(e);
            next(e);
        }

    }
)
;

// 관리자의 비밀번호 확인
router.post('/EditPasswordCheck1', async (req, res, next) => {

        const {empid, checkPass} = req.body;

        try {
            let checkEmpid = await models.employee.findOne({
                raw: true,
                attributes: ['empid', 'emppass'],
                where: {
                    empid: empid
                }
            });

            if (checkEmpid) {
                bcrypt.compare(checkPass, checkEmpid.emppass, (err, result) => {

                    res.status(201).json("Pass");

                });
            } else {
                res.status(301).json("NoPass");

            }
        } catch
            (e) {
            console.error(e);
            next(e);
        }

    }
)
;

// // 로그인 폼
// router.get('/loginForm', async (req, res, next) => {
//     console.log("3333333333->", req.session.user);
//
//     let {Auth, Manager, login} = sessionCheck(req, res);
//     let {registerSuccess, id} = req.query;
//     let UserStay = {userid: id};
//
//     let EmpStay = {};
//     let error = "";인
//     let searchkeyword = "";
//
//
//     res.render("user/tourlandLoginForm", {
//         Auth,
//         login,
//         Manager,
//         searchkeyword,
//         registerSuccess,
//         UserStay,
//         EmpStay,
//         error
//     });
// });

// 매니저 인 폼
router.get('/loginManagerForm', async (req, res, next) => {

    let {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);

    let {registerSuccess, id} = req.query;
    let EmpStay = {empid: id};
    let UserStay = {};
    let error = "";
    let searchkeyword = "";


    res.render("user/tourlandLoginManagerForm", {
        Auth,
        AuthEmp,
        login,
        Manager,
        searchkeyword,
        UserStay,
        registerSuccess,
        EmpStay,
        error
    });
});


const fetchData = async (req) => {
    let {id, pass} = req.body;
    let error = "";

    if (id == null) {
        error = 'idempty';
    }
    if (pass == null) {
        error = 'passempty';
    }

    let userVO;
    try {
        if (id !== null && pass != null) {
            // ID,PASS가 입력된 경우
            userVO = await models.user.findOne({
                raw: true,
                // attributes: ['userid', 'userpass','usersecess'],
                where: {
                    userid: id
                }
            })
        }

    } catch (e) {
        console.log(e);
    }

    return userVO;

}


const fetchEmpData = async (req) => {
    let {id, pass} = req.body;
    let error = "";

    if (id == null) {
        error = 'idempty';
    }
    if (pass == null) {
        error = 'passempty';
    }

    let empVO;
    try {
        if (id !== null && pass != null) {
            // ID,PASS가 입력된 경우
            empVO = await models.employee.findOne({
                raw: true,
                // attributes: ['userid', 'userpass','usersecess'],
                where: {
                    empid: id
                }
            })
        }

    } catch (e) {
        console.log(e);
    }

    return empVO;

}

// // 로그인 전송
// router.post('/loginForm', (req, res, next) => {
//     let {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);
//
//
//     let {id, pass} = req.body;
//
//     let empVO = {};
//     let session = {};
//
//     let registerSuccess = {};
//     let UserStay;
//     let EmpStay = {};
//     let error = "";
//     let searchkeyword = "";
//     let loginSuccess = false;
//
//     fetchData(req).then((userVO) => {
//         console.log("11111111111111111111111->",userVO);
//         // 직원 ID가 없는 경우
//         if (userVO == null) {
//             error = "idnoneexist";
//             res.status(405).json({"responseText":error});
//             console.log("2222222222222->",userVO);
//         } else {
//
//             // 직원 ID가 있고 탈퇴한 회원
//             if (userVO.usersecess === 1) {
//                 error = "retiredcustomer";
//                 res.status(405).json({"responseText":error});
//
//             } else if (userVO.usersecess === 0) {
//
//                 bcrypt.compare(req.body.pass, userVO.userpass, (err, result) => {
//                     UserStay = userVO;
//                     if (result) {
//                         loginSuccess = true;
//
//                         req.session.user = {
//                             "User": userVO.username,
//                             "login": "user",
//                             "Auth": userVO,
//                             "pass": pass,
//                             "mypage": "mypageuser",
//                             "userid": id,
//                         }
//                         req.session.save();
//                         Auth = userVO;
//                         login = "user";
//
//                         console.log(`세션 저장 완료! `);
//                         res.status(200).json({"responseText":"loginsuccess"});
//                     } else {
//                         res.status(405).json({"responseText":err});
//                     }
//                 })
//
//             } else {
//                 error = "usernotfind";
//                 res.status(405).json({"responseText":error});
//             }
//
//         }
//
//     })
//
//
// });




// 매니저 로그인 전송
router.post('/loginManagerForm', (req, res, next) => {
    let {Auth, AuthEmp, Manager, login} = sessionEmpCheck(req, res);
    let {id, pass} = req.body;

    let registerSuccess = {};
    let UserStay = {};
    let EmpStay;
    let error = "";
    let searchkeyword = "";
    let loginSuccess = false;

    console.log("44444444->", id, pass);

    fetchEmpData(req).then((empVO) => {

        // 직원 ID가 없는 경우
        if (empVO.empid == null) {
            error = "idnoneexist";
        } else {

            // 직원 ID가 있고 탈퇴한 회원
            if (empVO.empretired === 1) {
                error = "retiredcustomer";
            } else if (empVO.empretired === 0) {
                console.log("111111111111111111111->", req.body.pass);
                bcrypt.compare(req.body.pass, empVO.emppass, (err, result) => {
                    console.log("comparePassword2222->", result);
                    EmpStay = empVO;
                    if (result) {
                        loginSuccess = true;

                        req.session.user = {
                            "User": empVO.empname,
                            "empid": id,
                            "login": "manager",
                            "Auth": null,
                            "AuthEmp": empVO,
                            "pass": pass,
                            "mypage": "mypageemp",
                            "Manager": {"name": empVO.empname, "right": 1},
                        }
                        req.session.save();
                        AuthEmp = empVO;
                        login = "manager";

                        console.log(`세션 저장 완료! `);
                        res.status(201).json({"responseText": 'loginsuccess'});
                    } else {
                        console.log("comparePassword5555555->", result);
                        error = "passnotequal";
                        res.json({"responseText": "loginfail"})
                    }
                })

            } else {
                error = "usernotfind";
            }

        }

    })


});

// // 로그아웃
// router.get("/logout", (req, res, next) => {
//
//     req.session.destroy();
//     // userAuth = {
//     //     id: "",
//     //     username: "",
//     //     userbirth: "",
//     //     usertel: "",
//     //     userpassport: "",
//     //     userid: "",
//     //     usersecess: "",
//     //     useremail: "",
//     //     useraddr: "",
//     //     postcode:"",
//     //     detailAddress:"",
//     //     extraAddress:"",
//     //     role: "customer",
//     //     accessToken: ""
//     // }
//     console.log(`session을 삭제하였습니다.`);
//     res.redirect("/customer");
// })

// KR 패키지 목록
router.get("/tourlandProductKRList", async (req, res, next) => {
    if (req.session.user) {
        userAuth = req.session.user;
    }
    console.log('-------userAuth-------', userAuth);

    let {ddate, rdate, cnt, searchType, keyword} = req.query;
    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);


    let searchQuery = "";

    if (ddate == "name") {
        searchQuery = `and pname like concat('%',<%=keyword%>,'%')`;
    }
    if (searchType == "expire") {
        searchQuery = `and pexpire like concat('%',<%=keyword%>,'%')`;
    }
    if (searchType == "userCart") {
        searchQuery = `and pname like concat('%',<%=keyword%>,'%')`;
    }
    if (searchType == "location") {
        if (keyword === "한국") {
            searchQuery = `and pname like '%제주%'`;
        }
        if (keyword === "일본") {
            searchQuery = `and pname like '%도쿄%'`;
        }
        if (keyword === "중국") {
            searchQuery = `and pname like '%베이징%'`;
        }
    }

    try {

        const list = await product.findAll({
            // raw : true,
            nest: true, attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'],
            include: [
                {
                    model: models.airplane,
                    attributes: ['price'],
                    as: 'airplaneId_airplanes',
                    nest: true,
                    paranoid: true,
                    required: false,
                },
                {
                    model: models.hotel,
                    attributes: ['checkin', 'checkout', 'price'],
                    as: 'hotelId_hotels',
                    nest: true,
                    paranoid: true,
                    required: false,
                },
                {
                    model: models.tour,
                    attributes: ['tprice'],
                    as: 'tourId_tours',
                    nest: true,
                    paranoid: true,
                    required: false,
                },
                {
                    model: models.rentcar,
                    as: 'rentcarId_rentcars',
                    nest: true,
                    paranoid: true,
                    required: false,
                },
            ],
            where: {
                pname: {
                    [Op.like]: "%" + '제주' + "%"
                }
                // id : 13

            },
            limit, offset
        });

        const countlist = await product.findAndCountAll({
            nest: true, attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'],
            where: {
                pname: {
                    [Op.like]: "%" + '제주' + "%"
                }
                // id : 13

            },
            limit, offset
        });
        const {count: totalItems, rows: tutorials} = countlist;
        const pagingData = getPagingDataCount(totalItems, currentPage, limit);


        // let list = [];
        let searchkeyword = "";
        let error = "";
        let cri = {};
        let idx = '';
        let tourDays = '';
        let date = '';
        let capa = '';


        if (list != null) {
            res.render("user/product/tourlandProductKRList", {
                userAuth,
                tourDays,
                date,
                capa,
                countlist,
                list,
                searchkeyword,
                error,
                pagingData,
                cri,
                idx
            });
        } else {
            res.status(202).send("notexist");
        }
    } catch (e) {
        console.error(e);
        next(e);
    }

})

// 패키지 제품 상세 리스트
router.get("/tourlandProductDetail/:pno", async (req, res, next) => {
    if (req.session.user) {
        userAuth = req.session.user;
    }
    console.log('-------userAuth-------', userAuth);
    const pno = req.params.pno;
    let {price, rdate, cnt, searchType, keyword} = req.query;

    try {

        const vo = await product.findOne({
            // raw : true,
            nest: true,
            attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic', 'pcapacity'],
            include: [
                {
                    model: models.airplane,
                    attributes: ['price', 'ddate', 'id'],
                    as: 'airplaneId_airplanes',
                    nest: true,
                    paranoid: true,
                    required: false,
                },
                {
                    model: models.hotel,
                    attributes: ['checkin', 'checkout', 'price', 'id', 'capacity', 'roomcapacity'],
                    as: 'hotelId_hotels',
                    nest: true,
                    paranoid: true,
                    required: false,
                },
                {
                    model: models.tour,
                    attributes: ['tprice', 'id', 'tname', 'capacity'],
                    as: 'tourId_tours',
                    nest: true,
                    paranoid: true,
                    required: false,
                },
                {
                    model: models.rentcar,
                    attributes: ['id'],
                    as: 'rentcarId_rentcars',
                    nest: true,
                    paranoid: true,
                    required: false,
                },
            ],
            where: {
                id: pno
            }
        });

        let searchkeyword = "";
        let error = "";
        let cri = {};
        let idx = '';
        let tourDays = '';
        let date = '';
        let capa = '';
        let count = '';


        if (vo != null) {
            res.render("user/product/tourlandProductDetail", {
                userAuth,
                searchkeyword,
                tourDays,
                date,
                capa,
                count,
                vo,
                error,
                cri,
                idx,
                moment
            });
        } else {
            res.status(202).send("notexist");
        }
    } catch (e) {
        console.error(e);
        next(e);
    }

});

// JP 패키지 목록

// KR 패키지 목록
router.get("/tourlandProductJPList", async (req, res, next) => {
    let {Auth, AuthEmp, Manager, login} = sessionCheck(req, res);
    const userid = req.params.userid;
    let {ddate, rdate, cnt, searchType, keyword} = req.query;
    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);


    let searchQuery = "";

    if (ddate == "name") {
        searchQuery = `and pname like concat('%',<%=keyword%>,'%')`;
    }
    if (searchType == "expire") {
        searchQuery = `and pexpire like concat('%',<%=keyword%>,'%')`;
    }
    if (searchType == "userCart") {
        searchQuery = `and pname like concat('%',<%=keyword%>,'%')`;
    }
    if (searchType == "location") {
        if (keyword === "한국") {
            searchQuery = `and pname like '%제주%'`;
        }
        if (keyword === "일본") {
            searchQuery = `and pname like '%도쿄%'`;
        }
        if (keyword === "중국") {
            searchQuery = `and pname like '%베이징%'`;
        }
    }

    try {

        const list = await product.findAll({
            // raw : true,
            nest: true, attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'],
            include: [
                {
                    model: models.airplane,
                    attributes: ['price'],
                    as: 'airplaneId_airplanes',
                    nest: true,
                    paranoid: true,
                    required: false,
                },
                {
                    model: models.hotel,
                    attributes: ['checkin', 'checkout', 'price'],
                    as: 'hotelId_hotels',
                    nest: true,
                    paranoid: true,
                    required: false,
                },
                {
                    model: models.tour,
                    attributes: ['tprice'],
                    as: 'tourId_tours',
                    nest: true,
                    paranoid: true,
                    required: false,
                },
                {
                    model: models.rentcar,
                    as: 'rentcarId_rentcars',
                    nest: true,
                    paranoid: true,
                    required: false,
                },
            ],
            where: {
                pname: {
                    [Op.like]: "%" + '도쿄' + "%"
                }
                // id : 13

            },
            limit, offset
        });

        const countlist = await product.findAndCountAll({
            nest: true, attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'],
            where: {
                pname: {
                    [Op.like]: "%" + '도쿄' + "%"
                }
                // id : 13

            },
            limit, offset
        });
        const {count: totalItems, rows: tutorials} = countlist;
        const pagingData = getPagingDataCount(totalItems, currentPage, limit);


        // let list = [];
        let searchkeyword = "";
        let error = "";
        let cri = {};
        let idx = '';
        let tourDays = '';
        let date = '';
        let capa = '';


        if (list != null) {
            res.render("user/product/tourlandProductKRList", {
                Auth,
                AuthEmp,
                login,
                tourDays,
                date,
                capa,
                countlist,
                list,
                Manager,
                searchkeyword,
                error,
                pagingData,
                cri,
                idx
            });
        } else {
            res.status(202).send("notexist");
        }
    } catch (e) {
        console.error(e);
        next(e);
    }

})

// 패키지 제품 후기
router.get("/tourlandProductDetail/tourlandProductReview/:pno", async (req, res, next) => {
    let {Auth, AuthEmp, Manager, login} = sessionCheck(req, res);
    const pno = req.params.pno;
    let {price, rdate, cnt, searchType, keyword} = req.query;


    try {

        const vo = await product.findOne({
            // raw : true,
            nest: true,
            attributes: ['id', 'pname', 'pcontent', 'pexpire', 'pprice', 'ppic'],
            include: [
                {
                    model: models.airplane,
                    attributes: ['price'],
                    as: 'airplaneId_airplanes',
                    nest: true,
                    paranoid: true,
                    required: false,
                },
                {
                    model: models.hotel,
                    attributes: ['checkin', 'checkout', 'price'],
                    as: 'hotelId_hotels',
                    nest: true,
                    paranoid: true,
                    required: false,
                },
                {
                    model: models.tour,
                    attributes: ['tprice'],
                    as: 'tourId_tours',
                    nest: true,
                    paranoid: true,
                    required: false,
                },
                {
                    model: models.rentcar,
                    as: 'rentcarId_rentcars',
                    nest: true,
                    paranoid: true,
                    required: false,
                },
            ],
            where: {
                id: pno
            }
        });
        // console.log(vo.pprice);
        const list = await models.review.findAll({
            // raw : true,
            nest: true,
            attributes: ["no", "rno", "pno", "userno", "regdate", "starpoint", "reviewTitle", "reviewContent"],
            include: [
                {
                    model: models.user,
                    as: 'userno_user',
                    nest: true,
                    paranoid: true,
                    required: false,
                },
            ],
            where: {
                pno: pno
            }
        });

        console.log("000000-", list);

        let searchkeyword = "";
        let error = "";
        let cri = {};
        let idx = '';
        let tourDays = '';
        let date = '';
        let capa = '';
        let count = '';

        console.log("333333->", vo.pprice);


        if (vo != null) {
            res.render("user/product/tourlandProductReview", {
                Auth,
                login,
                Manager,
                searchkeyword,
                tourDays,
                date,
                capa,
                count,
                vo,
                list,
                error,
                cri,
                idx,
                moment,
            });
        } else {
            res.status(202).send("notexist");
        }
    } catch (e) {
        console.error(e);
        next(e);
    }

});

// 비밀번호 변경
router.get("/EditPassword", (req, res, next) => {

    let {empid, checkPass, userid} = req.body;
    let {searchType, keyword, searchkeyword} = req.query;

    console.log(req.session.user);
    try {
        if (req.session.user) {
            Auth = { // 비밀번호 변경하면 Auth에 아래 정보 들어감
                userid: req.session.user.Auth.userid,
                empid: req.session.user.Auth.empid
            };
            mypage = req.session.user.mypage;
            login = req.session.user.login;
        }
        if (req.session.user) {
            res.render("user/mypage/tourlandMyInfoEditPassword", {
                Auth,
                login,
                mypage,
                searchType,
                searchkeyword,
                keyword
            });
        } else {
            res.status(202).send("notexist");
        }
    } catch (e) {
        console.error(e);
        next(e);
    }

});

// 마이 페이지
router.get("/tourlandMyInfoEdit", (req, res, next) => {

    let {
        userid,
        userno,
        userpass,
        username,
        userbirth,
        useraddr,
        usertel,
        userpassport,
        empno,
        empid,
        emppass,
        empname,
        empbirth,
        empaddr,
        emptel
    } = req.body;
    let {searchType, keyword, searchkeyword} = req.query;

    console.log(req.session.user);
    try {
        let success = {};
        if (req.session.user) {
            Auth = {
                userid: req.session.user.Auth.userid,
                empid: req.session.user.Auth.empid,
                id: req.session.user.Auth.id,
                empno: req.session.user.Auth.empno,
                username: req.session.user.Auth.username,
                empname: req.session.user.Auth.empname,
                userbirth: req.session.user.Auth.userbirth,
                empbirth: req.session.user.Auth.empbirth,
                useraddr: req.session.user.Auth.useraddr,
                empaddr: req.session.user.Auth.empaddr,
                usertel: req.session.user.Auth.usertel,
                emptel: req.session.user.Auth.emptel
            };
            mypage = req.session.user.mypage;
            login = req.session.user.login;
            pass = req.session.user.pass;
        }
        if (req.session.user) {
            res.render("user/mypage/tourlandMyInfoEdit", {
                Auth,
                login,
                mypage,
                searchType,
                searchkeyword,
                keyword,
                pass,
                success
            });
        } else {
            res.status(202).send("notexist");
        }
    } catch (e) {
        console.error(e);
        next(e);
    }


});


// 마이 페이지 전송
router.post("/editProfile", async (req, res, next) => {


    const saltRounds = 10;
    // Hash password
    bcrypt.hash(req.body.userpass, saltRounds, (err, hash) => {
        if (err) throw new Error("Internal Server Error");

        const update = models.user.update({
                userid: req.body.userid,
                useraddr: req.body.useraddr,
                username: req.body.username,
                userbirth: req.body.userbirth,
                usertel: req.body.usertel,
                userpassport: req.body.userpassport,
                userpass: hash
            },
            {
                where: {id: req.body.id}
            }
        );

        if (update != null) {
            res.status(203).json({"responseText": "modifysuccess"});

        } else {
            res.status(303).json({"responseText": "modifyfaild"});
        }
    });

});

// 회원탈퇴
router.post("/logoutWithdrawal", async (req, res, next) => {
    let {id} = req.body.id;
    const update = models.user.update({
        usersecess: 1
    }, {
        where: {id: req.body.id}
    });

    if (update != null) {
        res.status(203).json({"responseText": "modifysuccess"});

    } else {
        res.status(303).json({"responseText": "modifyfaild"});
    }

    console.log(req.session);
    req.session.destroy();
    Auth = {}; // 로그아웃 하면 Auth 안에 담긴 정보 초기화
    res.redirect("/customer");

});

// 나의 쿠폰
router.get('/tourlandMyCoupon', async (req, res, next) => {

    const available = await models.coupon.findAll({
        // raw : true,
        nest: true,
        attributes: ['cno', 'cname', 'pdate', 'edate', 'ccontent', 'mrate'],
        where: {}
    });
    res.render("user/mypage/tourlandMyCoupon", {available});
});


// 공지사항 전체 목록
router.get("/tourlandBoardNotice", async (req, res, next) => {
    if (req.session.user) {
        userAuth = req.session.user;
    }
    console.log('-----------userAuth-------', userAuth);

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";


    let cri = {currentPage};

    let noticeFixedList =
        await models.notice.findAll({
            raw: true,
            where: {
                fixed: 1
            },
            limit, offset
        });
    console.log('====', noticeFixedList);

    let noticeNoFixedList =
        await models.notice.findAll({
            raw: true,
            where: {
                fixed: 0
            },
            order: [
                ["regdate", "DESC"]
            ],
            limit, offset
        });

    let noticeNoFixedCountList =
        await models.notice.findAndCountAll({
            raw: true,
            where: {
                fixed: 0
            },
            order: [
                ["regdate", "DESC"]
            ],
            limit, offset
        });

    const pagingData = getPagingData(noticeNoFixedCountList, currentPage, limit);
    console.log('---------', noticeNoFixedList);

    // userHeader에 들어갈거
    let searchkeyword = "";

    res.render("user/board/tourlandBoardNotice", {
        noticeFixedList,
        noticeNoFixedList,
        cri,
        userAuth,
        searchkeyword,
        pagingData
    });
});

// 공지사항 게시글 읽기
router.get("/tourlandBoardNoticeDetail", async (req, res, next) => {
    let notice =
        await models.notice.findOne({
            raw: true,
            where: {
                no: req.query.no
            }
        });
    console.log(notice);
    console.log(req.query);
    // notice 테이블에 있는 자료중 1개만갖고오기


    // userHeader에 들어갈거
    let searchkeyword = "";
    if (req.session.user) {
        userAuth = req.session.user;
    }

    res.render("user/board/tourlandBoardNoticeDetail", {notice, userAuth, searchkeyword});
});

// FAQ 전체 목록
router.get('/tourlandBoardFAQ', async (req, res, next) => {

    const usersecess = req.params.usersecess;
    let {searchType, keyword} = req.query;

    const contentSize = 8 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    const list =
        await models.faq.findAll({
            raw: true,
            order: [
                ["no", "DESC"]
            ],
            limit, offset
        });
    const listCount =
        await models.faq.findAndCountAll({
            raw: true,
            order: [
                ["no", "DESC"]
            ],
            limit, offset
        });

    console.log('======데이터 전체 count 수=======', listCount.count);
    const pagingData = getPagingData(listCount, currentPage, limit);
    console.log('--------한 페이지에 나오는 데이터-', listCount);

    const cri = {};


    // userHeader 에서 필요한 변수들
    let searchkeyword = "";
    if (req.session.user) {
        userAuth = req.session.user;
    }


    res.render('user/board/tourlandBoardFAQ', {list, cri, pagingData, userAuth, searchkeyword});
})

//-------------------------------------상품 문의 사항 상품 문의 사항 상품 문의 사항 상품 문의 사항 상품 문의 사항 상품 문의 사항 --------------------------------------------------
// 상품 문의 사항
router.get('/tourlandPlanBoard', async (req, res, next) => {

    const contentSize = 8 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);


    const list =
        await models.planboard.findAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });
    const listCount =
        await models.planboard.findAndCountAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });

    console.log('======데이터 전체 count 수=======', listCount.count);
    const pagingData = getPagingData(listCount, currentPage, limit);
    console.log('--------한 페이지에 나오는 데이터-', listCount);

    const cri = {currentPage};
    const pageMaker = {};
    console.log('-----------현재페이지=------', currentPage);

    // userHeader 에서 필요한 변수들
    let searchkeyword = "";
    if (req.session.user) {
        userAuth = req.session.user;
    }


    res.render('user/board/tourlandPlanBoard', {
        list,
        cri,
        pagingData,
        userAuth,
        searchkeyword,
        pageMaker
    });
})

// 상품 문의 사항 글 눌러서 보기
router.get('/tourlandPlanBoardDetail', async (req, res, next) => {

    console.log('=---쿼리추출---', req.query);

    let plan =
        await models.planboard.findOne({
            raw: true,
            where: {
                id: req.query.id
            }
        });
    console.log('----게시글보기====', plan);
    let cri = {};

    // userHeader 에서 필요한 변수들
    let searchkeyword = "";
    if (req.session.user) {
        userAuth = req.session.user;
    }

    res.render('user/board/tourlandPlanBoardDetail', {plan, userAuth, searchkeyword, cri});
})

// 상품 문의사항 글 등록하는 화면임
router.get('/tourlandPlanBoardRegister', (req, res, next) => {

    // userHeader 에서 필요한 변수들
    if (req.session.user) {
        userAuth = req.session.user;
    }
    let searchkeyword = "";
    let mypage = {};
    if (userAuth.role === 'customer') {
        return res.redirect('/loginForm')
    } else if (userAuth.role === 'basic') {
        mypage = "mypageuser"
    } else if (userAuth.role === 'admin') {
        mypage = "mypageemp"
    }

    res.render('user/board/tourlandPlanBoardRegister', {mypage, userAuth, searchkeyword});
})

// 상품 문의 사항 등록하기
router.post('/tourlandPlanBoardRegister', async (req, res, next) => {
// userHeader 에서 필요한 변수들
    if (req.session.user) {
        userAuth = req.session.user;
    }
    let searchkeyword = "";

    let mypage = {};
    if (userAuth.role === 'customer') {
        return res.redirect('/loginForm')
    } else if (userAuth.role === 'basic') {
        mypage = "mypageuser"
    } else if (userAuth.role === 'admin') {
        mypage = "mypageemp"
    }

    const PlanRegister = await models.planboard.create({
        raw: true,
        title: req.body.title,
        content: req.body.content,
        writer: req.body.writer,
        regdate: req.body.regdate,
        answer: 0,

    });
    console.log('------------------게시글 등록-----------------', PlanRegister);

// ------------------상품 문의 등록하면 게시판 목록 보여줘야하므로 list값도 같이 전송해서 게시판 목록 다시 불러오기 -----------------------------------
    const contentSize = 5 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    const list =
        await models.planboard.findAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });
    const listCount =
        await models.planboard.findAndCountAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });
    console.log('======데이터 전체 count 수=======', listCount.count);
    const pagingData = getPagingData(listCount, currentPage, limit);
    console.log('--------한 페이지에 나오는 데이터-', listCount);
    let cri = currentPage;


    res.render('user/board/tourlandPlanBoard', {
        PlanRegister,
        userAuth,
        mypage,
        searchkeyword,
        list,
        pagingData,
        cri
    });
});


// 여행 후기 게시판 목록 보기기
router.get('/tourlandCustBoard', async (req, res, next) => {
    // userHeader 에서 필요한 변수들
    if (req.session.user) {
        userAuth = req.session.user;
    }
    console.log('-------userAuth-------', userAuth);
    let searchkeyword = "";

    const contentSize = 5 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    const list =
        await models.custboard.findAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });
    const listCount =
        await models.custboard.findAndCountAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });

    const pagingData = getPagingData(listCount, currentPage, limit);
    let cri = currentPage;
    res.render('user/board/tourlandCustBoard', {
        userAuth, searchkeyword, cri, list, pagingData})
})

// 여행 후기 게시글 보기
router.get('/tourlandCustBoardDetail', async (req, res, next) => {
    // userHeader 에서 필요한 변수들
    if (req.session.user) {
        userAuth = req.session.user;
    }
    let username = userAuth.username;
    console.log('-----------userAuth-------', userAuth);
    let searchkeyword = "";

    console.log('=---쿼리에서 id 추출 ---', req.query.id);

    let custBoardVO =
        await models.custboard.findOne({
            raw: true,
            where: {
                id: req.query.id
            }
        });
    console.log('----게시글보기====', custBoardVO);

    res.render('user/board/tourlandCustBoardDetail', {
        custBoardVO,
        userAuth,
        searchkeyword,
        username
    });
})


// 여행 후기 등록하는 페이지 보기
router.get('/tourlandCustBoardRegister', (req, res, next) => {

    let custBoardVO = {};

    // userHeader 에서 필요한 변수들
    if (req.session.user) {
        userAuth = req.session.user;
    }
    console.log('-----------userAuth-------', userAuth);
    let searchkeyword = "";

    let mypage = {};
    if (userAuth.role === 'customer') {
        return res.redirect('/loginForm')
    } else if (userAuth.role === 'basic') {
        mypage = "mypageuser"
    } else if (userAuth.role === 'admin') {
        mypage = "mypageemp"
    }

    res.render('user/board/tourlandCustBoardRegister', {mypage, userAuth, searchkeyword, custBoardVO})
})

// 여행 후기 등록하기
router.post('/tourlandCustBoardRegister', upload.single("image"), async (req, res, next) => {
// userHeader 에서 필요한 변수들
    if (req.session.user) {
        userAuth = req.session.user;
    }

    let body = {};
    if (req.file != null) {
        body = {
            raw: true,
            title: req.body.title,
            content: req.body.content,
            writer: req.body.writer,
            regdate: req.body.regdate,
            image: req.file.filename,
        }
    } else {
        body = {
            raw: true,
            title: req.body.title,
            content: req.body.content,
            writer: req.body.writer,
            regdate: req.body.regdate,
        }
    }
    console.log('------------req.body-----', req.body);
    console.log('파일파일파일파일파일파일', req.file);

    const custRegister = await models.custboard.create(body);

    console.log('-------이미지 등록???----------', req.file);
    console.log('------------------게시글 등록-----------------', custRegister);

// ------------------게시글 등록하면 후기 게시판 목록 보여줘야하므 list값도 같이 전송해서 게시글 목록 다시 불러오기 -----------------------------------
    const contentSize = 5 // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);

    const list =
        await models.custboard.findAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });
    const listCount =
        await models.custboard.findAndCountAll({
            raw: true,
            order: [
                ["id", "DESC"]
            ],
            limit, offset
        });
    console.log('======데이터 전체 count 수 전송전송=======', listCount.count);
    const pagingData = getPagingData(listCount, currentPage, limit);
    let cri = currentPage;


    res.render('user/board/tourlandCustBoard', {
        custRegister,
        userAuth,
        list,
        pagingData,
        cri
    });
});


// 여행후기 수정하기 화면 보이기
router.get('/tourlandCustBoardRegisterEdit', upload.single("image"), async (req, res, next) => {

    let custBoardVO = {};
    let cri = {};

    const toUpdate = await models.custboard.findOne({
        raw: true,
        where: {
            id: req.query.id,
        }
    });
    console.log('-----------쿼리정보-------', req.query);
    console.log('----------수정화면입장----------', toUpdate);

    // userHeader 에서 필요한 변수들
    if (req.session.user) {
        userAuth = req.session.user;
    }
    console.log('-----------userAuth-------', userAuth);

    let mypage = {};
    if (userAuth.role === 'basic') {
        mypage = "mypageuser"
    } else if (userAuth.role === 'admin') {
        mypage = "mypageemp"
    }
    let searchkeyword = "";


    res.render('user/board/tourlandCustBoardRegisterEdit', {
        userAuth,
        mypage,
        custBoardVO,
        searchkeyword,
        cri,
        toUpdate,
    })
});


// 여행후기 수정하기 전송
router.post('/tourlandCustBoardRegisterEdit', parser, upload.single("image"), async (req, res, next) => {

    console.log("444444444444->", req.body.id);
    let body = {};
    if (req.file != null) {
        body = {
            raw: true,
            content: req.body.content,
            title: req.body.title,
            image: req.file.filename,
        }
    } else {
        body = {
            raw: true,
            content: req.body.content,
            title: req.body.title,
        }
    }

    const update = await models.custboard.update(body, {
        where: {
            id: req.body.id,
        }
    });

    console.log('-----------req.file---------', req.file);

    console.log('----------수정----------', update);
    // console.log('--------custBoardVo-----', custBoardVO);

    res.redirect("/customer/tourlandCustBoard");
    // res.render('user/board/tourlandCustBoardDetail', {
    //     mypage,
    //     Auth,
    //     custBoardVO,
    //     login,
    //     Manager,
    //     searchkeyword,
    //     update,
    // })

});

// 여행후기 삭제하기
router.delete('/tourlandCustBoardDetail', async (req, res, next) => {

    let custBoardVO = {};
    let boardId = req.query.id

    // const result = await models.custboard.destroy({
    //     where : {
    //         id : boardId,
    //     }
    // });
    models.custboard.destroy({
        where: {
            id: boardId,
        }
    }).then((result) => {
        console.log(result);
    }).catch((err) => {
        console.log(err);
        next(err);
    })

    // console.log('=========삭제========', result);

    // userHeader 에서 필요한 변수들
    if (req.session.user) {
        userAuth = req.session.user;
    }
    let searchkeyword = "";



    res.render('user/board/tourlandCustBoard', {
        userAuth,
        custBoardVO,
        searchkeyword,
    })

});


// 이벤트 목록 (현재 진행중인 이벤트들 나옴)
router.get("/tourlandEventList/ingEvent", async (req, res, next) => {

    const eventList = await models.event.findAll({
        raw: true,
        where: {
            enddate: {[Op.gt]: new Date()},
        },
    });
    // console.log('-------------123123123--', eventList); 이거 주석처리 해하제면 콘솔에 이미지 주소 길게 나옴

    let mistyrose = {};

    // userHeader 에서 필요한 변수들
    if (req.session.user) {
        userAuth = req.session.user;
    }
    let searchkeyword = "";

    res.render("user/event/tourEventList", {userAuth, searchkeyword, eventList, mistyrose});
});

// 만료된 이벤트 목록
router.get("/tourlandEventList/expiredEvent", async (req, res, next) => {

    const eventList = await models.event.findAll({
        raw: true,
        where: {
            enddate: {[Op.lt]: new Date()},
        },
    });
    console.log('-----만료된이벤트목록--', eventList);

    let mistyrose = {};

    // userHeader 에서 필요한 변수들
    if (req.session.user) {
        userAuth = req.session.user;
    }
    let searchkeyword = "";

    res.render("user/event/tourEventEndList", {userAuth, searchkeyword, eventList, mistyrose});
});

// 이벤트 상세페이지
router.get("/eventDetailPage", async (req, res, next) => {
    console.log('---------', req.query);
    let {no} = req.query;

    const eventVO =
        await models.event.findOne({
            raw: true,
            where: {
                id: no
            }
        });
    console.log(eventVO);

    // userHeader 에서 필요한 변수들
    if (req.session.user) {
        userAuth = req.session.user;
    }
    let searchkeyword = "";


    res.render('user/event/eventDetailPage', {userAuth, searchkeyword, eventVO, no});
});

module.exports = router;
