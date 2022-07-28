const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require("./auth");

const User = require("./db/userModel");
//module.exports = router;


// body parser configuration
app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Connection successful" });
  next();
});


//GET all users
app.get("/users", async (request, response) => {
 /* response.json({ message: "Connecaaaation sucaaaacessful" });*/

  const users = await User.find();

  response.json(users);

});

//GET individual user
app.get("/users/:id", async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.params.id })
		res.json(user)
	} catch {
		res.status(404)
		res.json({ error: "Post doesn't exist!" })
	}
})


//PATCH individual user information
app.patch("/users/:id", async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.params.id })

		if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10)
    }

		if (req.body.email) {
			user.email = req.body.email
		}

		await user.save()
		res.json(user)
	} catch {
		res.status(404)
		res.json({ error: "User doesn't exist!" })
	}
})




app.delete("/users/:id", async (req, res) => {
	try {
		await User.deleteOne({ _id: req.params.id })
		res.status(204).send()
	} catch {
		res.status(404)
		res.json({ error: "User doesn't exist!" })
	}
})




// require database connection 
const dbConnect = require("./db/dbConnect");
// execute database connection 
dbConnect();


// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});



// register endpoint
app.post("/register", (request, response) => {
  // hash the password
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const user = new User({
        email: request.body.email,
        password: hashedPassword,
      });

      // save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        // catch error if the new user wasn't added successfully to the database
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    // catch error if the password hash fails
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});




// login endpoint
app.post("/login", (request, response) => {
  // check if email exists
  User.findOne({ email: request.body.email })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {

          // check if password matches
          if(!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //   return success response
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            token,
          });
        })
        // catch error if password does not match
        .catch((error) => {
          response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});


// free endpoint
app.get("/free-endpoint", (request, response) => {
  response.json({ message: "You are free to access" });
});

// authentication endpoint
app.get("/auth-endpoint",auth, (request, response) => {
  response.json({ message: "You are authorized to access" });
});



module.exports = app;
