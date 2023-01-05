const express = require('express');
const router = express.Router();
const sequelize = require("sequelize");
const Op = sequelize.Op;


const cookieParser = require("cookie-parser");
const models = require('../models/index');

const fs = require('fs');
const querystring = require('querystring');
const crypto = require('crypto');


require('dotenv').config({ path: '.env' });

/* GET home page. */
// router.get('/', async function (req, res, next) {
//     try {
//         const airplane = await models.airplane.findAll({});
//         console.log("1111->", airplane);
//         res.send(airplane);
//
//     } catch (err) {
//         console.error(err);
//         next(err);
//     }
//     res.render('index', {title: 'Express'});
// });


router.get('/displayFile/:whichOne', async  (req, res, next) => {
    const choice = req.params.whichOne;
    const query = req.query.filename;
    const base_dir = "public/displayFile";

    let path;
    if( choice === "popup"){
        path = base_dir + "/popup" + query;
    }
    if ( choice === "banner"){
        path = base_dir + "/banner" + query;
    }
    if ( choice === "event"){
        path = base_dir + "/event" + query;
    }
    if ( choice === "product" || (choice === "productSmall")){
        path = base_dir + "/product" + query;
        console.log("10000000000000000000");
    }
    if ( choice === "practice"){
        path = base_dir + "/practice" + query;
    }
    fs.createReadStream(path).pipe(res);
});

router.get("/logout", (req, res, next)=>{

    req.session.destroy();
    console.log(`session을 삭제하였습니다.`);
    res.redirect("/customer");
});


module.exports = router;
