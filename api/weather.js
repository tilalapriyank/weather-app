const express = require("express");
const path = require("path");
const fs = require("fs");
const requests = require("request");

const app = express();
const port = 3000;

const homeFile = fs.readFileSync(path.join(__dirname, "../public/home.html"), "utf-8");

const replaceVal = (tempVal, orgVal) => {
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

app.get("/", (req, res) => {
  const city = req.query.city || "Ahmedabad";

  requests(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=e908c54ed0ee12a1326628fb12ca7032`
  )
    .on("data", (chunk) => {
      const objdata = JSON.parse(chunk);
      const arrData = [objdata];
      const realTimeData = arrData
        .map((val) => replaceVal(homeFile, val))
        .join("");
      res.setHeader("Content-Type", "text/html");
      res.status(200).send(realTimeData);
    })
    .on("end", (err) => {
      if (err) {
        console.log("Connection closed due to errors", err);
        res.status(500).send("Error fetching weather data");
      }
    });
});

app.listen(port, () => {
  console.log(`Weather app listening at http://localhost:${port}`);
});
