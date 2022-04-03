// pwd 12345

const mysql = require("mysql");
const jwt =   require("jsonwebtoken"); 
const bcrypt = require("bcryptjs");
const {promisify} = require("util");

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST, // or ip adress of server
    user: process.env.DATABASE_USER,
    database: process.env.DATABASE
});

db.connect((err) => {
    if(err) {
    console.log("Something went wrong with mysql");        
    }

});
 

exports.login = async (req, res) => {
    try {
        let {email, password} = req.body;
        if(!email || !password) {
             return res.status(400).render("login", { 
                "message" : "Please provide email or password !"
            })
        }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
       
        if(results.length == 0) {
            return res.status(401).render("register", {
                message: "The user does not exist! Please register"
            })
        }
        if(!(await bcrypt.compare(password, results[0].password)) ) {
             return res.status(401).render("login", {
                message: "Email or password is incorrect"
                
            })
        }
        else {
            let id = results[0].id;
  
            const token = jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
           

           const cookieOptions = {
            expires: new Date (Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
            // to convert into miliseconds
            httpOnly: true
           };

           res.cookie("jwt", token, cookieOptions);
           return res.status(200).redirect("/");
        }
    });      
        
    } catch(err) {
        console.log(err);
    }
}

exports.register = (req, res) => {
    /*
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let passwordConfirm = req.body.passwordConfirm;
    */
    let {name, email, password, passwordConfirm} = req.body;
    if(!name || !email || !password || !passwordConfirm) {
       return res.status(400).render("register", {
            "message": "Please fill in all the form fields"
        })
    }


                                                         
    db.query("SELECT email FROM users WHERE email = ?", [email], async (err, results) => {
        if(err) {
            console.log(err);
        }
        if(results.length > 0) {
            return res.render("register", {
                "message": "This email is already in use"
            });
        } else if(password !== passwordConfirm) {
            return res.render("register", {
                "message": "Password do not match"
            });
        }


        let hashedPassword = await bcrypt.hash(password, 8);
        db.query("INSERT INTO users SET ?", {name : name, email: email, password: hashedPassword}, (err, results) => {
            if(err) {
                console.log(err);
            } else {
            
               return res.render("register", {
                    "message": "User registered"
                })
            }
        } );
    });
};

exports.isLoggedIn = async (req, res, next) => {
   
    if(req.cookies.jwt) {
        try {

             const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET); // syncrchronous way: 
         /*  version 2, asyncrchronous way: 
              let decoded = "";
              jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, data) => {
                 decoded = data; // asyncrchronous way
                   //{ id: 5, iat: 1647248129, exp: 1655024129 }  
                   optional expiration, or issuer are valid.         
              });      
*/
            // check if the user still exists
            db.query("SELECT * FROM users WHERE id = ?", [decoded.id], (err, results) => {
               // console.log(results);
                if(results.length == 0) {
                   return next();
                }
                req.user = results[0];
                return next();
            })
        } catch (error) {
            console.log(error);
            return next();
        }
    } else {
        next();
    }   
}


exports.logout = async (req, res) => {
    res.cookie("jwt", "logout", {
        expires: new Date(Date.now() + 2 * 1000 ), // expires in 2 sec
        httpOnly: true
    });

   return res.status(200).redirect("/")
}