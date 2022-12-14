var express = require('express');
var router = express.Router();
const cookieParser = require("cookie-parser");
const models = require("../models");
const fs = require('fs');
const {getPagination, getPagingData} = require("../controller/pagination");
const {Op} = require("sequelize");


router.get('/api/airplane/:id', async function (req, res, next) {
    try {
        let searchAirplane = req.params.id;
        console.log("222->", searchAirplane);
        const airplane = await models.airplane.findOne({
            where: {
                id: searchAirplane
            }
        });
        console.log("1111->", airplane);
        res.send(airplane);

    } catch (err) {
        console.error(err);
        next(err);
    }
    res.render('index', {title: 'Express'});
});



router.get('/client/list', async (req,res,next)=>{
    //usersecess 정상회원, 탈퇴회원 구분

    // const usersecess = req.params.usersecess;
    const usersecess = 0;
    let { searchType, keyword } = req.query;

    const contentSize = Number(process.env.CONTENTSIZE); // 한페이지에 나올 개수
    const currentPage = Number(req.query.page) || 1; //현재페이
    const { limit, offset } = getPagination(currentPage, contentSize);

    keyword = keyword ? keyword : "";

    let dataAll = await models.user.findAll({
        where: {
            [Op.and] : [
                {
                    usersecess: usersecess
                }
            ],
            [Op.or]: [
                {
                    userid: { [Op.like]: "%" +keyword+ "%" }
                },
                {
                    username: { [Op.like]: "%" + keyword + "%" }
                }
            ]

        },
        limit, offset
    })

    let dataCountAll = await models.user.findAndCountAll({
        where: {
            [Op.and] : [
                {
                    usersecess: usersecess
                }
            ],
            [Op.or]: [
                {
                    userid: { [Op.like]: "%" +keyword+ "%" }
                },
                {
                    username: { [Op.like]: "%" + keyword + "%" }
                }
            ]
        },
        limit, offset
    })

    const pagingData = getPagingData(dataCountAll, currentPage, limit);

    let cri = {searchType,keyword};

    let btnName = (Boolean(Number(usersecess)) ? "회원 리스트" : "탈퇴회원 조회");

    console.log("usersecbtt->", pagingData)
    let Manager = {};
    let Auth ={};
    let list;

    if ( dataCountAll != null){
        res.status(200).json({
            success : true,
            result: dataAll,
            pagination: { page:pagingData.currentPage, pages:pagingData.totalPages, count:pagingData.totalItems},
            message : "데이터 요청 성공!",
        });
    }else{
        res.status(203).json({
            success : false,
            result: [],
            pagination: { page:pagingData.currentPage, pages:pagingData.totalPages, count:pagingData.totalItems},
            message : "데이터 요청 실패!",
        });
    }

})


module.exports = router;
