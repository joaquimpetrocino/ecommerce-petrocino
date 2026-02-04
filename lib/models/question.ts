import mongoose, { Schema } from "mongoose";

const ProductQuestionSchema = new Schema({
    id: { type: String, required: true, unique: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String },
    status: {
        type: String,
        required: true,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    answeredAt: { type: Number }
}, {
    timestamps: true
});

export const ProductQuestion = mongoose.models.ProductQuestion || mongoose.model("ProductQuestion", ProductQuestionSchema);
