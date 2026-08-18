const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true

    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        enum:['Male', 'Female','Other'],
        required: true
    },
    age:{
        type: Number,
        required: true,
        min: 18

    },
    bloodGroup:{
        enum:['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true
    },
    phoneNumber:{
        type: String,
        required: true,
    },
    district:{
        type: String,
        required: true
    },
    address: String,
    lastDonationDate:{
        type: Date,
        default: null  
    },
    isDonorAvailable:{
        type: Boolean,
        default: false
    },
    totalDonations:{
        type: Number,
        default: 0
    },
    profilePic:{
        type: String,
        default: ''
    },
    IsOnline:{
        type: Boolean,
        default: false
    },
    lastActive:{
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: tru
});

UserSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next();
    }   
    const salt = await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);

};
module.exports=mongoose.model('User',UserSchema);