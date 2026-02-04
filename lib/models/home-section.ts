import mongoose, { Schema } from "mongoose";

const HomeSectionSchema = new Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ["featured", "category", "cta"]
    },
    productIds: [{ type: String }], // Array de IDs de produtos
    description: { type: String },
    buttonText: { type: String },
    ctaLink: { type: String },
    backgroundImage: { type: String },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Prevent OverwriteModelError by deleting the model if it exists in dev
if (process.env.NODE_ENV === "development") {
    delete mongoose.models.HomeSection;
}

export const HomeSection = mongoose.models.HomeSection || mongoose.model("HomeSection", HomeSectionSchema);
