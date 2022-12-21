const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { localsName } = require('ejs');

// database configuration
const dbConfig = {
  host: 'db',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
}

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

  app.set('view engine', 'ejs');

  app.use(bodyParser.json());

  app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.listen(3000);
console.log('Server is listening on port 3000');

app.get('/', (req, res) =>{
  res.redirect('/home'); //this will call the /anotherRoute route in the API
});

app.get('/home', (req, res) => {
  res.render('pages/main.ejs', {
  results:[],
  });
});

app.get('/main', (req,res) => {
const Bsearch = req.query.brewSearch;
axios({
url: `https://api.openbrewerydb.org/breweries`,
    method: 'GET',
    dataType:'json',
    params: {
        "by_city": String(Bsearch),   
        "per_page": 50,
    }
})
.then(results => {
    console.log(results); // the results will be displayed on the terminal if the docker containers are running
   // Send some parameters
   res.render('pages/main.ejs',{
    results,
   });
})
.catch(error => {
// Handle errors
console.log(error)
res.render('pages/main.ejs', {
  results:[],
  error: true,
  message: error.message,
});
})
});

app.get('/reviews', (req, res) => {

  db.any("SELECT * FROM reviews")
    .then((data) => {
      console.log("reviews",data)
      res.render("pages/reviews.ejs", {data : data})
    })
    .catch((err) => {
            console.log(err);
            res.locals.message = err;
            res.locals.error = "danger";
    });
});

app.post('/addreview', (req, res) => {
    var m = new Date();
    var dateString =
    m.getUTCFullYear() + "/" +
    ("0" + (m.getUTCMonth()+1)).slice(-2) + "/" +
    ("0" + m.getUTCDate()).slice(-2);

    const brewName = req.body.brewery_name;
    const review_ = req.body.review;

    db.any("INSERT INTO reviews (brewery_name, review, reviewDate) VALUES ($1, $2, $3)", [brewName, review_, dateString])
        .then((data) => {
            console.log("Join programs join", data)
            res.redirect("/reviews")
        })
        .catch((err) => {
            console.log(err);
            res.locals.message = err;
            res.locals.error = "danger";
        });
});