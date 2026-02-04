import mongoose, { Schema } from "mongoose";

const CategorySchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
    showInNavbar: { type: Boolean, default: false },
    parentId: { type: String, default: null }, // Deprecated: Use parentIds
    parentIds: { type: [String], default: [] }, // Lista de IDs das categorias pai
    image: { type: String }
}, {
    timestamps: true
});

export const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
