import mongoose, { Schema } from "mongoose";

const CategorySchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    module: {
        type: String,
        required: true,
        enum: ["sports", "automotive"]
    },
    active: { type: Boolean, default: true },
    showInNavbar: { type: Boolean, default: false },
    parentId: { type: String, default: null }, // ID da categoria pai (se houver)
    image: { type: String }
}, {
    timestamps: true
});

export const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
