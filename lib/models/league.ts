import mongoose, { Schema } from "mongoose";

const LeagueSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    module: {
        type: String,
        required: false,
        enum: ["sports", "automotive"]
    },
    active: { type: Boolean, default: true },
}, {
    timestamps: true
});

export const League = mongoose.models.League || mongoose.model("League", LeagueSchema);
