const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const errorController = require("./controllers/error");
//import routes
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

//db store url
const MONGODB_URI =
  "mongodb+srv://sabbir:iutcse36@nodejs-gncgw.mongodb.net/shop?retryWrites=true&w=majority";

//models
const User = require("./models/user");

//creating an express app
const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions"
});

//adding templating engine
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

//using routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false })
  .then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: "Sabbir",
          email: "test@test.com",
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    console.log("Mongoose Connected");
    app.listen(3000);
  })
  .catch(err => console.log(err));
