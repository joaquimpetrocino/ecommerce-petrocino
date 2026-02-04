import mongoose, { Schema } from "mongoose";

const HeroConfigSchema = new Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    bannerUrl: { type: String, required: true },
    badge: { type: String, required: true }
}, { _id: false });

const ModuleSettingsSchema = new Schema({
    storeName: { type: String, default: "League Sports" },
    storeEmail: { type: String, default: "" },
    storePhone: { type: String, default: "" },
    storeAddress: { type: String, default: "" },
    storeCEP: { type: String, default: "" },
    storeNumber: { type: String, default: "" },
    storeComplement: { type: String, default: "" },
    logoUrl: { type: String },
    whatsappNumber: { type: String, default: "" },
}, { _id: false });

const StoreConfigSchema = new Schema({
    id: { type: String, required: true, unique: true }, // Mantain string ID for compatibility
    module: {
        type: String,
        required: true,
        enum: ["sports", "automotive"],
        default: "sports"
    },
    enableWhatsApp: { type: Boolean, default: true },

    // Module specific settings
    settings: {
        sports: { type: ModuleSettingsSchema, default: () => ({}) },
        automotive: { type: ModuleSettingsSchema, default: () => ({}) }
    },

    // Nested hero configuration
    hero: {
        sports: { type: HeroConfigSchema, required: true },
        automotive: { type: HeroConfigSchema, required: true }
    }
}, {
    timestamps: true
});

// Singleton pattern for Config
export const StoreConfig = mongoose.models.StoreConfig || mongoose.model("StoreConfig", StoreConfigSchema);
