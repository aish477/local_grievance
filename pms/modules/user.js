const mongoose=require('mongoose');
mongoose.connect('mongodb+srv://pawaraish1609:AISH@cluster0-zu75e.mongodb.net/vish?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology:true});
var conn=mongoose.Collection;
var userschema=new mongoose.Schema({
    full_name:{type:String,
    required:true,
    
},
date_birth:{type:Date,
    required:true,
   
},
email_id:{type:String,
    required:true,
   
},
mobileno:{type:String,
    required:true,
   
},
phoneno:{type:String,

    
},
country:{type:String, 
    required:true,
    
},
state:{type:String,
    required:true,
    
}, 
district:{type:String,
    required:true,
    
}, 
city:{type:String,
    required:true,
    
}, 
permanant_addr:{type:String,
    required:true,

}, 
residential_addr:{type:String,
    required:true,
    
},
password:{type:String,
    required:true,
    
},

/*loginvalue:{type:String,
    required:true,

},*/


});

var usermodel=mongoose.model('user',userschema);

module.exports=usermodel;