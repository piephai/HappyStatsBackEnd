const jwt = require("jsonwebtoken");

/* Get rankings */
const authorise = (req, res, next) => {
  
    const authorisation = req.headers.authorization;
    let token = null;

    //Check if auth header is missing if it is then throw 401
    if (!authorisation) {
        return res.status(401).json({ error: true, message: "Authorization header ('Bearer token') not found" })
    }
    //Invalid JWT token
    if (authorisation.split(" ").length !== 2){
        return res.status(401).json({ error: true, message: "Authorization header is malformed"})   
    }

    token = authorisation.split(" ")[1];
    //TODO: Check if JWT token is valid if it is not then throw 401
    try{
        const decoded = jwt.verify(token, "_0a,i^6ot1u;jz|v}ng3>YfL=Re6D");             
        //Check if token is expired if it is then throw 401
        if (decoded.exp < Date.now()) {
            return res.status(401).json({ error: true, message: "JWT token has expired" })
        }
        next();
        
    }
    catch(err){
        return res.status(401).json({ error: true, message: "Invalid JWT token"})
    }
  
}

const verifyUserID = (email, authorisation) => {
    token =  authorisation.split(" ")[1];
    try{
        const decoded = jwt.verify(token, "_0a,i^6ot1u;jz|v}ng3>YfL=Re6D");             
   
        // Check if email matches the email within the JWT token
        if (email === decoded.email){
            return true;
        }
        return false;
        
    }
    catch(err){
        console.log("Error verifying jwt token")
    }

}


module.exports = {authorise, verifyUserID};