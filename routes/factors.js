/*Function to get factors of different countries*/
const getFactors = (req, res, next) => {
    const queryParameter = req.query;
    //Initialise the filter to be use in the database conditional query
    const filter = {};

    //Specified which of the properties we want to return from the DB
    const propertiesToReturn = ["rank", "country", "score", "economy", "family", "health", "freedom", "generosity", "trust"];

    //Check if there are more than 2 query parameters
    if (Object.keys(queryParameter).length > 2) {
        return res.status(400).json({ "error": true, "message": "Invalid query parameters. Only year and country are permitted" })
    }
    //Check if query paramter of year contain only numbers if does not then send back a 400 response
    if (!(req.params.year.match(/^[0-9]+$/)) || req.params.year.length != 4) {
        return res.status(400).json({ error: true, message: "Invalid year format. Format must be yyyy" })
    }
    filter.year = req.params.year;

    //If query parameter length is one then it has to be either country or limit
    if (Object.keys(queryParameter).length == 1){
        if (!(queryParameter.country || queryParameter.limit)){
            return res.status(400).json({ "error": true, "message": "Invalid query parameters. Only year and country are permitted" })
        }
    }

    //If query parameter length is 2 then it the query parameters has to be country and limit only
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

    //Check if the limit query parameter is a number
    if (queryParameter.limit && !queryParameter.limit.match(/^[1-9]\d*$/)) {
        return res.status(400).json({ error: true, message: "Invalid limit query. Limit must be a positive number" })
    }


    //Check if there is a limit query parameter and if there is then only return back the limit amount
    (queryParameter.limit ? req.db.from('rankings').select(propertiesToReturn).where(filter).limit(queryParameter.limit) :
    req.db.from('rankings').select(propertiesToReturn).where(filter)).then((rows) => {
    
    return res.status(200).json(rows);

    }).catch(() => {
    return res.status(400).json({error: true, message:"Error querying the database"})
    });
}

module.exports = getFactors;
