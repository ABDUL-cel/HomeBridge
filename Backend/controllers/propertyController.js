const Property = require('../models/Property');

// @desc    Get all properties (with optional filter query)
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
  try {
    const { propertyType, area, minPrice, maxPrice, status } = req.query;

    let query = {};

    // Apply filters if provided
    if (propertyType) query.propertyType = propertyType;
    if (status) query.status = status;
    if (area) query['location.area'] = { $regex: area, $options: 'i' };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(query)
      .populate('owner', 'fullName phone email isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single property details
// @route   GET /api/properties/:id
// @access  Public
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'owner',
      'fullName phone email isVerified'
    );

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new property listing
// @route   POST /api/properties
// @access  Private (Landlords and Agents only)
exports.createProperty = async (req, res) => {
  try {
    const { title, description, propertyType, city, area, address, price, pricePeriod, features } = req.body;

    // Process uploaded images
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => `/uploads/${file.filename}`);
    }

    // Process features if sent as JSON string or array
    let parsedFeatures = features;
    if (typeof features === 'string') {
      parsedFeatures = JSON.parse(features);
    }

    const property = await Property.create({
      title,
      description,
      propertyType,
      location: {
        city: city || 'Ilorin',
        area,
        address,
      },
      price,
      pricePeriod,
      features: parsedFeatures,
      images: imagePaths,
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Property listed successfully!',
      data: property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update property listing
// @route   PUT /api/properties/:id
// @access  Private (Owner only)
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check ownership
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this property' });
    }

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      req.body.images = [...property.images, ...newImages];
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete property listing
// @route   DELETE /api/properties/:id
// @access  Private (Owner only)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check ownership
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
    }

    await property.deleteOne();

    res.status(200).json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get listings owned by logged-in user
// @route   GET /api/properties/my-listings
// @access  Private (Landlord/Agent)
exports.getMyListings = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};