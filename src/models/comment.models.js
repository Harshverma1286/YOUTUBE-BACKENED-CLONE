const mongoose = require('mongoose');

const mongooseAgregatePaginate = require('mongoose-aggregate-paginate-v2');

const commentSchema = mongoose.Schema(
    {
        content:{
            type:String,
            required:true,
        },
        video:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"video"
        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        }
    },
    {
        timestamps:true
    }
);

commentSchema.plugin(mongooseAgregatePaginate);

module.exports = mongoose.model("comment",commentSchema);