import mongoose, { Schema } from "mongoose";

const ModelSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    brandId: { type: String, required: true }, // Referência ao ID da marca
    active: { type: Boolean, default: true }
}, {
    timestamps: true
});

export const Model = mongoose.models.Model || mongoose.model("Model", ModelSchema);
