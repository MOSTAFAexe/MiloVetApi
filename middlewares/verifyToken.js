const jwt = require("jsonwebtoken");
const appError = require("../utils/appError");
const statustxt = require("../utils/statustxt");

const verifyToken = (req, res, next)=>{
    const authHeader = req.headers["Authorization"] || req.headers["authorization"];
    if(!authHeader){
        appError.create("access denied, token is required", 401, statustxt.FAIL);
        return next(appError);
    }

    const token = authHeader.split(" ")[1];

    try{
        // current user
        const currentUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.currentUser = currentUser;
        next();
    }catch{
        appError.create("invalid token", 401, statustxt.FAIL);
        return next(appError);
    }
    
}

module.exports = verifyToken;