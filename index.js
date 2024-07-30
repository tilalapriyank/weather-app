const http = require("http");
const fs = require("fs");
var requests = require("request");

const homeFile = fs.readFileSync("home.html", "utf-8");

const replaceVal = (tempVal, orgVal) => {
  // Convert temperatures from Kelvin to Celsius
  let tempInCelsius = (orgVal.main.temp - 273.15).toFixed(2);
  let tempMinInCelsius = (orgVal.main.temp_min - 273.15).toFixed(2);
  let tempMaxInCelsius = (orgVal.main.temp_max - 273.15).toFixed(2);

  let temperature = tempVal.replace("{%tempval%}", tempInCelsius);
  temperature = temperature.replace("{%tempmin%}", tempMinInCelsius);
  temperature = temperature.replace("{%tempmax%}", tempMaxInCelsius);
  temperature = temperature.replace("{%location%}", orgVal.name);
  temperature = temperature.replace("{%country%}", orgVal.sys.country);
  temperature = temperature.replace("{%tempstatus%}", orgVal.weather[0].main);

  return temperature;
};

http.createServer((req, res) => {
  if (req.url == "/") {
    requests(
      `https://api.openweathermap.org/data/2.5/weather?q=Ahmedabad&appid=e908c54ed0ee12a1326628fb12ca7032`
    )
      .on("data", (chunk) => {
        const objdata = JSON.parse(chunk);
        const arrData = [objdata];
        const realTimeData = arrData
          .map((val) => replaceVal(homeFile, val))
          .join("");
        res.write(realTimeData);
      })
      .on("end", (err) => {
        if (err) return console.log("connection closed due to errors", err);
        res.end();
      });
  } else {
    res.end("File not found");
  }
}).listen(8080);
