//import bodyParser from 'body-parser';

import express from 'express';
import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const app = express()
//const bodyParser = require('body-parser')

app.listen(5001, ()=> console.log("api is now running on port 5001"))

//Here is the call back function
app.get('/', (req, res) => res.json("api is running"))



app.get('/copy', (req, res) => {
    const src = '/var/www/html/test-pwa/indepthpwa/build/web';
    const dest = '/var/www/html/web';
    const test1Dir = '/var/www/html/test1';

    try {
        // Check if test1 exists and remove it
        if (fs.existsSync(test1Dir)) {
            execSync(`rm -rf ${test1Dir}`);
        }

        // Command to copy and rename
        const copyCmd = `cp -r ${src} ${dest} && mv ${dest} ${test1Dir}`;
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
            const indexPath = path.join(test1Dir, 'index.html');
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
        res.status(500).send(`Server error: ${err.message}`);
    }
});

/*
app.get('/compile', (req, res) => {
    //Got the directory at 
})
*/