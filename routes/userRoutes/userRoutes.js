const express = require('express');
const router = express.Router();
const sequelize = require("sequelize");
const Serializer = require('sequelize-to-json')
const Op = sequelize.Op;
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const {QueryTypes} = require("sequelize");
const moment = require("moment");

global.Auth = {};

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

    let login = "";

    let msg = `세션이 존재하지 않습니다.`
    // "User": userVO.username,
    //     "id": id,
    //     "login": "user",
    //     "Auth": userVO.userpass,
    //     "pass": pass,
    //     "mypage": "mypageuser",

    if (req.session.user) {
        msg = `${req.session.user.User}`;
        Auth = {
            username: req.session.user.User,
            userid: req.session.user.Auth.userid,
            userpass: req.session.user.Auth.userpass
        };
        login = req.session.user.login;
    }

    console.log("Auth============->", Auth, msg);

    let Manager = {};
    let {searchType, keyword, keyword2} = req.query;
    let searchkeyword = keyword;


    res.render('tourlandMain', {
        currentProductPrice,
        currentProductPrice2,
        currentProduct,
        currentProduct2,
        popup1: popup1,
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

    let userVO = {};


    let login = "";

    let msg = `세션이 존재하지 않습니다.`
    if (req.session.user) {
        msg = `${req.session.user.User}`;
        Auth = {username: req.session.user.User};
        login = req.session.user.login;
    }

    console.log("Auth->", Auth, msg);

    let Manager = {};
    let {searchType, keyword, keyword2} = req.query;
    let searchkeyword = keyword;


    res.render("user/tourlandRegisterForm", {autoNo, Auth, login, Manager, searchkeyword, userVO});
});

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
            }
            else {
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
            }
            else {
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


router.get('/loginForm', async (req, res, next) => {
    let {registerSuccess, id} = req.query;

    let UserStay = {userid: id};

    let EmpStay = {};
    let error = "";
    let Auth = {};
    let login = "user";
    let Manager = {};
    let searchkeyword = "";


    res.render("user/tourlandLoginForm", {
        Auth,
        login,
        Manager,
        searchkeyword,
        registerSuccess,
        UserStay,
        EmpStay,
        error
    });
});

router.get('/loginManagerForm', async (req, res, next) => {
    let {registerSuccess, id} = req.query;

    let EmpStay = {empid: id};
    let UserStay = {};
    let error = "";
    let Auth = {};
    let login = "";
    let Manager = {};
    let searchkeyword = "";


    res.render("user/tourlandLoginManagerForm", {
        Auth,
        login,
        Manager,
        searchkeyword,
        UserStay,
        registerSuccess,
        EmpStay,
        error
    });
});


const fecthData = async (req) => {
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


const fecthEmpData = async (req) => {
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

router.post('/loginForm', (req, res, next) => {
    let {id, pass} = req.body;

    let empVO = {};
    let session = {};

    let registerSuccess = {};
    let UserStay;
    let EmpStay = {};
    let error = "";
    let Auth = {};
    let login = "";
    let Manager = {};
    let searchkeyword = "";
    let loginSuccess = false;

    fecthData(req).then((userVO) => {

        // 직원 ID가 없는 경우
        if (userVO.userid == null) {
            error = "idnoneexist";
        } else {

            // 직원 ID가 있고 탈퇴한 회원
            if (userVO.usersecess === 1) {
                error = "retiredcustomer";
            } else if (userVO.usersecess === 0) {

                console.log("comparePassword2222->", userVO.userid);

                bcrypt.compare(req.body.pass, userVO.userpass, (err, result) => {
                    console.log("comparePassword2222->", result);
                    UserStay = userVO;
                    if (result) {
                        loginSuccess = true;

                        if (req.session.user) {
                            console.log(`세션이 이미 존재합니다.`);
                        } else {
                            req.session.user = {
                                "User": userVO.username,
                                "login": "user",
                                "Auth": userVO,
                                "pass": pass,
                                "mypage": "mypageuser",
                                "userid": id,
                            }
                            req.session.save();
                            Auth = userVO;
                            console.log(`세션 저장 완료! `);
                        }
                        res.redirect('/customer');
                    } else {
                        console.log("comparePassword4444->", result);
                        error = "passnotequal";
                        res.render("user/tourlandLoginForm", {
                            Auth,
                            login,
                            Manager,
                            searchkeyword,
                            registerSuccess,
                            UserStay,
                            EmpStay,
                            error
                        });

                    }
                })

            } else {
                error = "usernotfind";
            }

        }

    })


});


router.post('/loginManagerForm', (req, res, next) => {
    let {id, pass} = req.body;

    let session = {};

    let registerSuccess = {};
    let UserStay = {};
    let EmpStay;
    let error = "";
    let Auth = {};
    let login = "";
    let Manager = {};
    let searchkeyword = "";
    let loginSuccess = false;

    fecthEmpData(req).then((empVO) => {

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

                        if (req.session.user) {
                            console.log(`세션이 이미 존재합니다.`);
                        } else {
                            req.session.user = {
                                "User": empVO.empname,
                                "empid": id,
                                "login": "manager",
                                "Auth": empVO.emppass,
                                "pass": pass,
                                "mypage": "mypageemp",
                            }
                            req.session.save();
                            console.log(`세션 저장 완료! `);
                        }
                        res.redirect('/customer');
                    } else {
                        console.log("comparePassword4444->", result);
                        error = "passnotequal";
                        res.render("user/tourlandLoginManagerForm", {
                            Auth,
                            login,
                            Manager,
                            searchkeyword,
                            registerSuccess,
                            UserStay,
                            EmpStay,
                            error
                        });

                    }
                })

            } else {
                error = "usernotfind";
            }

        }

    })


});


router.get("/logout", (req, res, next) => {

    req.session.destroy();
    Auth = {};
    console.log(`session을 삭제하였습니다.`);
    res.redirect("/customer");
})


router.get("/tourlandProductKRList", async (req, res, next) => {

    const userid = req.params.userid;
    let {ddate, rdate, cnt, searchType, keyword} = req.query;
    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const currentPage = Number(req.query.currentPage) || 1; //현재페이
    const {limit, offset} = getPagination(currentPage, contentSize);


    let searchQuery = "";

    if (ddate == "name") {
        searchQuery = `and pname like concat('%',${keyword},'%')`;
    }
    if (searchType == "expire") {
        searchQuery = `and pexpire like concat('%',${keyword},'%')`;
    }
    if (searchType == "userCart") {
        searchQuery = `and pname like concat('%',${keyword},'%')`;
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
        let Auth = {};
        let login = "";
        let Manager = {};
        let searchkeyword = "";
        let error = "";
        let cri = {};
        let idx = '';
        let tourDays = '';
        let date = '';
        let capa = '';
        let count = '';


        if (list != null) {
            res.render("user/product/tourlandProductJPList", {
                tourDays,
                date,
                capa,
                count,
                list,
                Auth,
                login,
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


router.get("/tourlandProductDetail/:pno", async (req, res, next) => {

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


        // let list = [];
        let Auth = {userno: 6, username: "테스트"};
        let login = "";
        let Manager = {name: "테스트"};
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
                Auth,
                login,
                Manager,
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


router.get("/tourlandProductDetail/tourlandProductReview/:pno", async (req, res, next) => {

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

        let Auth = {userno: 6, username: "테스트"};
        let login = "manager";
        let Manager = {name: "테스트"};
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


router.get("/tourlandMyWishes", async (req, res, next) => {

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


        // let list = [];
        let Auth = {userno: 6, username: "테스트"};
        let login = "";
        let Manager = {name: "테스트"};
        let searchkeyword = "";
        let error = "";
        let cri = {};
        let idx = '';
        let tourDays = '';
        let date = '';
        let capa = '';
        let count = '';


        if (vo != null) {
            res.render("user/mypage/tourlandMyWishes", {
                Auth,
                login,
                Manager,
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


router.get("/tourlandMyReserv:rno", async (req, res, next) => {

    const rno = req.params.rno;
    let {price, rdate, cnt, searchType, keyword} = req.query;

    try {

        const list = await reservation.findAll({
            // raw : true,
            nest: true, attributes: ['no', 'userno', 'rdate', 'rstatus'],
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


        let Auth = {userno: 6, username: "테스트"};
        let login = "";
        let Manager = {name: "테스트"};
        let searchkeyword = "";
        let error = "";
        let cri = {};
        let idx = '';
        let tourDays = '';
        let date = '';
        let capa = '';
        let count = '';


        if (vo != null) {
            res.render("user/mypage/tourlandMyReserv", {
                Auth,
                login,
                Manager,
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


router.get("/tourlandProductDetail/reserv", async (req, res, next) => {

    let {uno, pno, price, ano, acapacity, hno, hcapacity, tno, tcapacity, rno, rcapacity} = req.query;
    console.log(uno, tno);


});

router.post("/tourlandProductDetail/reserv", (req, res, next) => {


    let {uno, pno, price, ano, acapacity, hno, hcapacity, tno, tcapacity, rno, rcapacity} = req.body;
    console.log("aaaa11111111111->", req.body);
    ano.map(no => {
        console.log("aaaa->", no[i]);
    })


});


router.get("/tourlandMyCoupon", async (req, res, next) => {

    const pno = req.params.pno;
    let {price, rdate, cnt, searchType, keyword} = req.query;


    try {

        const c = await product.findOne({
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


        // let list = [];
        let Auth = {userno: 6, username: "테스트"};
        let login = "user";
        let Manager = {name: "테스트"};
        let searchkeyword = "";
        let error = "";
        let cri = {};
        let idx = '';
        let tourDays = '';
        let date = '';
        let capa = '';
        let count = '';


        if (vo != null) {
            res.render("user/mypage/tourlandMyCoupon", {
                Auth,
                login,
                Manager,
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


router.get("/EditPassword", (req, res, next) => {

    let {empid, checkPass, userid} = req.body;
    let {searchType, keyword, searchkeyword} = req.query;

    console.log(req.session.user);
    try {
        if (req.session.user) {
            Auth = {
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
                userno: req.session.user.Auth.userno,
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



router.post("/editProfile", (req, res, next) => {

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



    res.status(200).json("success");



});


router.get("/logoutWithdrawal?no=")

module.exports = router;
