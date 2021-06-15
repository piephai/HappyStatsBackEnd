const getCountries = (req, res, next) => {

    if (Object.keys(req.query).length > 0) {
        res.status(400).json({ "Error": true, "Message": "Invalid query parameters. Query parameters are not permitted" })
    }

    else {
      
        req.db.from('rankings').select("country").distinct().orderBy('country').then((rows) => {
            let countries = [];
            if (rows.length > 0){
                for(let row of rows){
                    countries.push(row.country);
                }
                
            }
            return res.status(200).json( countries );
            
        }).catch((err) => {
            return res.json({ "error": true, "message": err.Message })

        })
    }




}

module.exports = getCountries;