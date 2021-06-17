/* Get rankings */
const getRankings = (req, res, next) => {

    var queryParameter = req.query;
    const filter = {};
    const propertiesToReturn = ["rank", "country", "score", "year"];

    //Check if query parameter of country contain only letters if it does not then send back a 400 response
    if (queryParameter.country) {
        if (queryParameter.country.match(/\d/)) {
            return res.status(400).json({ "error": true, "message": "Invalid country format. Country query parameter cannot contain numbers" })
        }
        filter.country = queryParameter.country;
    }
    //Check if query paramter of year contain only numbers if does not then send back a 400 response
    if (queryParameter.year) {
        if (!(queryParameter.year.match(/^[0-9]+$/)) || queryParameter.year.length != 4) {
            return res.status(400).json({ "error": true, "message": "Invalid year format. Format must be yyyy" })
        }
        filter.year = queryParameter.year;
    }
    //Check if there are more than 2 query parameters if there is send back a 400 response
    if (Object.keys(queryParameter).length > 2) {
        return res.status(400).json({ "error": true, "message": "Invalid query parameters. Only year and country are permitted" })
    }
    //Select the specified properties from the rankings table within the DB and do any neccessary filter and then order by year descending
    req.db.from('rankings').select(propertiesToReturn).where(filter).orderBy('year', 'desc').then((rows) => {
        return res.status(200).json( rows );
    }).catch(() => {
        return res.status(400).json({error: true, message:"Error querying the database"})
    });
}


module.exports = getRankings;