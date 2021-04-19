var config = require('./config')['development'];
var express = require('express');
var app = express();
var mongoose = require('mongoose');
const sgMail = require('@sendgrid/mail');
const cors = require("cors");
app.use(cors());
//input validation 
const { check, validationResult } = require('express-validator');

//body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.static('public'));
//sgmail api
sgMail.setApiKey(config.emailapi.key);
mongoose.connect(config.database.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


//db cpnnection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


//Defining schema
var Schema = mongoose.Schema;

var UserData = new Schema({
    name: String,
    phone: Number,
    email: String
});

const User = mongoose.model('ContactFormData', UserData);


//routes 
app.get('/',(req, res) => {
    res.redirect('contactus.html');
});


//input sanitization and validation
app.post("/contact",[
    check('name').trim().escape().isLength({ min: 3 }),
    check('email').isEmail(),
    check('phone').isNumeric().isLength({max:10}),
    check('message').trim().escape().isLength({max:500})],
(req, res) => {

    if (!validationResult(req).isEmpty()) { return res.status(400).json({status:validationResult(req)})};

    //db insert data
    var myData = new User(req.body);
    myData.save()
    const {name,phone,mail} = myData;
    const message = req.body.message;

    table='<style>table,th,td{border:1px solid black}th,td{padding:10px}</style><table><tr><th>Name</th><th>Phone No.</th><th>Email</th></tr><tr><td>'+name+'</td><td>'+phone+'</td><td>'+mail+'</td></tr><tr><th colspan="3">Message</th></tr><tr><td colspan="3">'+message+'</td></tr></table>';


    //mail format 
    const msg = {
        to: 'info@redpositive.in',
        from: 'redpositive@ilvain.com',
        subject: name +' wants to contact us ',
        html: table,
    }

    sgMail.send(msg).then(() => {
                    res.json({ status: "Message Sent" });
                    console.log('Email sent')
        }).catch((error) => {
                    res.json({ status: "ERROR" });
                    console.error(error)
        })

});


app.listen(process.env.PORT, () => {
    console.log("server is up on :"+process.env.PORT)
})