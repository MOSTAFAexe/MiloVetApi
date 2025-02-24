const bcrypt = require("bcryptjs");

const Vet = require("../models/vet.model");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");
const generateJWT = require("../utils/generateJWT");
const statusText = require("../utils/statusText");

const register = asyncWrapper(async (req, res, next)=>{
    const {firstName, lastName, email, password, gender, speciality} = req.body;

    const vet = await Vet.findOne({email: email});
    if(vet){
        appError.create("this email is already exists", 400, statusText.FAIL);
        return next(appError);
    }

    // password hashing 
    const hashedPassword = await bcrypt.hash(password, 5)

    const newVet = new Vet({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        gender,
        speciality,
    });

    // generate JWT token
    newVet.token = await generateJWT({id: newVet._id, email: newVet.email, role: newVet.role});
    await newVet.save();

    res.status(201).json({status: statusText.SUCCESS, data: {vet: newVet}})
})

const login = asyncWrapper(async (req, res, next)=>{
    const {email, password} = req.body;
    if(!email && !password){
        next(appError.create("email and password are required", 400, statusText.FAIL));
    }
    const vet = await Vet.findOne({email: email});
    if(!vet){
        return next(appError.create("your email might be wrong", 400, statusText.FAIL));
    }

    const isMatched = await bcrypt.compare(password, vet.password);
    if(vet && isMatched){
        const token = await generateJWT({id: vet._id, email: vet.email, role: vet.role});
        vet.token = token
        res.json({status: statusText.Success,  data: {token}})
    }
    else{
        return next(appError.create("your email or password might be wrong", 400, statusText.FAIL));
    }
});

module.exports = {
    register,
    login
}
