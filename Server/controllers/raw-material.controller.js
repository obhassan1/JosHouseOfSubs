const mongoose = require('mongoose');
const RawMaterial = require('../models/raw-material.model');

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parseQuantity(value, label) {
  const quantity = Number(value);

  if (!Number.isFinite(quantity) || quantity < 0) {
    throw createHttpError(
      400,
      `${label} must be zero or greater.`
    );
  }

  return quantity;
}

function normalizeMaterial(body) {
  const name = String(body.name || '').trim();
  const unit = String(body.unit || '').trim();

  if (!name) {
    throw createHttpError(
      400,
      'Material name is required.'
    );
  }

  if (!unit) {
    throw createHttpError(
      400,
      'Unit is required.'
    );
  }

  return {
    name,
    quantity: parseQuantity(
      body.quantity,
      'Quantity'
    ),
    unit,
    minimumQuantity: parseQuantity(
      body.minimumQuantity ?? 0,
      'Low-stock level'
    ),
    notes: String(body.notes || '').trim()
  };
}

function ensureValidId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw createHttpError(
      400,
      'Invalid raw material identifier.'
    );
  }
}

exports.getMaterials = async (
  _request,
  response,
  next
) => {
  try {
    const materials = await RawMaterial.find()
      .sort({ name: 1, unit: 1 })
      .lean();

    response.json(materials);
  } catch (error) {
    next(error);
  }
};

exports.createMaterial = async (
  request,
  response,
  next
) => {
  try {
    const material = await RawMaterial.create(
      normalizeMaterial(request.body)
    );

    response.status(201).json(material);
  } catch (error) {
    next(error);
  }
};

exports.updateMaterial = async (
  request,
  response,
  next
) => {
  try {
    ensureValidId(request.params.id);

    const material = await RawMaterial.findByIdAndUpdate(
      request.params.id,
      normalizeMaterial(request.body),
      {
        new: true,
        runValidators: true
      }
    );

    if (!material) {
      throw createHttpError(
        404,
        'Raw material not found.'
      );
    }

    response.json(material);
  } catch (error) {
    next(error);
  }
};

exports.deleteMaterial = async (
  request,
  response,
  next
) => {
  try {
    ensureValidId(request.params.id);

    const material =
      await RawMaterial.findByIdAndDelete(
        request.params.id
      );

    if (!material) {
      throw createHttpError(
        404,
        'Raw material not found.'
      );
    }

    response.status(204).send();
  } catch (error) {
    next(error);
  }
};