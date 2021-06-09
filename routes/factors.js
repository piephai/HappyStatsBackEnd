/* Get rankings */
async function getFactors(req, res, next) {

    const queryParameter = req.query;
    let factors = [];
    const dateNow = new Date();

    //Check if query parameter of country contain only letters if it does not then send back a 400 response
    if (queryParameter.country) {
        if (queryParameter.country.match(/\d/)) {
            return res.status(400).json({ "Error": true, "Message": "Invalid country format. Country query parameter cannot contain numbers" })
        }
    }

    if (queryParameter.limit) {
        if (queryParameter.limit.match(/^[1-9]\d*$/)) {
            return res.status(400).json({ "Error": true, "Message": "Invalid limit query. Limit must be a positive number" })
        }
    }
    //Check if query paramter of year contain only numbers if does not then send back a 400 response
    if (queryParameter.year) {
        if (!(queryParameter.year.match(/^[0-9]+$/)) || queryParameter.year.length != 4) {
            return res.status(400).json({ "Error": true, "Message": "Invalid year format. Format must be yyyy" })
        }
    }

    //Check if there are more than 2 query parameters if there is send back a 400 response
    if (Object.keys(queryParameter).length > 2) {
        return res.status(400).json({ "Error": true, "Message": "Invalid query parameters. Only limit and country are permitted" })
    }

    //Check if auth header is missing if it is then throw 401
    if (!req.headers.authorisation || req.headers.authorisation.indexOf('Bearer ' === -1)) {
        return res.status(401).json({ "Error": true, "Message": "Authorization header ('Bearer token') not found" })
    }


    //Check if token is expired if it is then throw 401
    if (req.headers.authorisation && req.headers.authorisation.exp < dateNow.getTime() / 1000) {
        return res.status(401).json({ "Error": true, "Message": "JWT token has expired" })
    }

    //TODO: Check if JWT token is valid if it is not then throw 401

    //TODO: Check if authorisation header is malformed


    req.db.from('rankings').select("rank", "country", "score", "economy", "family", "health", "freedom", "generosity", "trust").then((rows) => {
        return res.status(200).json({ rows });
        if (Object.keys(queryParameter).length == 0) {

            //Send back the status code of 200 since response was successful
            return res.status(200).json({ rows });
        }
        else {
            //Iterate through each row to find filter for the paramters
            rows.forEach(item => {
                if (queryParameter.country) {
                    if (item.country === queryParameter.country) {
                        if (queryParameter.year) {
                            if (item.year == queryParameter.year) {
                                rankings.push(item);
                            }
                        }
                        else {
                            rankings.push(item);
                        }
                    }
                }
                if (queryParameter.year && !queryParameter.country) {
                    if (item.year == queryParameter.year) {
                        console.log(queryParameter.year);
                        rankings.push(item);
                    }
                }

            })

            //Send back the status code of 200 since response was successful
            res.status(200).json({ rankings });
        }
    }).catch((err) => {
        res.json({ "Error": true, "Message": err.Message })
    })
}



module.exports = getFactors;