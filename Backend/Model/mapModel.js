// Model/mapModel.js
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  position: {
    type: [Number], // [x, y] top-left origin
    required: true,
    validate: {
      validator: arr => arr.length === 2,
      message: "Position must be [x, y] array"
    }
  },
  size: {
    type: [Number], // [width, height]
    default: [1, 1],
    validate: {
      validator: arr => arr.length === 2,
      message: "Size must be [width, height] array"
    }
  },
  shape: {
    type: String,
    required: true,
    enum: ["rectangular", "L-shaped", "U-shaped", "circular", "custom"]
  },
  coordinates: {
    type: [[Number]], // Array of [x, y] grid points
    required: true
  },
  meta: mongoose.Schema.Types.Mixed // For additional properties
});

const entranceSchema = new mongoose.Schema({
  position: [Number],
  size: [Number],
  orientation: {
    type: String,
    enum: ["north", "south", "east", "west"]
  }
});

const storeMapSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  grid: {
    type: [[Number]], // 2D grid representation
    required: true
  },
  categories: [categorySchema],
  entrance: entranceSchema,
  metadata: {
    width: Number,
    height: Number,
    createdAt: Date,
    updatedAt: Date
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual properties
storeMapSchema.virtual('dimensions').get(function() {
  return {
    width: this.metadata?.width || this.grid[0]?.length || 0,
    height: this.metadata?.height || this.grid.length || 0
  };
});

// Add pre-save hook to set metadata
storeMapSchema.pre('save', function(next) {
  if (this.grid && this.grid.length > 0) {
    this.metadata = {
      width: this.grid[0].length,
      height: this.grid.length,
      updatedAt: new Date()
    };
  }
  next();
});

export const StoreMap = mongoose.model('StoreMap', storeMapSchema);