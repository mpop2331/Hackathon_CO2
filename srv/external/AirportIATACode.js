const cds = require("@sap/cds");

class AirportIATACode extends cds.RemoteService {
  async init() {
    this.before("READ", "*", (req) => {
      if (req.target.name === "sap.bootcamp.IATACode") {
        req.myQuery = req.query;
        const queryParams = parseQueryParams(req.query.SELECT);
        console.log(req.query.SELECT);
        if(Object.keys(queryParams).length === 0){
            req.query = "GET /";
        }else{
            req.query = "GET /?query="+queryParams;
        }

       
      }
    });
    this.on("READ", "*", async (req, next) => {       
        if (req.target.name === "sap.bootcamp.IATACode") {
            const response = await next(req);
            var items = parseResponseCountries(response);
            return items;
        }
    });
    super.init();
  }
}

function parseQueryParams(select) {
    if (!select.where) {
        return {};
      }
      const [property, operator, value] = select.where;
      if (operator !== "=") {
        throw new Error(`Expression with '${operator}' is not allowed.`);
      }
      const parsed = {};
      if (property && value) {
        parsed[property.ref[0]] = value.val;
      }
      return value.val;
}

function parseResponseCountries(response) {
  var content = [];

  response.content.forEach((c) => {
      if(c.iata != null){
        var i = new Object();
        i.country = c.country.name;
        i.city = c.servedCity;
        i.airportName = c.name;
        i.iataCode = c.iata;
        content.push(i);
      }
  });

  return content;
}

module.exports = AirportIATACode;