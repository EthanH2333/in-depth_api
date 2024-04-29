import express from 'express' 

const app = express()

app.listen(5001, ()=> console.log("api is now running on port 5001"))

//Here is the call back function
app.get('/', (req, res) => res.json("api is running"))