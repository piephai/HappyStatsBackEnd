var express = require('express');
const { routes } = require('../app');
var router = express.Router();
const getRankings = require('./rankings');
const getCountries = require('./countries');
const authorise = require('../authorisation');



/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'The World Database API' });
});

router.get('/api', function (req, res, next) {
  res.render('index', { title: 'Lots of routes available' });
});

router.get('/rankings', getRankings);

router.get('/countries', getCountries);

router.get('/factors/:year', authorise, function(req, res) {

  const queryParameter = req.query;
  const filter = {};
  const propertiesToReturn = ["rank", "country", "score", "economy", "family", "health", "freedom", "generosity", "trust"];

  if (Object.keys(queryParameter).length > 2) {
    return res.status(400).json({ "error": true, "message": "Invalid query parameters. Only year and country are permitted" })
  }
  //Check if query paramter of year contain only numbers if does not then send back a 400 response
  if (!(req.params.year.match(/^[0-9]+$/)) || req.params.year.length != 4) {
    return res.status(400).json({ error: true, message: "Invalid year format. Format must be yyyy" })
  }
  filter.year = req.params.year;

  if (Object.keys(queryParameter).length == 1){
    if (!(queryParameter.country || queryParameter.limit)){
      return res.status(400).json({ "error": true, "message": "Invalid query parameters. Only year and country are permitted" })
    }
  }

  if (Object.keys(queryParameter).length == 2){
    if (!(queryParameter.country && queryParameter.limit)){
      return res.status(400).json({ "error": true, "message": "Invalid query parameters. Only year and country are permitted" })
    }
  }

  //Check if query parameter of country contain only letters if it does not then send back a 400 response
  if (queryParameter.country) {
      if (queryParameter.country.match(/\d/)) {
          return res.status(400).json({ error: true, message: "Invalid country format. Country query parameter cannot contain numbers" })
      } 
      filter.country = queryParameter.country;   
  }

  if (queryParameter.limit && !queryParameter.limit.match(/^[1-9]\d*$/)) {
      return res.status(400).json({ error: true, message: "Invalid limit query. Limit must be a positive number" })
  }


  (queryParameter.limit ? req.db.from('rankings').select(propertiesToReturn).where(filter).limit(queryParameter.limit) :
   req.db.from('rankings').select(propertiesToReturn).where(filter)).then((rows) => {
   
    return res.status(200).json(rows);
 
  }).catch((err) => {
      return res.status(400).json({message: err.Message})
  })
});






module.exports = router;
