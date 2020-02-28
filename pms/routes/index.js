var express = require('express');
var multer = require('multer');
var path = require('path');
var router = express.Router();
var mongooseee = require('mongoose');
var conn = mongooseee.Collection;
var userModule = require('../modules/user');
var departmentModule = require('../modules/department');
var adminModule = require('../modules/admin');
var compModule = require('../modules/complaint');
//var complaint=compModule.find({});
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var otpGenerator = require('otp-generator');
const { matchedData, sanitizeBody } = require('express-validator');
const { check, validationResult } = require('express-validator');
router.use(express.static(__dirname + "./public/"));
var Storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({
    storage: Storage
}).single('pic');
/* GET home page. */
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

function checkloginuser(req, res, next) {

    if (!req.session.user) {

        return res.redirect('/');

    }
    next();


}



function checkEmail(req, res, next) {
    var email_id = req.body.email;
    var checkexitemail = userModule.findOne({ email_id: email_id });
    checkexitemail.exec((err, data) => {
        if (err) throw err;
        if (data) {
            return res.render('index', { title: 'home', msg: 'Email already exists...' });
        }
        next();
    });
}

function checkEmailD(req, res, next) {
    var email_id = req.body.email;
    var checkexitemail = departmentModule.findOne({ email_id: email_id });
    checkexitemail.exec((err, data) => {
        if (err) throw err;
        if (data) {
            return res.render('index', { title: 'home', msg: 'Email already exists...' });
        }
        next();
    });
}
router.get('/', function(req, res, next) {

    if (!req.session.user) {
        res.render('index', { title: 'Home', msg: '' });

    } else {
        req.session.destroy(function(err) {
            if (err) throw err;
            res.render('index', { title: 'Home', msg: '' });
        });
    }

});

router.get('/login', function(req, res, next) {
    res.render('login', { title: 'login', msg: '', errors: '', user: '' });
});

router.post('/login', [
    check('uname', '*Required').isString().isLength({ min: 1 }),
    check('uname', '*enter email').isEmail(),
    check('upass', '*Required').trim().isString().isLength({ min: 1 }),
], function(req, res, next) {
    var email = req.body.uname;
    var password = req.body.upass;
    const errors = validationResult(req);
    console.log(errors.mapped());
    if (!errors.isEmpty()) {
        const user = matchedData(req);
        res.render('login', { title: ' ', msg: '', errors: errors.mapped(), user: user });
    } else {
        if (email == "ashkurkute@gmail.com" && password == "admin123") {
            req.session.user = email;
            console.log(req.session.user);
            res.redirect('/adminpage');
        } else {
            var checkuser = userModule.findOne({ email_id: email });
            checkuser.exec((err, data) => {
                if (err) throw err;
                if (data != null) {
                    if (bcrypt.compareSync(password, data.password)) {
                        req.session.user = email;
                        res.redirect('/userpage');
                    } else {
                        res.render('login', { title: ' ', msg: 'Enter Correct Password', errors: errors.mapped(), user: '' });
                    }
                } else {
                    res.render('login', { title: ' ', msg: 'E-mail not registered', errors: errors.mapped(), user: '' });
                }
            });
        }

    }

});

router.post('/departmentlogin', [
    check('uname', '*Required').isString().isLength({ min: 1 }),
    check('uname', '*enter email').isEmail(),
    check('upass', '*Required').trim().isString().isLength({ min: 1 }),
], function(req, res, next) {

    var email = req.body.uname;
    var password = req.body.upass;
    const errors = validationResult(req);
    console.log(errors.mapped());
    if (!errors.isEmpty()) {
        const user = matchedData(req);
        res.render('login', { title: ' ', msg: '', errors: errors.mapped(), user: user });
    } else {
        var checkuser = departmentModule.findOne({ email_id: email });


        checkuser.exec((err, data) => {
            if (err) throw err;
            if (data != null) {
                var getPassword = data.password;
                if (bcrypt.compareSync(password, getPassword)) {
                    req.session.user = email;
                    res.redirect('/departmentpage');
                } else {
                    res.render('login', { title: 'Login', msg: 'Invalid password', errors: errors.mapped(), user: '' });
                }
            } else {
                res.render('login', { title: 'Login', msg: 'E-mail not registered', errors: errors.mapped(), user: '' });
            }

        });
    }
});

router.post('/adminlogin', function(req, res, next) {
    var email = req.body.uname;
    var password = req.body.upass;
    var loginUser = req.session.user;
    if (loginUser == "ashkurkute@gmail.com") {
        res.redirect('/adminpage');
    }
    res.render('usersignup', { title: 'Registration', msg: '', errors: '', user: '' });

});

router.get('/usersignup', function(req, res, next) {
    res.render('usersignup', { title: 'Registration', msg: '', errors: '', user: '' });
});

router.post('/usersignup', checkEmail, [
    check('uname', '*Enter Your Name').isString().isLength({ min: 1 }),
    check('date', '*Enter Your Name').isString().isLength({ min: 1 }),
    check('email', '*Enter Valid E-Mail ID').isEmail(),
    check('mobileno', '*Enter Valid Mobile NO.').isMobilePhone(),

    check('country', '*Select Country').isUppercase(),
    check('state', '*Enter your State').isUppercase(),
    check('dis', '*Enter Your District').isUppercase(),
    check('city', '*Enter your City').isUppercase(),
    check('paddr', '*Enter your Permanant address').trim().isString().isLength({ min: 1 }),
    check('raddr', '*Enter your residencial address').trim().isString().isLength({ min: 1 }),

    check('password', '*Password must be of 5 to 12 Characters').trim().isLength({ min: 5, max: 12 }),
    check('cpass').custom((value, { req }) => {
        if (value != req.body.password) {
            throw new Error('*Confirm password does not matched');
        }
        return true;
    })
], function(req, res, next) {
    const errors = validationResult(req);
    console.log(errors.mapped());
    if (!errors.isEmpty()) {
        const user = matchedData(req);
        res.render('usersignup', { title: ' user registration form', msg: '', loginUser: req.session.user, errors: errors.mapped(), user: user });
    } else {

        var full_name = req.body.uname;
        var date_birth = req.body.date;
        var email_id = req.body.email;
        var mobileno = req.body.mobileno;
        var phoneno = req.body.phoneno;
        var country = req.body.country;
        var state = req.body.state;
        var district = req.body.dis;
        var city = req.body.city;
        var permanant_addr = req.body.paddr;
        var residential_addr = req.body.raddr;
        var password = req.body.password;
        var cpassword = req.body.cpass;
        password = bcrypt.hashSync(req.body.password);
        var userDetails = new userModule({
            full_name: full_name,
            date_birth: date_birth,
            email_id: email_id,
            mobileno: mobileno,
            phoneno: phoneno,
            country: country,
            state: state,
            district: district,
            city: city,
            permanant_addr: permanant_addr,
            residential_addr: residential_addr,
            password: password,
            //  cpassword:cpassword,
            //loginvalue:loginvalue,
        });
        userDetails.save((err, doc) => {
            if (err) throw err;
            res.redirect('/');
        });
    }

});

router.get('/departmentsignup', checkloginuser, function(req, res, next) {
    res.render('departmentsignup', { title: 'registration', msg: '', user: '', errors: '', ref: '' });
});
router.post('/departmentsignup', upload, checkEmailD, [
    check('dname', '*Enter department name').isString().isLength({ min: 1 }),
    check('hname', '*Enter head of the department').isString().isLength({ min: 1 }),
    check('demail', '*Enter Valid E-Mail ID').isEmail(),
    check('dmobileno', '*Enter Valid Mobile No.').isMobilePhone(),
    check('dphoneno', '*Enter Valid  Phone no/Mobile No.').isMobilePhone(),
    check('desc', '*Required').trim().isString().isLength({ min: 1 }),

    check('dpassword', '*Password must be of 5 to 12 Characters').trim().isLength({ min: 5, max: 12 }),
    check('dcpass').custom((value, { req }) => {
        if (value != req.body.dpassword) {
            throw new Error('*Confirm password does not matched');
        }
        return true;
    })
], function(req, res, next) {
    const errors = validationResult(req);
    console.log(errors.mapped());
    if (!errors.isEmpty()) {
        const user = matchedData(req);
        res.render('departmentsignup', { title: 'complaint registration form', msg: '', errors: errors.mapped(), user: user, ref: '' });
    } else {
        var departname = req.body.dname;
        var headofdepart = req.body.hname;
        var demail_id = req.body.demail;
        var dmobileno = req.body.dmobileno;
        var dphoneno = req.body.dphoneno;
        var description = req.body.desc;
        var dpassword = req.body.dpassword;

        dpassword = bcrypt.hashSync(req.body.dpassword);
        var departDetails = new departmentModule({
            departname: departname,
            headofdepart: headofdepart,
            email_id: demail_id,
            dmobileno: dmobileno,
            dphoneno: dphoneno,
            description: description,
            password: dpassword,
            //pic:pic,
            // cpassword:dcpassword,
            // loginvalue:loginvalue,
        });
        departDetails.save((err, doc) => {
            if (err) throw err;
            res.redirect('adminpage');
        });
    }

});


router.get('/userpage', checkloginuser, function(req, res, next) {

    console.log('value!!!!!');
    console.log(req.session.user);
    res.render('userpage', { title: 'registration', loginUser: req.session.user, msg: '' });

});



router.get('/departmentpage', checkloginuser, function(req, res, next) {
    var loginUser = req.session.user;
    // console.log(loginUser);
    if (!req.session.user) {

        return res.redirect('/');

    }
    var depart = departmentModule.findOne({ email_id: loginUser });
    depart.exec(function(err, data) {
        if (err) throw err;
        console.log(data);
        console.log(data.dphoneno);
        var complaint = compModule.find({
            $and: [{ status: "forwarded" },
                { cdepartname: data.departname }
            ]
        });
        complaint.exec(function(err, doc) {
            if (err) throw err;

            res.render('departmentpage', { title: 'registration', loginUser: req.session.user, records: doc });
        });
    });

});



router.get('/adminpage', checkloginuser, function(req, res, next) {
    var loginUser = req.session.user;
    // console.log(loginUser);
    if (loginUser != "ashkurkute@gmail.com") {
        res.redirect('/');
    }
    var complaint = compModule.find({ status: "registered" });
    complaint.exec(function(err, doc) {
        if (err) throw err;
        res.render('adminpage', { title: 'registration', loginUser: req.session.user, records: doc });
    });



});




router.post('/adminpage', function(req, res, next) {

    res.render('departmentsignup', { title: 'registration', msg: 'opened' });

});

router.post('/forward/:id', function(req, res, next) {
    var id = req.params.id;

    var status = compModule.update({ _id: id }, {
        $set: { status: "forwarded" }
    });
    status.exec(function(err, doc) {

        res.redirect('/adminpage');
    });

});

router.post('/delete/:id', function(req, res, next) {
    var id = req.params.id;

    var status = compModule.findByIdAndUpdate(id, {
        status: "rejected",
    });
    status.exec(function(err, doc) {

        res.redirect('/adminpage');
    });

});





router.get('/desc', checkloginuser, function(req, res, next) {
    res.render('desc', { title: 'registration', msg: 'opened', loginUser: req.session.user, });

});

router.get('/complaintform', checkloginuser, function(req, res, next) {
    var u = userModule.find({ email_id: req.session.user });
    u.exec(function(err, doc) {
        if (err) throw err;

        res.render('complaintform', { title: 'registration', loginUser: req.session.user, errors: '', record: doc, msg: 'opened' });

    });

});

router.post('/complaintform', checkEmail, [
    check('dcname', '*Enter department name').isUppercase(),
    check('cname', '*Enter Your complaint').isString().isLength({ min: 1 }),
    check('adhar', '*Enter Your 12 digit Aadhar No').isString().isLength({ min: 12 }),
    check('contact', '*Enter Valid Mobile No.').isMobilePhone(),

    check('cpaddr', '*Enter your Permanant address').trim().isString().isLength({ min: 1 }),
    check('caddr', '*Enter your residencial address').trim().isString().isLength({ min: 1 }),
    check('country', '*Select Country').isUppercase(),
    check('state', '*Enter your State').isUppercase(),
    check('dis', '*Enter Your District').isUppercase(),
    check('city', '*Enter your City').isUppercase(),
    check('clocality', '*Enter your locality').trim().isString().isLength({ min: 1 }),
    check('cslocality', '*Enter your sub-locality').trim().isString().isLength({ min: 1 }),
    check('subject', '*Required').trim().isString().isLength({ min: 1 }),
    check('desc', '*Required').trim().isString().isLength({ min: 1 }),

], function(req, res, next) {
    const errors = validationResult(req);
    console.log(errors.mapped());
    if (!errors.isEmpty()) {
        const user = matchedData(req);
        res.render('complaintform', { title: 'complaint registration form', msg: '', errors: errors.mapped(), user: user, ref: '', loginUser: req.session.user });
    } else {
        var dcname = req.body.dcname;
        var cname = req.body.cname;
        var adhar = req.body.adhar;
        var contact = req.body.contact;
        // var cemail=req.body.cemail;
        var caddr = req.body.caddr;
        var cpaddr = req.body.cpaddr;
        var clocality = req.body.clocality;
        var cslocality = req.body.cslocality;
        var datetime = new Date();
        //   var date=req.body.date;
        var subject = req.body.subject;
        var desc = req.body.desc;
        var status = "registered";
        //var document=req.body.doc;
        function unique() {
            var random = Math.floor(Math.random() * 100000) + 100000;
            return (random);
        }

        var ref = unique();

        //dpassword=bcrypt.hashSync(req.body.dpassword);
        var compDetails = new compModule({
            cdepartname: dcname,
            cname: cname,
            adhar: adhar,
            contact: contact,
            cemail: req.session.user,
            caddr: caddr,
            cpaddr: cpaddr,
            clocality: clocality,
            cslocality: cslocality,
            date: datetime,
            subject: subject,
            desc: desc,
            status: status,
            ref_no: ref,
            //r  document:document,
        });
        compDetails.save((err, doc) => {
            if (err) throw err;

            res.render('success', { title: 'Home', msg: 'Successfully Registered....', errors: '', user: '', ref: ref });

        });
    }
});

router.get('/success', checkloginuser, function(req, res, next) {
    res.render('success', { title: 'registration', msg: 'opened' });

});
router.post('/success', function(req, res, next) {
    res.render('userpage', { title: 'registration', loginUser: req.session.user, msg: 'opened' });

});
router.post('/ok', function(req, res, next) {
    res.redirect('/status');

});

router.get('/status', checkloginuser, function(req, res, next) {

    var loginUser = req.session.user;

    var complaint = compModule.find({ cemail: loginUser });
    complaint.exec(function(err, doc) {
        if (err) throw err;
        res.render('status', { title: 'registration', loginUser: req.session.user, records: doc });
    });

});

router.post('/deletec/:id', function(req, res, next) {
    var id = req.params.id;

    var deletec = compModule.findByIdAndDelete(id);
    deletec.exec(function(err, doc) {
        if (err) throw err;
        res.redirect('/status');
    });
});
router.post('/viewu/:id', checkloginuser, function(req, res, next) {
    var id = req.params.id;

    var status = compModule.findById(id);
    status.exec(function(err, doc) {
        if (err) throw err;
        res.render('vc', { title: "view complaint", record: doc, loginUser: req.session.user });
    });

});


router.post('/desc', function(req, res, next) {

    var check = req.body.check;
    if (check == checked)
        res.render('/complaintform', { title: 'registration', msg: 'opened' });
    else {
        alert("You cannot proceed!!");
        res.redirect('/desc');
    }
});



router.post('/id/:id', checkloginuser, function(req, res, next) {
    var id = req.params.id;
    var complaint = compModule.findById(id);
    complaint.exec(function(err, doc) {
        if (err) throw err;
        res.render('application', { title: "complaint", record: doc });

    });


});

router.post('/application', function(req, res, next) {
    var id = req.body.id;
    var reason = req.body.reason;
    var input = req.body.vote;

    if (input == "Accept") {
        var reason = compModule.findByIdAndUpdate(id, {
            reason: reason,
            status: "Accepted"
        });
    } else {
        if (input = "Reject") {
            var reason = compModule.findByIdAndUpdate(id, {
                reason: reason,
                status: "Rejected"
            });

        }
    }
    reason.exec(function(err, doc) {

        res.redirect('departmentpage');
    });
});


router.post('/search', function(req, res, next) {
    var email = req.body.email;
    var search = userModule.findOne({ email_id: email });

    search.exec((err, data) => {
        if (err) throw err;
        //var getid=data._id;
        res.render('search', { title: "search", record: data });

    });


});

router.post('/back', function(req, res, next) {
    res.redirect('/adminpage');

});

router.get('/linked', function(req, res, next) {
    var depart = departmentModule.find({});
    depart.exec(function(err, doc) {
        if (err) throw err;
        res.render('linked', { title: 'registration', records: doc });
    });
});


router.get('/profile_update', checkloginuser, function(req, res, next) {
    var loginUser = req.session.user;
    var checkUser = userModule.findOne({ email_id: loginUser });
    checkUser.exec(function(err, data) {
        if (err) throw err;
        res.render('profile_update', { title: "Update Profile", loginUser: req.session.user, msg: '', records: data, });
    });
});

router.get('/aboutus', function(req, res, next) {

    res.render('aboutus', { title: "aboutus" });

});


router.post('/update', function(req, res, next) {
    var update = userModule.findByIdAndUpdate(req.body.id, {

        // full_name:req.body.uname,
        // date_birth:req.body.date,
        email_id: req.body.email,
        mobileno: req.body.mobileno,
        phoneno: req.body.phoneno,
        // country:req.body.country,
        //  state:req.body.state,
        // district:req.body.dis,
        city: req.body.city,
        residential_addr: req.body.paddr,
        permanant_addr: req.body.raddr,

    });
    update.exec(function(err, data) {
        req.session.user = req.body.email;
        if (err) throw err;
        res.redirect('/userpage');
    });
});

router.post('/searchc', function(req, res, next) {
    var ref = req.body.ref_no;
    var searchc = compModule.findOne({ ref_no: ref });

    searchc.exec((err, data) => {
        if (err) throw err;
        if (data != null) {
            //  var getid=data._id;
            res.render('searchc', { title: "search", record: data });
        } else {
            res.redirect('/status');
        }

    });
});


router.get('/logout', function(req, res, next) {

    req.session.destroy(function(err) {
        if (err) {
            res.redirect('/');
        }
        res.redirect('/');
    });

});



router.get('/forgotpass', function(req, res, next) {
    res.render('forgotpass', { title: "forgot", msg: '', otp: '', E_mail: '' });

});

router.post("/forgot", function(req, res, next) {
    var fmail = req.body.Fmail;
    var forgotpassemail = userModule.find({ email: fmail });
    forgotpassemail.exec((err, data) => {
        if (err) throw err;
        if (data != '') {
            console.log(data);
            var OTP = otpGenerator.generate(6, { upperCase: false, specialChars: false });

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'jeevanpraday.official@gmail.com',
                    pass: 'jeevanpraday5'
                }
            });

            var mailOptions = {
                from: 'jeevanpraday.official@gmail.com',
                to: fmail,
                subject: 'OTP for forgot Password',
                text: 'JEEVANPRDAY.com..... otp for your forgot password request on this account  is   ' + OTP + '   PLEASE do not share it with anyone',

            };

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    res.render('forgotpass', { title: 'forgot', msg: 'OTP send Successfully on email', otp: OTP, E_mail: fmail });
                }
            });
        } else {
            res.render('forgotpass', { title: 'forgot', msg: 'E-mail not registered', otp: '', E_mail: '' });
        }
    });
});




router.post('/password', function(req, res, next) {
    var otpenter = req.body.otpenter;
    var otpreal = req.body.otp;
    var E_mail = req.body.email;
    console.log(otpenter);
    console.log(otpreal);
    console.log(E_mail);
    if (otpenter != otpreal || E_mail == '') {
        return res.render('forgotpass', { title: 'forgot', msg: 'OTP not matched... send Otp Request Again', otp: '', E_mail: '' });
    } else {
        res.render('password', { title: 'Reset password', msg: ' ', E_mail: E_mail });
    }
});



router.post('/reset', function(req, res) {
    var email = req.body.email;
    var pass = req.body.pass;
    var cpass = req.body.cpass;
    if (pass != cpass) {
        res.render('password', { title: 'Reset password', msg: 'Confirm password not matched', E_mail: email });
    } else {
        password = bcrypt.hashSync(req.body.pass, 10);
        var reset = userModule.update({ email: email }, { $set: { password: password } });
        reset.exec(function(err, data) {
            if (err) throw err;
            res.render('forgotpass', { title: 'forgot', msg: 'password changed successfully', otp: '', E_mail: '' });
        });
    }
});




module.exports = router;