const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authorisation = require('../authorisation');
const checkDate = require('../checkDate');

const saltRounds = 10;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/*Route to login*/
router.post('/login', function (req, res, next) {

  // Retrieve email and password from req.body
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password){
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required"
    })
  }

  // Determine if user already exists in table
  const queryUsers = req.db.from("users").select("*").where("email", "=", email);
  queryUsers.then((users) => {
        
    // If user does not exist, return error response
    if (users.length === 0){
      return res.status(401).json({
        error: true,
        message: "Incorrect email or password"
      })
    }

    const user = users[0];
    //If user does exist, verify if password match
    return bcrypt.compare(password, user.hash);
  }).then((match) => {
    //If password do not match, return error response
    if(!match){
      return res.status(401).json({
        error: true,
        message: "Incorrect email or password"
      })
    }
    //If passwords match, sign the JWT token and return it
    try {
    const secretKey = "_0a,i^6ot1u;jz|v}ng3>YfL=Re6D";
    const expires_in = 60 * 60 * 24 // 1 day
    const exp = Date.now() + expires_in * 1000
    const token = jwt.sign({email, exp}, secretKey);
    return res.status(200).json({
      token_type: "Bearer",
      token: token,
      expires_in: expires_in
    })
  }
    catch (err){
      console.log(err);
      // return res.status(400).json({ error: true, message: err.Message});
    }
  });
});

/*Route to register */

router.post('/register', function (req, res, next) {
  //Retrieve email and password from req.body
  const email = req.body.email;
  const password = req.body.password;


  //Check if email and password exists
  if (!email || !password){
    return res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required"
    })
  }
  // Determine if user already exists in table
  const queryUsers = req.db.from("users").select("*").where("email", "=", email);
  queryUsers.then((users) => {
        
    // If user does exist, return user already exists response
    if (users.length > 0){
      return res.status(409).json({
        error: true,
        message: "User already exists"
      })
    }
  
   // If user does not exist then hash the password 
    const hash = bcrypt.hashSync(password, saltRounds);

    //Form the json object to be inserted into the database table, email and hash are the only two that cannot be null at initiation
    const propertiesToInsert = {
      email: req.body.email,
      hash: hash,
      firstName: null,
      lastName: null,
      dob: null,
      address: null,
    };
    //Make an insert query using knex into the database and if successful return a 201 with message of "Created"
    req.db.from("users").insert(propertiesToInsert).then(() => {
      return res.status(201).json({
        message: "Created"
      })
    }).catch((err) => {
      return res.json({ error: true, message: "Database query failed" })
    })    
  })
});

/* Route to get information about a user profile */

router.get('/:email/profile', function (req, res) {

  // Specified the default properties to return
  const propertiesToReturn = ["email", "firstName", "lastName"];
  let email = req.params.email;

  //Replace the %40 within the email address from the parameter with @
  email.replace(/\+/g, " ").replace(/\%40/g, "@");

  //Check if there is an authorisation token within the headers
  if (req.headers.authorization){

    //Check if the JWT token is valid
    authorisation.authorise;

    //Check if the inqured user matches the user in the JWT token
    if(authorisation.verifyUserID(email, req.headers.authorization)){

      //If user matches then pushes the date of birth and address to the properties to be return object
      // DOB and address can only be returned if the email in the params matches the user that is logged in
      propertiesToReturn.push("dob", "address");   
    }        
  }
  //Select query to the database using knex for specified email and properties. 
  req.db.from("users").select(propertiesToReturn).where("email", "=", email).then((rows) => {     
    //Check if user exists 
    if (rows.length > 0){
    return res.status(200).json(rows[0]);
    }
    //User cannot be found
    return res.status(404).json({error: true, message:"User not found"})
  }).catch(() => {
    return res.status(400).json({error: true, message:"Error querying the database"})
  })

});

/* Route to update a user profile. This route required the user to be logged in */
router.put('/:email/profile', authorisation.authorise, function (req, res) {
  let email = req.params.email;

  const requestBody = req.body;


  //CHeck if firstname, lastname, dob and address exists within the request body
  if(!(requestBody.firstName || requestBody.lastName || requestBody.dob || requestBody.address)){
    return res.status(400).json({error:true, message:"Request body incomplete: firstName, lastName, dob and address are required."});
  }

  //Check that the properties within the request body are of the right type
  if(typeof requestBody.firstName !== 'string' || typeof requestBody.lastName !== 'string' || typeof requestBody.address !== 'string'){
    return res.status(400).json({error:true, message:"Request body invalid, firstName, lastName and address must be strings only."});
  }

  //Check if the date specified is valid taking into consideration leap year, etc. Format for date is YYYY-MM-DD
  if(!checkDate.isValidDate(requestBody.dob)){
    return res.status(400).json({error:true, message:"Invalid input: dob must be a real date in format YYYY-MM-DD."});
  }

  //Check to make sure that the request body dob is from the past
  if(!checkDate.isDateInThePast(requestBody.dob)){
    return res.status(400).json({error:true, message:"Invalid input: dob must be a date in the past."});
  }

  //Replace the %40 within the parameter email with @
  email.replace(/\+/g, " ").replace(/\%40/g, "@");

  //Check if user matches inquired user matches user in the JWT token
  if(!authorisation.verifyUserID(email, req.headers.authorization)){

    //If user don't match throw a forbidden error
    return res.status(403).json({error:true, message:"Forbidden"}); 
  }    
  
  
  //Make a select request to the database to check if the user with the specified email exists
  req.db.from("users").select("email").where("email", "=", email).then((users) => { 
    // If user does not exist, return error response
    if (users.length == 0){
      return res.status(404).json({error: true, message:"User not found"})
    }

  });

  //Make an update request to the database with the request body. If successful return the updated information of the user.
  req.db.from("users").where("email", "=", email).update(requestBody).then( _ => {
    const userModified = {
      email: email,
      firstName: requestBody.firstName,
      lastName: requestBody.lastName,
      dob: requestBody.dob,
      address: requestBody.address
    }
    return res.status(200).json(userModified);
  }).catch(() => {
    return res.status(400).json({error: true, message:"Failed to query database"})
  })
  
});


module.exports = router;
