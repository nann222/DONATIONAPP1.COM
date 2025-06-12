const Donation = require('../models/Donation');
const Request = require('../models/Request');
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Logistics = require('../models/Logistics');

/**
 * Enhanced smart matching algorithm with multiple criteria
 * @param {Object} donationId - The ID of the donation to match
 * @returns {Array} - Array of potential recipient matches with scores
 */
exports.findMatchesForDonation = async (donationId) => {
  try {
    const donation = await Donation.findById(donationId)
      .populate('items')
      .populate('donor', 'location');
    
    if (!donation) throw new Error('Donation not found');
    
    const itemTypes = donation.items.map(item => item.itemType);
    const totalQuantity = donation.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Find matching requests with enhanced criteria
    const matchingRequests = await Request.find({
      itemType: { $in: itemTypes },
      status: 'pending',
      quantity: { $lte: totalQuantity } // Ensure we can fulfill the request
    }).populate('recipient', 'location urgencyScore');
    
    // Calculate match scores based on multiple factors
    const scoredMatches = matchingRequests.map(request => {
      let score = 0;
      
      // Urgency scoring (40% weight)
      const urgencyScores = { 'critical': 100, 'high': 75, 'medium': 50, 'low': 25 };
      score += urgencyScores[request.urgency] * 0.4;
      
      // Time factor (30% weight) - older requests get higher priority
      const daysSinceRequest = (Date.now() - request.requestDate) / (1000 * 60 * 60 * 24);
      score += Math.min(daysSinceRequest * 2, 30) * 0.3;
      
      // Quantity match factor (20% weight)
      const quantityMatch = Math.min(request.quantity / totalQuantity, 1);
      score += quantityMatch * 20 * 0.2;
      
      // Geographic proximity (10% weight) - if location data available
      if (donation.donor.location && request.recipient.location) {
        // Simple distance calculation (in real app, use proper geospatial queries)
        const distance = calculateDistance(
          donation.donor.location,
          request.recipient.location
        );
        const proximityScore = Math.max(0, 10 - (distance / 10)); // Closer = higher score
        score += proximityScore * 0.1;
      }
      
      return {
        ...request.toObject(),
        matchScore: Math.round(score),
        estimatedFulfillment: Math.min(request.quantity, totalQuantity)
      };
    });
    
    // Sort by match score (highest first)
    return scoredMatches.sort((a, b) => b.matchScore - a.matchScore);
    
  } catch (error) {
    console.error('Error in enhanced matching algorithm:', error);
    throw error;
  }
};

/**
 * Fixed findMatchesForRequest function
 */
exports.findMatchesForRequest = async (requestId) => {
  try {
    const request = await Request.findById(requestId).populate('recipient');
    if (!request) throw new Error('Request not found');
    
    // Find donations with available items of the requested type
    const matchingDonations = await Donation.find({
      status: 'pending',
      'items.itemType': request.itemType
    }).populate([
      { path: 'items', match: { itemType: request.itemType } },
      { path: 'donor', select: 'name location' }
    ]);
    
    // Filter and score donations
    const scoredDonations = matchingDonations
      .filter(donation => {
        const availableQuantity = donation.items
          .filter(item => item.itemType === request.itemType)
          .reduce((sum, item) => sum + item.quantity, 0);
        return availableQuantity >= request.quantity;
      })
      .map(donation => {
        const availableQuantity = donation.items
          .filter(item => item.itemType === request.itemType)
          .reduce((sum, item) => sum + item.quantity, 0);
        
        let score = 0;
        
        // Quantity surplus scoring
        const surplus = availableQuantity - request.quantity;
        score += Math.max(0, 50 - surplus); // Prefer exact matches
        
        // Freshness scoring
        const daysSinceDonation = (Date.now() - donation.donationDate) / (1000 * 60 * 60 * 24);
        score += Math.max(0, 50 - daysSinceDonation * 2);
        
        return {
          ...donation.toObject(),
          matchScore: Math.round(score),
          availableQuantity
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
    
    return scoredDonations;
    
  } catch (error) {
    console.error('Error in request matching:', error);
    throw error;
  }
};

/**
 * Auto-match donations with requests
 */
exports.autoMatchDonations = async () => {
  try {
    const pendingDonations = await Donation.find({ status: 'pending' });
    const autoMatches = [];
    
    for (const donation of pendingDonations) {
      const matches = await this.findMatchesForDonation(donation._id);
      
      // Auto-approve high-confidence matches (score > 80)
      const highConfidenceMatch = matches.find(match => match.matchScore > 80);
      
      if (highConfidenceMatch) {
        await this.approveMatch(donation._id, highConfidenceMatch._id, true);
        autoMatches.push({
          donation: donation._id,
          request: highConfidenceMatch._id,
          score: highConfidenceMatch.matchScore
        });
      }
    }
    
    return autoMatches;
  } catch (error) {
    console.error('Error in auto-matching:', error);
    throw error;
  }
};

/**
 * Enhanced match approval with logistics integration
 */
exports.approveMatch = async (donationId, requestId, isAutomatic = false) => {
  try {
    const request = await Request.findById(requestId).populate('recipient');
    const donation = await Donation.findById(donationId).populate('donor');
    
    if (!request || !donation) {
      throw new Error('Request or donation not found');
    }
    
    // Update donation and request
    await Donation.findByIdAndUpdate(donationId, {
      recipient: request.recipient._id,
      status: 'approved'
    });
    
    await Request.findByIdAndUpdate(requestId, { status: 'matched' });
    
    // Create comprehensive notifications
    await this.createMatchNotifications(donation, request, isAutomatic);
    
    // Auto-create logistics entry
    await this.createLogisticsEntry(donation, request);
    
    return { donation, request };
    
  } catch (error) {
    console.error('Error approving match:', error);
    throw error;
  }
};

/**
 * Create notifications for match approval
 */
exports.createMatchNotifications = async (donation, request, isAutomatic) => {
  const notifications = [];
  
  // Notification for recipient
  const recipientNotification = new Notification({
    recipient: request.recipient._id,
    message: `Great news! Your request for ${request.itemType} (${request.quantity} units) has been ${isAutomatic ? 'automatically ' : ''}matched with a donation from ${donation.donor.name}. Delivery will be arranged soon.`,
    type: 'donation_matched',
    relatedDonation: donation._id,
    relatedRequest: request._id
  });
  
  // Notification for donor
  const donorNotification = new Notification({
    recipient: donation.donor._id,
    message: `Your donation of ${donation.items.map(i => i.itemName).join(', ')} has been matched with a recipient. Thank you for your generosity!`,
    type: 'donation_matched',
    relatedDonation: donation._id,
    relatedRequest: request._id
  });
  
  notifications.push(await recipientNotification.save());
  notifications.push(await donorNotification.save());
  
  return notifications;
};

/**
 * Auto-create logistics entry after match approval
 */
exports.createLogisticsEntry = async (donation, request) => {
  try {
    const logistics = new Logistics({
      donation: donation._id,
      pickupAddress: donation.donor.address || 'Address to be confirmed',
      deliveryAddress: request.recipient.address || 'Address to be confirmed',
      pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      status: 'scheduled',
      notes: `Auto-generated for ${request.itemType} donation match`
    });
    
    await logistics.save();
    
    // Update donation with logistics reference
    await Donation.findByIdAndUpdate(donation._id, { logistics: logistics._id });
    
    return logistics;
  } catch (error) {
    console.error('Error creating logistics entry:', error);
    throw error;
  }
};

// Helper function for distance calculation
function calculateDistance(loc1, loc2) {
  // Simple Euclidean distance - in production, use proper geospatial calculations
  const dx = loc1.coordinates[0] - loc2.coordinates[0];
  const dy = loc1.coordinates[1] - loc2.coordinates[1];
  return Math.sqrt(dx * dx + dy * dy);
}