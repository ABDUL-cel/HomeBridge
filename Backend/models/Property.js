const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a property title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a property description'],
    },
    propertyType: {
      type: String,
      required: [true, 'Please select property type'],
      enum: ['Apartment', 'Duplex', 'Self Contain', 'Single Room'],
    },
    location: {
      city: { type: String, required: true, default: 'Ilorin' },
      area: { type: String, required: [true, 'Please add location area (e.g. Tanke, GRA)'] },
      address: { type: String },
    },
    price: {
      type: Number,
      required: [true, 'Please add annual or monthly price'],
    },
    pricePeriod: {
      type: String,
      enum: ['per year', 'per month'],
      default: 'per year',
    },
    features: [
      {
        type: String, // e.g. "Prepaid Meter", "Running Water", "Fenced", "Security"
      },
    ],
    images: [
      {
        type: String, // Stored file path or URL
      },
    ],
    status: {
      type: String,
      enum: ['available', 'rented', 'pending'],
      default: 'available',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: {
      type: Date,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', propertySchema);
