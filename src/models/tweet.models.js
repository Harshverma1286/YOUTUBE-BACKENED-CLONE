const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema(
    {
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        },
        content:{
            type:String,
            required:true,
        }
    },
    {
        timestamps:true,
    }
);

module.exports = mongoose.model("tweets",tweetSchema);