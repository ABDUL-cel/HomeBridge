const Property = require('../models/Property');
// Get all properties for tenants (index.html / public search)
exports.getAllProperties = async (req, res) => {
    try {
        const properties = await Property.find()
            .populate('postedBy', 'name email phone') // Includes Landlord contact info!
            .sort({ isPromoted: -1, createdAt: -1 });

        res.status(200).json({ success: true, data: properties });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single property details (property-details.html)
exports.getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('postedBy', 'name email phone');

        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        res.status(200).json({ success: true, data: property });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Get all properties (Featured first)
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
  try {
    const { area, propertyType, maxPrice, status } = req.query;
    let query = {};

    if (status) query.status = status;
    if (area) query['location.area'] = { $regex: area, $options: 'i' };
    if (propertyType) query.propertyType = propertyType;
    if (maxPrice) query.price = { $lte: Number(maxPrice) };

    // Sort by isFeatured descending first, then by newest
    const properties = await Property.find(query)
      .populate('owner', 'fullName email phone')
      .sort({ isFeatured: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'owner',
      'fullName email phone'
    );

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in landlord's properties
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

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Landlord/Agent)
exports.createProperty = async (req, res) => {
  try {
    const imagePaths = req.files ? req.files.map((file) => file.path || `/uploads/${file.filename}`) : [];

    let locationData = req.body.location;
    if (typeof locationData === 'string') {
      try {
        locationData = JSON.parse(locationData);
      } catch (err) {
        locationData = { address: locationData, area: locationData };
      }
    }

    let featuresData = req.body.features;
    if (typeof featuresData === 'string') {
      featuresData = featuresData.split(',').map((item) => item.trim()).filter(Boolean);
    }

    const propertyData = {
      ...req.body,
      owner: req.user._id,
      images: imagePaths,
      location: locationData,
      features: featuresData,
    };

    const property = await Property.create(propertyData);

    res.status(201).json({ success: true, data: property });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Landlord/Agent)
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this property' });
    }

    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map((file) => file.path || `/uploads/${file.filename}`);
    }

    if (typeof req.body.features === 'string') {
      req.body.features = req.body.features.split(',').map((item) => item.trim()).filter(Boolean);
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Promote property listing (Featured Status)
// @route   PUT /api/properties/:id/promote
// @access  Private (Landlord/Agent)
exports.promoteProperty = async (req, res) => {
  try {
    const { reference } = req.body;
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        isFeatured: true,
        featuredUntil: thirtyDays,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Property successfully promoted to Featured!',
      data: property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Landlord/Agent)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this property' });
    }

    await property.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
