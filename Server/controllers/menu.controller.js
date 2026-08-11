const mongoose = require('mongoose');
const MenuItem = require('../models/menu-item.model');

const MAX_IMAGE_LENGTH = 1.5 * 1024 * 1024;

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateImageUrl(value) {
  const imageUrl = String(value || '').trim();

  if (!imageUrl) {
    return '';
  }

  if (imageUrl.length > MAX_IMAGE_LENGTH) {
    throw createHttpError(
      413,
      'The menu image is too large. Please choose a smaller image.'
    );
  }

  const isSupportedDataImage =
    /^data:image\/(jpeg|png|webp);base64,[a-z0-9+/=\s]+$/i.test(imageUrl);

  const isSecureRemoteImage = /^https:\/\//i.test(imageUrl);

  if (!isSupportedDataImage && !isSecureRemoteImage) {
    throw createHttpError(
      400,
      'Use a JPG, PNG, or WebP image, or a secure HTTPS image URL.'
    );
  }

  return imageUrl;
}

function normalizeItem(body) {
  const name = String(body.name || '').trim();
  const price = Number(body.price);
  const currency = String(body.currency || 'USD').toUpperCase();

  if (!name) {
    throw createHttpError(400, 'Item name is required.');
  }

  if (!Number.isFinite(price) || price < 0) {
    throw createHttpError(400, 'Price must be zero or greater.');
  }

  if (!['USD', 'LBP'].includes(currency)) {
    throw createHttpError(400, 'Currency must be USD or LBP.');
  }

  return {
    name,
    description: String(body.description || '').trim(),
    category: String(body.category || 'Subs').trim() || 'Subs',
    price,
    currency,
    imageUrl: validateImageUrl(body.imageUrl),
    isAvailable: body.isAvailable !== false,
    featured: body.featured === true,
    sortOrder: Number.isFinite(Number(body.sortOrder))
      ? Number(body.sortOrder)
      : 0
  };
}

function ensureValidId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw createHttpError(400, 'Invalid menu item identifier.');
  }
}

exports.getPublicItems = async (_request, response, next) => {
  try {
    const items = await MenuItem.find()
      .sort({ category: 1, sortOrder: 1, name: 1 })
      .select(
        'name description category price currency imageUrl isAvailable featured sortOrder'
      )
      .lean();

    response.json(
      items.map((item) => ({
        _id: item._id,
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        currency: item.currency,
        imageUrl: item.imageUrl,
        featured: item.featured,
        sortOrder: item.sortOrder,
        isAvailable: item.isAvailable
      }))
    );
  } catch (error) {
    next(error);
  }
};

exports.getAdminItems = async (_request, response, next) => {
  try {
    const items = await MenuItem.find()
      .sort({ category: 1, sortOrder: 1, name: 1 })
      .lean();

    response.json(items);
  } catch (error) {
    next(error);
  }
};

exports.createItem = async (request, response, next) => {
  try {
    const item = await MenuItem.create(normalizeItem(request.body));
    response.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.updateItem = async (request, response, next) => {
  try {
    ensureValidId(request.params.id);

    const item = await MenuItem.findByIdAndUpdate(
      request.params.id,
      normalizeItem(request.body),
      {
        new: true,
        runValidators: true
      }
    );

    if (!item) {
      throw createHttpError(404, 'Menu item not found.');
    }

    response.json(item);
  } catch (error) {
    next(error);
  }
};

exports.deleteItem = async (request, response, next) => {
  try {
    ensureValidId(request.params.id);

    const item = await MenuItem.findByIdAndDelete(request.params.id);

    if (!item) {
      throw createHttpError(404, 'Menu item not found.');
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
};