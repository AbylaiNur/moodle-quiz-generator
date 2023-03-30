const google_callback = (req, res) => {
    res.redirect('/');
}

const auth_logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.session.destroy();
        res.redirect('/');
    });
}

const failure = (req, res) => {
    res.send('Failed to authenticate..');
}

export {
    google_callback,
    auth_logout,
    failure
}