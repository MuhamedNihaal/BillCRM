import { asyncErrorHandler, Error ,Response} from "express-error-catcher";
import models from "../models/index.js";
import _ from "lodash";
import bcrypt from "bcryptjs";

const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (err) {
        console.error(err);
    }
};
const password = 'your_secure_password';

export const createUser=asyncErrorHandler(async(req,res)=>{
  
   return new Response("Created successfully", null, 200)

})