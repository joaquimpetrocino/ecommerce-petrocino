import mongoose, { Schema } from "mongoose";

const OrderItemSchema = new Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    variantSize: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    customizationPrice: { type: Number, default: 0 },
    color: { type: String },
    customName: { type: String },
    customNumber: { type: String }
}, { _id: false });

const CustomerDataSchema = new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    paymentMethod: { type: String },
    installments: { type: String }
}, { _id: false });

const OrderSchema = new Schema({
    id: { type: String, required: true, unique: true }, // Internal ID (nanoid)
    orderId: { type: String, required: true, unique: true }, // Display ID
    items: [OrderItemSchema],
    total: { type: Number, required: true },
    customerData: { type: CustomerDataSchema, required: true },
    status: {
        type: String,
        required: true,
        enum: ["pendente", "confirmado", "enviado", "entregue", "cancelado"],
        default: "pendente"
    },
    notes: { type: String }
}, {
    timestamps: true
});

export const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
