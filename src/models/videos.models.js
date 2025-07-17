const mongoose = require('mongoose');

const mongooseAgregatePaginate = require('mongoose-aggregate-paginate-v2');

const videoSchema = mongoose.Schema(
    {
        videofile:{
            type:String,
            required:true,
        },
        thumbnail:{
            type:String,
            required:true
        },
        title:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        duration:{
            type:Number,
            required:true
        },
        views:{
            type:Number,
            default:0,
        },
        ispublished:{
            type:Boolean,
            default:true,
        },
        owner:{
           type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        }
    },
    {
        timestamps:true,
    }
);

videoSchema.plugin(mongooseAgregatePaginate); // for efficient searching plug ins

module.exports = mongoose.model("video",videoSchema);