const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

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
    //If passwords match, return JWT token
    const secretKey = "_0a,i^6ot1u;jz|v}ng3>Yf(L=Re6D";
    const expires_in = 60 * 60 * 24 // 1 day
    const exp = Date.now() + expires_in * 1000
    const token = jwt.sign({email, exp}, secretKey);
    return res.status(200).json({
      token_type: "Bearer",
      token: token,
      expires_in: expires_in
    })
  })

});

router.post('/register', function (req, res, next) {
  //Retrieve email and password from req.body
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
        
    // If user does exist, return error response
    if (users.length > 0){
      return res.status(409).json({
        error: true,
        message: "User already exists"
      })
    }
  
   // If user does not exist, insert into table
    const hash = bcrypt.hashSync(password, saltRounds);
    req.db.from("users").insert({email, hash}).then(() => {
      return res.status(201).json({
        message: "User created"
      })
    }).catch((err) => {
      return res.json({ "Error": true, "Message": err.Message })
    })    
  })
});

router.get('/:email/profile', function (req, res, next) {
  res.render('index', { title: 'User profile' });
  //TODO: Get profile of a particular user
});

router.put('/:email/profile', function (req, res, next) {
  res.render('index', { title: 'User profile put' });
  //TODO: Get profile of a particular user
});



module.exports = router;
