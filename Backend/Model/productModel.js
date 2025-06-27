// backend/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    hashtags: {
      type: [String], // array of strings
      default: [],
    },
    imageUrl: {
  type: String,
  required: true,
    },
    quantity: {
      type: String, 
        required: true,
    },

  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export const Product = mongoose.model('Product', productSchema);
