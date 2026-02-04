import mongoose, { Schema } from "mongoose";

const ProductVariantSchema = new Schema({
    type: { type: String, enum: ["roupa", "calcado"] },
    size: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 }
}, { _id: false });

const ProductColorSchema = new Schema({
    name: { type: String, required: true },
    hex: { type: String, required: true }
}, { _id: false });

const AutomotiveFieldsSchema = new Schema({
    brand: String,
    model: String,
    yearStart: Number,
    yearEnd: Number,
    oemCode: String,
    partType: String
}, { _id: false });

const ProductSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
    category: { type: String, required: true },
    subCategory: { type: String },
    league: { type: String },
    variants: [ProductVariantSchema],
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    module: {
        type: String,
        required: false, // Made optional for migration
        enum: ["sports", "automotive"]
    },
    brandId: { type: String }, // ID da marca selecionada
    modelId: { type: String }, // ID do modelo selecionado
    colors: [ProductColorSchema], // Apenas para sports
    automotiveFields: AutomotiveFieldsSchema, // Apenas para automotive
    allowCustomization: { type: Boolean, default: false },
    customizationPrice: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Avoid model overwrite warning in development
if (process.env.NODE_ENV === "development") {
    if (mongoose.models.Product) {
        delete mongoose.models.Product;
    }
}

export const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
