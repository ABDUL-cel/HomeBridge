const express = require('express');
const router = express.Router();
const https = require('https');
const Property = require('../models/Property');
const { protect } = require('../middleware/authMiddleware');

// @desc    Verify Paystack payment reference & apply promotion
// @route   GET /api/payments/verify/:reference
// @access  Private
router.get('/verify/:reference', protect, async (req, res) => {
    const { reference } = req.params;

    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: `/transaction/verify/${encodeURIComponent(reference)}`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
    };

    const paystackReq = https.request(options, (paystackRes) => {
        let data = '';

        paystackRes.on('data', (chunk) => {
            data += chunk;
        });

        paystackRes.on('end', async () => {
            try {
                const responseData = JSON.parse(data);

                if (responseData.status && responseData.data.status === 'success') {
                    const propertyId = responseData.data.metadata?.propertyId;

                    if (propertyId) {
                        // Set promotion duration (30 days from now)
                        const promotionExpiry = new Date();
                        promotionExpiry.setDate(promotionExpiry.getDate() + 30);

                        await Property.findByIdAndUpdate(propertyId, {
                            isPromoted: true,
                            promotedUntil: promotionExpiry
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: 'Payment verified and property promoted successfully!',
                        data: responseData.data
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Payment verification failed or transaction not successful.'
                    });
                }
            } catch (error) {
                return res.status(500).json({ success: false, message: 'Error processing verification response' });
            }
        });
    });

    paystackReq.on('error', (error) => {
        return res.status(500).json({ success: false, message: error.message });
    });

    paystackReq.end();
});

module.exports = router;
