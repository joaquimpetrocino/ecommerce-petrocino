import mongoose, { Schema } from "mongoose";

const BrandSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    logoUrl: { type: String },
    active: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Índice composto para garantir unicidade de slug por módulo, se desejar, mas por enquanto slug único global é mais simples
// BrandSchema.index({ slug: 1, module: 1 }, { unique: true });

export const Brand = mongoose.models.Brand || mongoose.model("Brand", BrandSchema);
