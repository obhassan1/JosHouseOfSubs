const Restaurant = require('../models/restaurant.model');

exports.getDetails = async (_request, response, next) => {
  try {
    const details = await Restaurant.findOne().lean();

    response.json(details || {
      name: "Jo's House of Subs",
      address: '',
      phone: '',
      hours: [],
      socialLinks: {}
    });
  } catch (error) {
    next(error);
  }
};
