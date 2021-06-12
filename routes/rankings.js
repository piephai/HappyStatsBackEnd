/* Get rankings */
async function getRankings(req, res, next) {

    var queryParameter = req.query;
    let rankings = [];
    const filter = {};
    const propertiesToReturn = ["rank", "country", "score", "year"];

    //Check if query parameter of country contain only letters if it does not then send back a 400 response
    if (queryParameter.country) {
        if (queryParameter.country.match(/\d/)) {
            res.status(400).json({ "Error": true, "Message": "Invalid country format. Country query parameter cannot contain numbers" })
        }
        filter.country = queryParameter.country;
    }
    //Check if query paramter of year contain only numbers if does not then send back a 400 response
    if (queryParameter.year) {
        if (!(queryParameter.year.match(/^[0-9]+$/)) || queryParameter.year.length != 4) {
            res.status(400).json({ "Error": true, "Message": "Invalid year format. Format must be yyyy" })
        }
        filter.year = queryParameter.year;
    }
    //Check if there are more than 2 query parameters if there is send back a 400 response
    if (Object.keys(queryParameter).length > 2) {
        res.status(400).json({ "Error": true, "Message": "Invalid query parameters. Only year and country are permitted" })
    }
    req.db.from('rankings').select(propertiesToReturn).where(filter).then((rows) => {
        return res.status(200).json({ rows });
    }).catch((err) => {
        return res.json({ "Error": true, "Message": err.Message })
    });
}


module.exports = getRankings;