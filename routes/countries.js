async function getRankings(req, res, next) {

    if (Object.keys(req.query).length > 0) {
        res.status(400).json({ "Error": true, "Message": "Invalid query parameters. Query parameters are not permitted" })
    }

    else {
        req.db.from('rankings').select("country").then((rows) => {
            res.status(200).json({ rows });
        }).catch((err) => {
            res.json({ "Error": true, "Message": err.Message })

        })
    }




}

module.exports = getRankings;