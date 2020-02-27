const mongoosee=require('mongoose');
mongoosee.connect('mongodb+srv://pawaraish1609:AISH@cluster0-zu75e.mongodb.net/vish?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology:true});
var conn=mongoosee.Collection;
var departschema=new mongoosee.Schema({
    

departname:{type:String,
    required:true,

},

headofdepart:{type:String,
required:true,},

email_id:{type:String,
    required:true,
   
},
dmobileno:{type:String,
    required:true,
   
},
dphoneno:{type:String,

    
},
description:{type:String,
    required:true,},

password:{type:String,
    required:true,
    
},
 




});

var departmentmodel=mongoosee.model('department',departschema);

module.exports=departmentmodel;