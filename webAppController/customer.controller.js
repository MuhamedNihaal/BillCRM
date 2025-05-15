import { asyncErrorHandler, Error ,Response} from "express-error-catcher";
import models from "../models/index.js";
import moment from "moment";


export const registration = asyncErrorHandler(async (req, res) => {
  let customerId = req.body.customerId;

  let exsistcustomer = await models.Customer.findOne({
    _id: { $ne: customerId },customer: req.body.mobile,status: 0,
  });

  if (exsistcustomer)
    throw new Error("Another customer exsist with give phone number.", 400);

  let update = await models.Customer.findByIdAndUpdate(
    customerId,
    {
      ip: req.ip,
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      dob: req.body.dob,
      gender: req.body.gender,
      appToken: req.body.appToken,
      version: req.body.version,
      pincode: req.body.pincode,
      registered: true,
      date: moment().format("YYYY-MM-DD"),
      time: moment().format("HH:mm:ss"),
    },
    { new: true }
  );

  if (!update)
    throw new Error("Another customer exsist with give phone number.", 400);

  return new Response("Register successfully", null, 200);
});

export const profile=asyncErrorHandler(async(req,res)=>{
  let data=await models.Customer.findById(req.query.customerId);
  return new Response(null,{data}, 200)
})