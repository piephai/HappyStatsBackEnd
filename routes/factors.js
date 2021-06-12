/* Get rankings */
async function getFactors(req, res, next) {

    const queryParameter = req.query;
    let factors = [];
    const dateNow = new Date();
    const filter = {};
    const propertiesToReturn = ["rank", "country", "score", "economy", "family", "health", "freedom", "generosity", "trust"];

    //TODO: Check authorisation token

    //Check if query paramter of year contain only numbers if does not then send back a 400 response
    if (!(req.params.year.match(/^[0-9]+$/)) || req.params.year.length != 4) {
        return res.status(400).json({ "Error": true, "Message": "Invalid year format. Format must be yyyy" })
    }
    filter.year = req.params.year;

    
    //Check if query parameter of country contain only letters if it does not then send back a 400 response
    if (queryParameter.country) {
        if (queryParameter.country.match(/\d/)) {
            return res.status(400).json({ "Error": true, "Message": "Invalid country format. Country query parameter cannot contain numbers" })
        }   
        filter.country = queryParameter.country;     
    }

    if (queryParameter.limit) {
        if (!queryParameter.limit.match(/^[1-9]\d*$/)) {
            return res.status(400).json({ "Error": true, "Message": "Invalid limit query. Limit must be a positive number" })
        }
    }
    // //Check if auth header is missing if it is then throw 401
    // if (!req.headers.authorisation || req.headers.authorisation.indexOf('Bearer ' === -1)) {
    //     return res.status(401).json({ "Error": true, "Message": "Authorization header ('Bearer token') not found" })
    // }


    // //Check if token is expired if it is then throw 401
    // if (req.headers.authorisation && req.headers.authorisation.exp < dateNow.getTime() / 1000) {
    //     return res.status(401).json({ "Error": true, "Message": "JWT token has expired" })
    // }

    //TODO: Check if JWT token is valid if it is not then throw 401

    //TODO: Check if authorisation header is malformed

    (queryParameter.limit ? req.db.from('rankings').select(propertiesToReturn).where(filter).limit(queryParameter.limit) :
     req.db.from('rankings').select(propertiesToReturn).where(filter)).then((rows) => {
        return res.status(200).json({rows});

    }).catch((err) => {
        return res.json({ "Error": true, "Message": err.Message })
    })
}



module.exports = getFactors;