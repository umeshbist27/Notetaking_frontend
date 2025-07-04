import * as yup from "yup";
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

export const signupSchema=yup.object().shape({
    name:yup.string().required("Name is required").min(3,"Name must be at least 3 characters"),
    
    email:yup.string().email("Invalid email address ").required("Email is required"),
    
    password:yup.string().required("Password is required").min(8,"password must have 8 characters").matches(passwordRegex,"Password must be strong (8+ chars, uppercase, lowercase, number, special char)")
})

export const loginSchema=yup.object().shape({
    email:yup.string().email("Invalid email address").required("email is required"),
    password:yup.string().required("password is required")

})
