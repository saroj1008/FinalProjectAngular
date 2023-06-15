import mongoose, { Schema, model } from 'mongoose';

const schema = new Schema({
    title: { type: String, require: true },
    members: [{
        user_id: mongoose.Types.ObjectId,
        fullname: String,
        email: String,
        pending: { type: Boolean, default: true }
    }],
    transactions: [{
        title: String,
        description: String,
        paid_by: { user_id: mongoose.Types.ObjectId, fullname: String },
        category: String,
        amount: Number,
        date: Number,
        receipt: { filename: String, originalname: String }
    }],
})

export default model('group', schema)