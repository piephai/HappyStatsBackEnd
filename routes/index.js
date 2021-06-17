var express = require('express');
const { routes } = require('../app');
var router = express.Router();
const getRankings = require('./rankings');
const getCountries = require('./countries');
const authorisation = require('../authorisation');
const getFactors = require('./factors');
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('../docs/swagger.json');



/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Swagger UI' });
});

router.get('/api', function (req, res, next) {
  res.render('index', { title: 'Lots of routes available' });
});

router.get('/rankings', getRankings);

router.get('/countries', getCountries);

router.get('/factors/:year', authorisation.authorise, getFactors);

 






module.exports = router;
