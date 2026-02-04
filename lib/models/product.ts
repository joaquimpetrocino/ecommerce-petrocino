import mongoose, { Schema } from "mongoose";

const ProductVariantSchema = new Schema({
    type: { type: String, enum: ["roupa", "calcado"] },
    size: { type: String, required: true },
    color: { type: String }, // Nome da cor (vinculado a ProductColor.name)
    stock: { type: Number, required: true, default: 0 },
    allowCustomization: { type: Boolean, default: false }
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
    categories: [{ type: String }], // ID das categorias (Multiple)
    subCategories: [{ type: String }], // ID das subcategorias (Multiple)
    variants: [ProductVariantSchema],
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    brands: [{ type: String }], // IDs das marcas selecionadas (Multiple)
    models: [{ type: String }], // IDs dos modelos selecionados (Multiple)
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
