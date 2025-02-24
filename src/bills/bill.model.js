import mongoose from "mongoose";

const BillSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // Referencia al modelo de usuario
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product", // Referencia al producto
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "paid", "canceled"],
        default: "pending"
    },
    shippingAddress: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

BillSchema.methods.toJSON = function() {
    const { __v, ...bill } = this.toObject();
    return bill;
};

export default mongoose.model("Bill", BillSchema);
