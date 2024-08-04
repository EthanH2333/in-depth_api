const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer');
const cors = require('cors');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

const app = express()
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const upload = multer();

// Create a connection to the database
const connection = mysql.createConnection({
    host: "dpwa.cluster-c389wxywhz8p.ca-central-1.rds.amazonaws.com",
    user: "dpwa",
    password: "DepthPWA2024!",
    database: "dpwa",
    waitForConnections: true,
});


const port = 5100

//listening the port
app.listen(port, ()=> {
    console.log(`API is now running on port ${port}`);
    // Connect to the database
    /*
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err.stack);
            return;
        }
        console.log('Connected to the database as id ' + connection.threadId);
    });
    // Close the connection
    connection.end((err) => {
        if (err) {
        console.error('Error closing the connection:', err.stack);
        return;
        }
        console.log('Connection closed');
    });
    */
})

//Here is the call back function
app.get('/', (req, res) => res.json("api is running"))

// ReRgister with phone for user
app.post('/register_phone/user', upload.none(), (req, res) => {
    const { number, password, date, name } = req.body;
    console.log(number, password, date, name);
    const plan = 'basic';
    const expired = -1;
    const lastLogin = date;

    // Check if the user already exists by checking the phone number
    const checkQuery = 'SELECT * FROM depth_user WHERE phone_number = ?';

    connection.query(checkQuery, [number], (err, results) => {
        if (err) {
            console.error('Error checking existence:', err.stack);
            return res.status(500).json({
                status: 'error',
                message: err.message,
            });
        }

        if (results.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Account already exists',
            });
        }

        // If the user does not exist, proceed with the insertion
        const iQuery = `INSERT INTO depth_user (phone_number, password, name, signup_date, login_date, plan, expired_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const queryParams = [number, password, name, date, lastLogin, plan, expired];

        connection.query(iQuery, queryParams, (err, results) => {
            if (err) {
                console.error('Error inserting data:', err.stack);
                return res.status(500).json({
                    status: 'error',
                    message: err.message,
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Account registered successfully',
                id: results.insertId,
            });
        });
    });
});

// Register with phone for researcher
app.post('/register_phone/researcher', upload.none(), (req, res) => {
    const { number, password, date, name } = req.body;
    console.log(number, password, date, name);
    const plan = 'basic';
    const expired = -1;
    const lastLogin = date;

    // Check if the user already exists by checking the phone number
    const checkQuery = 'SELECT * FROM Researcher WHERE phone_number = ?';

    connection.query(checkQuery, [number], (err, results) => {
        if (err) {
            console.error('Error checking existence:', err.stack);
            return res.status(500).json({
                status: 'error',
                message: err.message,
            });
        }

        if (results.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Account already exists',
            });
        }

        // If the researcher does not exist, proceed with the insertion
        const iQuery = `INSERT INTO Researcher (phone_number, password, name, signup_date, login_date, plan, expired_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const queryParams = [number, password, name, date, lastLogin, plan, expired];

        connection.query(iQuery, queryParams, (err, results) => {
            if (err) {
                console.error('Error inserting data:', err.stack);
                return res.status(500).json({
                    status: 'error',
                    message: err.message,
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Account registered successfully',
                id: results.insertId,
            });
        });
    });
});
// verification code - email
app.post('/send-email', (req, res) => {

    sgMail.setApiKey('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');
    
    const { to, content } = req.body;
  
    // Validate the request body
    if (!to || !content) {
      return res.status(400).send('Missing required fields: to, content');
    }
  
    const msg = {
      to,
      from: 'depthlab@uwo.ca', 
      subject: 'Send Grid forgot password reset code',
      html: `<strong>${content}</strong>`,
    };
  
    sgMail
      .send(msg)
      .then((response) => {
        console.log('Email sent successfully!');
        console.log(response);
        res.send('Email sent successfully!');
      })
      .catch((error) => {
        console.error('Error sending email: ', error);
        if (error.response) {
          console.error('Error response body: ', error.response.body);
        }
        res.send('Failed to send email.');
      });
  });


  // Register with email, for user
app.post('/register_email/user', upload.none(), (req, res) => {
    const { email, password, date, name } = req.body;
    console.log(email, password, date, name);
    const plan = 'basic';
    const expired = -1;
    const lastLogin = date;

    // Check if the user already exists by checking the phone number
    const checkQuery = 'SELECT * FROM depth_user WHERE email = ?';

    connection.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error('Error checking existence:', err.stack);
            return res.status(500).json({
                status: 'error',
                message: err.message,
            });
        }

        if (results.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Account already exists',
            });
        }

        // If the researcher does not exist, proceed with the insertion
        const iQuery = `INSERT INTO depth_user (email, password, name, signup_date, login_date, plan, expired_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const queryParams = [email, password, name, date, lastLogin, plan, expired];

        connection.query(iQuery, queryParams, (err, results) => {
            if (err) {
                console.error('Error inserting data:', err.stack);
                return res.status(500).json({
                    status: 'error',
                    message: err.message,
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Account registered successfully',
                id: results.insertId,
            });
        });
    });
});


// Register with email, for researcher
app.post('/register_email/researcher', upload.none(), (req, res) => {
    const { email, password, date, name } = req.body;
    console.log(email, password, date, name);
    const plan = 'basic';
    const expired = -1;
    const lastLogin = date;

    // Check if the user already exists by checking the phone number
    const checkQuery = 'SELECT * FROM Researcher WHERE email = ?';

    connection.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error('Error checking existence:', err.stack);
            return res.status(500).json({
                status: 'error',
                message: err.message,
            });
        }

        if (results.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Account already exists',
            });
        }

        // If the researcher does not exist, proceed with the insertion
        const iQuery = `INSERT INTO Researcher (email, password, name, signup_date, login_date, plan, expired_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const queryParams = [email, password, name, date, lastLogin, plan, expired];

        connection.query(iQuery, queryParams, (err, results) => {
            if (err) {
                console.error('Error inserting data:', err.stack);
                return res.status(500).json({
                    status: 'error',
                    message: err.message,
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Account registered successfully',
                id: results.insertId,
            });
        });
    });
});

// login with phone for user
app.post('/login_phone/user', upload.none(), (req, res) => {
    const { number, password, date } = req.body;

    // Check if the user already exists by checking the phone number
    const checkQuery = 'SELECT user_id, name, password FROM depth_user WHERE phone_number = ?';

    connection.query(checkQuery, [number], (err, results) => {
        if (err) {
            console.error('Error checking existence:', err.stack);
            return res.status(500).json({
                status: 'error',
                message: err.message,
            });
        }

        if (results.length > 0) {
            const { user_id:id, name, password: storedPassword } = results[0];
            if (storedPassword === password) {
                // If the password matches, update the last_login in the Researcher table
                const updateQuery = 'UPDATE depth_user SET login_date = ? WHERE phone_number = ?';
                connection.query(updateQuery, [date, number], (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating last login:', updateErr.stack);
                        return res.status(500).json({
                            status: 'error',
                            message: updateErr.message,
                        });
                    }

                    return res.status(200).json({
                        status: 'success',
                        message: 'Login successful',
                        data: {
                            id,
                            name
                        }
                    });
                });
            } else {
                // If the password does not match, send an error message
                return res.status(401).json({
                    status: 'error',
                    message: 'Incorrect password or phone number',
                });
            }
        } else {
            return res.status(400).json({
                status: 'error',
                message: 'Account doesn\'t exist',
            });
        }
    });
});

// login with phone for researcher
app.post('/login_phone/researcher', upload.none(), (req, res) => {
    const { number, password, date } = req.body;

    // Check if the user already exists by checking the phone number
    const checkQuery = 'SELECT user_id, name, password FROM Researcher WHERE phone_number = ?';

    connection.query(checkQuery, [number], (err, results) => {
        if (err) {
            console.error('Error checking existence:', err.stack);
            return res.status(500).json({
                status: 'error',
                message: err.message,
            });
        }

        if (results.length > 0) {
            const { user_id:id, name, password: storedPassword } = results[0];
            if (storedPassword === password) {
                // If the password matches, update the last_login in the Researcher table
                const updateQuery = 'UPDATE Researcher SET login_date = ? WHERE phone_number = ?';
                connection.query(updateQuery, [date, number], (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating last login:', updateErr.stack);
                        return res.status(500).json({
                            status: 'error',
                            message: updateErr.message,
                        });
                    }

                    return res.status(200).json({
                        status: 'success',
                        message: 'Login successful',
                        data: {
                            id,
                            name
                        }
                    });
                });
            } else {
                // If the password does not match, send an error message
                return res.status(401).json({
                    status: 'error',
                    message: 'Incorrect password or phone number',
                });
            }
        } else {
            return res.status(400).json({
                status: 'error',
                message: 'Account doesn\'t exist',
            });
        }
    });
});

// login with email for user
app.post('/login_email/user', upload.none(), (req, res) => {
    const { email, password, date } = req.body;

    // Check if the user already exists by checking the phone number
    const checkQuery = 'SELECT user_id, name, password FROM depth_user WHERE email = ?';

    connection.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error('Error checking existence:', err.stack);
            return res.status(500).json({
                status: 'error',
                message: err.message,
            });
        }

        if (results.length > 0) {
            const { user_id:id, name, password: storedPassword } = results[0];
            if (storedPassword === password) {
                // If the password matches, update the last_login in the Researcher table
                const updateQuery = 'UPDATE depth_user SET login_date = ? WHERE email = ?';
                connection.query(updateQuery, [date, email], (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating last login:', updateErr.stack);
                        return res.status(500).json({
                            status: 'error',
                            message: updateErr.message,
                        });
                    }

                    return res.status(200).json({
                        status: 'success',
                        message: 'Login successful',
                        data: {
                            id,
                            name
                        }
                    });
                });
            } else {
                // If the password does not match, send an error message
                return res.status(401).json({
                    status: 'error',
                    message: 'Incorrect email or password',
                });
            }
        } else {
            return res.status(400).json({
                status: 'error',
                message: 'Account doesn\'t exist',
            });
        }
    });
});

// login with email for researcher
app.post('/login_email/researcher', upload.none(), (req, res) => {
    const { email, password, date } = req.body;

    // Check if the user already exists by checking the phone number
    const checkQuery = 'SELECT user_id, name, password FROM Researcher WHERE email = ?';

    connection.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error('Error checking existence:', err.stack);
            return res.status(500).json({
                status: 'error',
                message: err.message,
            });
        }

        if (results.length > 0) {
            const { user_id:id, name, password: storedPassword } = results[0];
            if (storedPassword === password) {
                // If the password matches, update the last_login in the Researcher table
                const updateQuery = 'UPDATE Researcher SET login_date = ? WHERE email = ?';
                connection.query(updateQuery, [date, email], (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating last login:', updateErr.stack);
                        return res.status(500).json({
                            status: 'error',
                            message: updateErr.message,
                        });
                    }

                    return res.status(200).json({
                        status: 'success',
                        message: 'Login successful',
                        data: {
                            id,
                            name
                        }
                    });
                });
            } else {
                // If the password does not match, send an error message
                return res.status(401).json({
                    status: 'error',
                    message: 'Incorrect email or password',
                });
            }
        } else {
            return res.status(400).json({
                status: 'error',
                message: 'Account doesn\'t exist',
            });
        }
    });
});

// Update password for researcher
app.post('/update_password/researcher', upload.none(), (req, res) => {
    const { password, phonenumber, check } = req.body;
    // Proceed with updating the password
    const updateQuery = `UPDATE Researcher SET password = ? WHERE ${check} = ?`;
    connection.query(updateQuery, [password, phonenumber], (updateErr, results) => {
        if (updateErr) {
            console.error('Error updating password:', updateErr.stack);
            return res.status(500).json({
                status: 'error',
                message: updateErr.message,
            });
        }

        // Check if any rows were affected (i.e., the phone number exists in the database)
        if (results.affectedRows > 0) {
            return res.status(200).json({
                status: 'success',
                message: 'Password change successful',
            });
        } else {
            return res.status(400).json({
                status: 'error',
                message: 'Account doesn\'t exist',
            });
        }
    });
});

// Update password for user
app.post('/update_password/user', upload.none(), (req, res) => {
    const { password, phonenumber, check } = req.body;
    // Proceed with updating the password
    const updateQuery = `UPDATE depth_user SET password = ? WHERE ${check} = ?`;
    connection.query(updateQuery, [password, phonenumber], (updateErr, results) => {
        if (updateErr) {
            console.error('Error updating password:', updateErr.stack);
            return res.status(500).json({
                status: 'error',
                message: updateErr.message,
            });
        }

        // Check if any rows were affected (i.e., the phone number exists in the database)
        if (results.affectedRows > 0) {
            return res.status(200).json({
                status: 'success',
                message: 'Password change successful',
            });
        } else {
            return res.status(400).json({
                status: 'error',
                message: 'Account doesn\'t exist',
            });
        }
    });
});

/*
app.post('/register/researcher', (req, res) => {
    const { number, password, date } = req.body;
    const plan = 'basic';
    const expired = -1;
    const lastLogin = date;

    //Check if the user already exit or not by checking the phone number
  
    const iQuery = `INSERT INTO researcher (phone_number, password, signup_date, last_login, plan, expired_date) VALUES (?, ?, ?, ?, ?, ?)`;
    const queryParams = [number, password, date, lastLogin, plan, expired];
  
    connection.connect((err) => {
        if (err) {
          console.error('Error connecting to the database:', err.stack);
          return res.status(500).json({
            status: 'error',
            message: err.message,
          });
        }
        
        //Doing the insert
        connection.query(iQuery, queryParams, (err, results) => {
          if (err) {
            console.error('Error inserting data:', err.stack);
            connection.end();
            return res.status(500).json({
              status: 'error',
              message: err.message,
            });
          }
    
            connection.end((endErr) => {
                if (endErr) {
                    console.error('Error closing the connection:', endErr.stack);
                    return res.status(500).json({
                    status: 'error',
                    message: endErr.message,
                    });
                }

                res.status(200).json({
                    status: 'success',
                    message: 'Researcher registered successfully',
                    researcherId: results.insertId,
                });
            });
        });
    });
});*/

/*
//userRegister 
app.post('/register/user', (req, res) => {
    const { number, password, date, db} = req.body;
    const finished_BQ = -1;
    const consent = -1;
    const lastLogin = date;
  
    const iQuery = `INSERT INTO ${db} (phone_number, password, signup_date, last_login, finished_BQ, consent) VALUES (?, ?, ?, ?, ?, ?)`;
    const queryParams = [number, password, date, lastLogin, finished_BQ, consent];
  
    connection.connect((err) => {
        if (err) {
          console.error('Error connecting to the database:', err.stack);
          return res.status(500).json({
            status: 'error',
            message: err.message,
          });
        }
    
        connection.query(iQuery, queryParams, (err, results) => {
          if (err) {
            console.error('Error inserting data:', err.stack);
            connection.end();
            return res.status(500).json({
              status: 'error',
              message: err.message,
            });
          }
    
          connection.end((endErr) => {
            if (endErr) {
              console.error('Error closing the connection:', endErr.stack);
              return res.status(500).json({
                status: 'error',
                message: endErr.message,
              });
            }
    
            res.status(200).json({
              status: 'success',
              message: 'User registered successfully',
              researcherId: results.insertId,
            });
          });
        });
    });
});
*/


//clone the pwa
app.post('/copy', upload.none(), (req, res) => {
    //using body parser to get the name variable 
    const name = req.body.name;

    if (!name) {
        return res.status(400).send('Name parameter is required.');
    }

    const src = '/var/www/html/test-pwa/indepthpwa/build/web';
    const dest = '/var/www/html/PWA/web';
    const pwadir = `/var/www/html/PWA/${name}`;

    try {
        // Check if pwadir exists and remove it
        if (fs.existsSync(pwadir)) {
            execSync(`rm -rf ${pwadir}`);
        }

        // Command to copy and rename
        const copyCmd = `cp -r ${src} ${dest} && mv ${dest} ${pwadir}`;
        exec(copyCmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).send(`Error in copy and rename: ${error.message}`);
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return res.status(500).send(`Stderr in copy and rename: ${stderr}`);
            }

            // Modify the index.html file
            const indexPath = path.join(pwadir, 'index.html');
            if (fs.existsSync(indexPath)) {
                let data = fs.readFileSync(indexPath, 'utf8');
                let result = data.replace('<base href="/">', '<base href="">');
                fs.writeFileSync(indexPath, result, 'utf8');
                res.send("Command complete: file copied, renamed, and index.html modified.");
            } else {
                res.status(404).send("index.html not found in the new directory.");
            }
        });
    } catch (err) {
        console.error(`Server error: ${err.message}`);
        res.status(500).send(`Server error: ${err.message}`);
    }
});