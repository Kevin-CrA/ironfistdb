const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require("./auth");

const Admin = require("./db/adminModel");
const User = require("./db/userModel");
//module.exports = router;


// body parser configuration
app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Connection successful" });
  next();
});


  // require database connection 
  const dbConnect = require("./db/dbConnect");
  // execute database connection 
  dbConnect();
  
  // Configurar cabeceras y cors
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
    res.setHeader('Allow', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
    next();
  });


//GET all users
app.get("/users", async (request, response) => {
 /* response.json({ message: "Connection successful" });*/

 //CORS access
 response.setHeader('Access-Control-Allow-Origin', '*');
 response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
 response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
 response.setHeader('Access-Control-Allow-Credentials', true); // If needed>

  const users = await User.find();

  response.json(users);



});

//GET individual user
app.get("/users/:id", async (req, res) => {

   //CORS access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
  res.setHeader('Access-Control-Allow-Credentials', true); // If needed

	try {
		const user = await User.findOne({ id: req.params.id })
		res.json(user)
	} catch {
		res.status(404)
		res.json({ error: "User doesn't exist!" })
	}
})


//PATCH individual user information
app.patch("/users/:id", async (req, res) => {
   //CORS access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
  res.setHeader('Access-Control-Allow-Credentials', true); // If needed

	try {
		const user = await User.findOne({ id: req.params.id })

		if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10)
    }
		if (req.body.email) {
			user.email = req.body.email
		}
		if (req.body.id) {
			user.id = req.body.id
		}
		if (req.body.active) {
			user.active = req.body.active
		}

		await user.save()
		res.json(user)
	} catch {
		res.status(404)
		res.json({ error: "User doesn't exist!" })
	}
})


//DELETE individual user
app.delete("/users/:id", async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
  res.setHeader('Access-Control-Allow-Credentials', true); // If needed
	try {
		await User.deleteOne({ id: req.params.id })
		res.status(204).send()
	} catch {
		res.status(404)
		res.json({ error: "User doesn't exist!" })
	}
})


// register endpoint
app.post("/register", (request, response) => {
 


  // hash the password
  bcrypt
  .hash(request.body.password, 10)
  .then((hashedPassword) => {
    // create a new user instance and collect the data
    const user = new User({
        id: request.body.id,
        email: request.body.email,
        password: hashedPassword,
        active: request.body.active,
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
          message: "Password was not been hashed successfully",
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
  
  
  
  //--------------------------------------------------------------------------------------------------------------------------------//
  

  
  //GET all admins
app.get("/admins", async (request, response) => {
  /* response.json({ message: "Connection successful" });*/
 
  //CORS access
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
  response.setHeader('Access-Control-Allow-Credentials', true); // If needed>
 
   const admins = await Admin.find();
 
   response.json(admins);
 
 
 
 });
 
 //GET individual admin
 app.get("/admins/:id", async (req, res) => {
 
    //CORS access
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
   res.setHeader('Access-Control-Allow-Credentials', true); // If needed
 
   try {
     const admin = await Admin.findOne({ id: req.params.id })
     res.json(admin)
   } catch {
     res.status(404)
     res.json({ error: "Admin doesn't exist!" })
   }
 })
 
 
 //PATCH individual user information
 app.patch("/admins/:id", async (req, res) => {
    //CORS access
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
   res.setHeader('Access-Control-Allow-Credentials', true); // If needed
 
   try {
     const admin = await Admin.findOne({ id: req.params.id })
 
     if (req.body.password) {
       admin.password = await bcrypt.hash(req.body.password, 10)
     }
     if (req.body.email) {
       admin.email = req.body.email
     }
     if (req.body.id) {
       admin.id = req.body.id
     }

 
     await admin.save()
     res.json(admin)
   } catch {
     res.status(404)
     res.json({ error: "Admin doesn't exist!" })
   }
 })
 
 
 
 //DELETE individual admin
 app.delete("/admins/:id", async (req, res) => {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
   res.setHeader('Access-Control-Allow-Credentials', true); // If needed
   try {
     await Admin.deleteOne({ id: req.params.id })
     res.status(204).send()
   } catch {
     res.status(404)
     res.json({ error: "Admin doesn't exist!" })
   }
 })
 
 
 
 
 
 
 // register admin endpoint
 app.post("/registeradmin", (request, response) => {
  
   
   // hash the password
   bcrypt
   .hash(request.body.password, 10)
   .then((hashedPassword) => {
     // create a new user instance and collect the data
     const admin = new Admin({
         id: request.body.id,
         email: request.body.email,
         password: hashedPassword
       });
       
       // save the new admin
       admin
       .save()
       // return success if the new user is added to the database successfully
       .then((result) => {
           response.status(201).send({
             message: "Admin Created Successfully",
             result,
           });
         })
         // catch error if the new user wasn't added successfully to the database
         .catch((error) => {
           response.status(500).send({
             message: "Error creating admin",
             error,
           });
         });
       })
       // catch error if the password hash fails
       .catch((e) => {
         response.status(500).send({
           message: "Password was not been hashed successfully",
           e,
         });
       });
     });
     
 
     // loginadmin endpoint
     app.post("/loginadmin", (request, response) => {
       // check if email exists
       Admin.findOne({ email: request.body.email })
       
       // if email exists
       .then((admin) => {
         // compare the password entered and the hashed password found
         bcrypt
         .compare(request.body.password, admin.password)
         
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
           adminId: admin._id,
           adminEmail: admin.email,
         },
         "RANDOM-TOKEN",
         { expiresIn: "24h" }
         );
         
         //   return success response
         response.status(200).send({
           message: "Login Successful",
           email: admin.email,
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
