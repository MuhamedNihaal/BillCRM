import * as yup from "yup";
import { dobRex, dynamicRequire, mobileWithLandPhone, objectIdRegex } from "./global.validation.js"
export const customerSchema = async (body, required = true) => {
    const schema = yup
        .object({
            firstName: dynamicRequire(
                yup.string().max(200, "first name must be below 200 characters"),
                required,
                "first name is required"
            ),
            lastName: yup.string().max(200, "last name must be 200 characters"),
            mobile: dynamicRequire(
                yup
                    .string()
                    .matches(mobileWithLandPhone, "invalid mobile number"),
                required,
                "mobile is required"
            ),
            email: yup.string().email(),
            dob: yup.string().matches(dobRex, "yyyy-mm-dd"),
            age: yup.object().shape({
                year: yup.number().typeError("year must be number"),
                month: yup.number().typeError("month must be number"),
                day: yup.number().typeError("day must be number")
            }),
            gender: yup.number().oneOf([1, 2, 3], "gender must be 1, 2, or 3"),
            city: yup.string().max(200, "location must be below 200 characters"),
            address: yup.string().max(400, "location must be below 400 characters"),
            country: yup.string().matches(objectIdRegex, "invalid country id"),
            state: yup.number().max(200, "state must be below 200 characters"),
            district: yup.string().max(200, "district must be below 200 characters"),
            reason: yup.string().max(200, "reason must be below 200 characters"),
            category: yup.string().matches(objectIdRegex, "invalid category id"),
            members: yup.array().of(yup.object().shape({
                ageInfo: yup.string(),
                dob: yup.string(),
                member: yup.string().matches(objectIdRegex, "invalid member id"),
                relation: yup.string().max("200", "relation must be 200 characters")
            }))
        })
        .strict()
        .noUnknown();

    try {
        return await schema.validate(body, { abortEarly: false });
    } catch (err) {
        return { error: err.errors[0] };
    }
};