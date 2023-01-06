



exports.sessionCheck = (req, res) => {

    if (req.session.user.Auth.id === undefined) return res.redirect("/customer");

    return  req.session.user;

}


exports.sessionEmpCheck = (req, res) => {

    if (req.session.user.AuthEmp.empno === undefined) return res.redirect("/loginManagerForm");

    return  req.session.user;

}