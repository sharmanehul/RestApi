const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/user");
const cors = require("cors");
const nodemon = require("nodemon");
const jwt = require("jsonwebtoken");
require('dotenv').config();
app.use(cors({origin:true}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.set("view engine","ejs");

mongoose.set('strictQuery', false);
mongoose.connect(process.env.dburl)
  .then(result=>{
    app.listen(8082);
    console.log("connected");
}).catch(err=>{
    console.log(err);
});

const JWT_SECRET = process.env.JWT_SECRET;
//Question: Express Middleware to console [Timestamp] Method: URL, e.g., [2023-04-01T12:00:00.000Z] GET: /api/users,AccessToken:”eydfdflkoejkndkf”.
const logMiddleware = (req,res,next) => {
    const timeStamp = new Date().toISOString();
    const { method,url } = req;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(`[${timeStamp}] ${method}: ${url}, AccessToken: "${token}"`);
    console.log(req.headers['authorization']);
    next();
};
//Question: CRUD Operation Question
app.post("/users", (req, res) => {
    const { name, email, age, country, password } = req.body;
    const token = jwt.sign({ userName:name }, JWT_SECRET);
    const user = new User({ name, email, age, country, password,token });

    user.save()
        .then(newUser => {
            res.status(201).json({ message:"Success",newUser,token });
        })
        .catch(err => {
            res.status(400).json({ message: err.message });
        });
})


app.use((error,req,res,next)=>{
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message:message,data:data});
});

app.get("/users",(req,res)=>{
    User.find({}).then((users)=>{
        res.json(users);
    })
    .catch((err)=>{
        res.status(500).json({message: err.message})
    });
});

app.use(logMiddleware);
app.get('/users/:id',(req,res)=>{
    User.findById(req.params.id)
    .then(user=>{
        if(!user){
            res.status(404).json({message: 'User Not Found'});
        }
        else{
            res.json(user);
        }
    })
    .catch((err)=>{
        res.status(500).json({message: err.message});
    });
});

app.put('/users/:id', (req, res) => {
    const { name, email, age, country } = req.body;
    User.findByIdAndUpdate(req.params.id, { name, email, age, country }, { new: true }, '-password')
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        })
        .catch(error => {
            res.status(500).json({ message: error.message });
        });
});


app.delete('/users/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(204).end();
        })
        .catch(error => {
            res.status(500).json({ message: error.message });
        });
});