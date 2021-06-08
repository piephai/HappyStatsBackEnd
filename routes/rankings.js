/* Get rankings */
async function getRankings(req, res, next) {

    var queryParameter = req.query;
    let rankings = [];

    //Check if query parameter of country contain only letters if it does not then send back a 400 response
    if (queryParameter.country) {
        if (queryParameter.country.match(/\d/)) {
            res.status(400).json({ "Error": true, "Message": "Invalid country format. Country query parameter cannot contain numbers" })
        }
    }
    //Check if query paramter of year contain only numbers if does not then send back a 400 response
    if (queryParameter.year) {
        if (!(queryParameter.year.match(/^[0-9]+$/)) || queryParameter.year.length != 4) {
            res.status(400).json({ "Error": true, "Message": "Invalid year format. Format must be yyyy" })
        }
    }
    //Check if there are more than 2 query parameters if there is send back a 400 response
    if (Object.keys(queryParameter).length > 2) {
        res.status(400).json({ "Error": true, "Message": "Invalid query parameters. Only year and country are permitted" })
    }

    else {
        req.db.from('rankings').select("rank", "country", "score", "year").then((rows) => {
            if (Object.keys(queryParameter).length == 0) {

                //Send back the status code of 200 since response was successful
                res.status(200).json({ rows });
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
}


module.exports = getRankings;