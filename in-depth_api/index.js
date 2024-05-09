import express from 'express' 
//import bodyParser from 'body-parser';
import { exec } from 'child_process';

const app = express()
//const bodyParser = require('body-parser')

app.listen(5001, ()=> console.log("api is now running on port 5001"))

//Here is the call back function
app.get('/', (req, res) => res.json("api is running"))



app.get('/copy', (req, res) => {
    const src = '/var/www/html/test-pwa/indepthpwa/build/web';
    const dest = '/var/www/html/web';

    // Command to copy and rename
    const copyCmd = `cp -r ${src} ${dest} && mv ${dest} /var/www/html/test1`;

    exec(copyCmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send(`Error: ${error.message}`);
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return res.status(500).send(`Error: ${stderr}`);
        }
        res.send("Command complete");
    });
});

/*
app.get('/compile', (req, res) => {
    //Got the directory at 
})
*/