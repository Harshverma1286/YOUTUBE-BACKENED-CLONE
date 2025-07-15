const mongoose = require('mongoose');

const likeSchema = mongoose.Schema(
    {
        comment:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"comment"
        },
        video:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"video"
        },
        likedby:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        },
        tweet:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"tweets"
        }
    },
    {
        timestamps:true,
    }
)

module.exports = mongoose.model("like",likeSchema);