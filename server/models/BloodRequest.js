const mongoose = require('mongoose');
const BloodRequestSchema = new mongoose.Schema({
    requester:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bloodGroup:{
        type: String,
        enum:['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true
    },
    quantity:{
        type: Number,
        default: 1,
    },
    hospital:{
        type: String,
        required: true
    },
    district:{
        type: String,
        required: true
    },
    urgency:{
        type: String,
        enum:['Normal', 'Urgent', 'Critical'],
        default: 'Normal'
    },
    status:{
        type: String,
        enum:['Pending', 'Approved', 'Rejected', 'Completed'],
        default: 'Pending'
    },
    donor:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
    
    }
},
{
    timestamps: true
});
module.exports = mongoose.model('BloodRequest',BloodRequestSchema);