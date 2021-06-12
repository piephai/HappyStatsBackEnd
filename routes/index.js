var express = require('express');
const { routes } = require('../app');
var router = express.Router();
const getRankings = require('./rankings');
const getCountries = require('./countries');
const getFactors = require('./factors');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'The World Database API' });
});

router.get('/api', function (req, res, next) {
  res.render('index', { title: 'Lots of routes available' });
});

router.get('/rankings', getRankings);

router.get('/countries', getCountries);

router.get('/factors/:year', getFactors);


router.get('/api/city/:CountryCode', function (req, res, next) {
  req.db.from('city').select('*').where('CountryCode', '=', req.params.CountryCode)
    .then((rows) => {
      res.json({ "Error": false, "Message": "Success", "Cities": rows })
    }).catch((err) => {
      console.log(err);
      res.json({ "Error": true, "Message": "Error executing MySQL query" })
    })
});




// router.get(`/api/city/{country-code}`, function(req,res,next){
//   res.render('index', {title: 'City code'})
// })

// router.get('/knex', function(req, res, next) {
//   req.db.raw("SELECT VERSION()").then(
//     (version) => console.log((version[0][0]))
//   ).catch((error) => { console.log(error); throw error})
//   res.send("Version logged successfully");
// })



module.exports = router;
