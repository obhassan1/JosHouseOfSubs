const mongoose = require('mongoose');

const InventoryCategory = require(
  '../models/inventory-category.model'
);

const RawMaterial = require(
  '../models/raw-material.model'
);

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeCategory(body) {
  const name = String(
    body.name || ''
  ).trim();

  if (!name) {
    throw createHttpError(
      400,
      'Category name is required.'
    );
  }

  return {
    name,
    sortOrder: Number.isFinite(
      Number(body.sortOrder)
    )
      ? Number(body.sortOrder)
      : 0
  };
}

function ensureValidId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw createHttpError(
      400,
      'Invalid category identifier.'
    );
  }
}

exports.getCategories = async (
  _request,
  response,
  next
) => {
  try {
    const categories =
      await InventoryCategory.find()
        .sort({
          sortOrder: 1,
          name: 1
        })
        .lean();

    response.json(categories);
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (
  request,
  response,
  next
) => {
  try {
    const category =
      await InventoryCategory.create(
        normalizeCategory(request.body)
      );

    response.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (
  request,
  response,
  next
) => {
  try {
    ensureValidId(request.params.id);

    const category =
      await InventoryCategory
        .findByIdAndUpdate(
          request.params.id,
          normalizeCategory(request.body),
          {
            new: true,
            runValidators: true
          }
        );

    if (!category) {
      throw createHttpError(
        404,
        'Inventory category not found.'
      );
    }

    response.json(category);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (
  request,
  response,
  next
) => {
  try {
    ensureValidId(request.params.id);

    const containsItems =
      await RawMaterial.exists({
        category: request.params.id
      });

    if (containsItems) {
      throw createHttpError(
        409,
        'Move or delete the items in this category before deleting it.'
      );
    }

    const category =
      await InventoryCategory
        .findByIdAndDelete(
          request.params.id
        );

    if (!category) {
      throw createHttpError(
        404,
        'Inventory category not found.'
      );
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
};