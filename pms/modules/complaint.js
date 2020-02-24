const mongooseee=require('mongoose');
mongooseee.connect('mongodb+srv://pawaraish1609:AISH@cluster0-zu75e.mongodb.net/vish?retryWrites=true&w=majority',{useNewUrlParser:true,useUnifiedTopology:true});

var complaintschema=new mongooseee.Schema({
    
    cdepartname:{type:String,
        required:true,
    },
        cname:{type:String,
            required:true,
        },
adhar:{type:String,
    required:true,
},   

contact:{type:String,
    required:true,
},

cemail:{type:String,
    required:true,

},
caddr:{type:String,
    required:true,

},
cpaddr:{type:String,
    required:true,

},

clocality:{type:String,
    required:true,

},
cslocality:{type:String,
    required:true,

},
date:{type:String,
    required:true,

},
subject:{type:String,
    required:true,

},
desc:{type:String,
    required:true,

},

reason:{type:String,
    

},

status:{type:String,
    required:true,

},

ref_no:{type:String,
    required:true,

},

document:{
    type:String,
    
}




});

var complaintmodel=mongooseee.model('complaint',complaintschema);

module.exports=complaintmodel;