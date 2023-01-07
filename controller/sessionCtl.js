
let user = {
    Auth: {
        id: "",
        username: "",
        userbirth: "",
        usertel: "",
        useraddr: "",
        userpassport: "",
        userid: "",
        usersecess: "",
        useremail: ""
    },
    AuthEmp: {
        empno: "",
        empname: "",
        empbirth: "",
        emptel: "",
        empaddr: "",
        epmauth: "",
        empid: "",
        epmretired: ""
    },
    Mananger: {name: "", right: 1},
    User: "",
    login: "user",
    mypage: "mypageuser"
}


exports.sessionCheck = (req, res) => {

    if (req.session.user == undefined) {
        console.log("111111111111******->");
        req.session.user = user;

        req.session.save();
    }

    if (req.session.user.Auth.id === undefined) return res.redirect("/customer");
    // if (req.session.user.Manager === undefined) return res.redirect("/customer");

    return  req.session.user;

}


exports.sessionEmpCheck = (req, res) => {
    if (req.session.user == undefined) {
        console.log("22222222222******->");
        req.session.user = user;

        req.session.save();
    }

    if (req.session.user.AuthEmp.empno === undefined) return res.json({"responsetxt":"/loginManagerForm"});
    return  req.session.user;

}