const mongooseee=require('mongoose');
mongooseee.connect('mongodb+srv://pawaraish1609:AISH@cluster0-zu75e.mongodb.net/vish?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology:true});
var conn=mongooseee.Collection;
var adminschema=new mongooseee.Schema({
    
    aname:{type:String,
        required:true,
    },
       

email_id:{type:String,
    required:true,
},

password:{type:String,
    required:true,
},


/*loginvalue:{type:String,
    required:true,

},*/




});

var adminmodel=mongooseee.model('admin',adminschema);

module.exports=adminmodel;