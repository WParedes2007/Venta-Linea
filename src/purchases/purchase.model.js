import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        priceAtPurchase: { // Guardar el precio al momento de la compra
            type: Number,
            required: true
        }
    }],
    total: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model("Purchase", PurchaseSchema);
