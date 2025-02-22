const appError = require("../utils/appError");
const statusText = require("../utils/statusText");

module.exports = (...roles) => {
    
    return (req, res, next) =>{
        if(!roles.includes(req.currentUser.role)){
            appError.create("this role is not authorized", 401, statusText.FAIL)
            return next(appError);
        }
        next();
    }
}