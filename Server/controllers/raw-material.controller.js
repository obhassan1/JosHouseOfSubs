const mongoose = require('mongoose');

const InventoryCategory = require(
  '../models/inventory-category.model'
);

const InventoryMovement = require(
  '../models/inventory-movement.model'
);

const RawMaterial = require(
  '../models/raw-material.model'
);

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parseNonNegative(value, label) {
  const quantity = Number(value);

  if (
    !Number.isFinite(quantity) ||
    quantity < 0
  ) {
    throw createHttpError(
      400,
      `${label} must be zero or greater.`
    );
  }

  return quantity;
}

function parsePositive(value, label) {
  const quantity = Number(value);

  if (
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    throw createHttpError(
      400,
      `${label} must be greater than zero.`
    );
  }

  return quantity;
}

function ensureValidId(
  id,
  label = 'identifier'
) {
  if (!mongoose.isValidObjectId(id)) {
    throw createHttpError(
      400,
      `Invalid ${label}.`
    );
  }
}

async function normalizeMaterial(body) {
  const name = String(
    body.name || ''
  ).trim();

  const unit = String(
    body.unit || ''
  ).trim();

  const categoryId = String(
    body.categoryId || ''
  ).trim();

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

  if (!categoryId) {
    throw createHttpError(
      400,
      'Inventory category is required.'
    );
  }

  ensureValidId(
    categoryId,
    'category identifier'
  );

  const categoryExists =
    await InventoryCategory.exists({
      _id: categoryId
    });

  if (!categoryExists) {
    throw createHttpError(
      400,
      'The selected inventory category does not exist.'
    );
  }

  return {
    name,

    quantity: parseNonNegative(
      body.quantity,
      'Quantity'
    ),

    unit,

    category: categoryId,

    minimumQuantity: parseNonNegative(
      body.minimumQuantity ?? 0,
      'Low-stock level'
    ),

    notes: String(
      body.notes || ''
    ).trim()
  };
}

exports.getMaterials = async (
  _request,
  response,
  next
) => {
  try {
    const materials =
      await RawMaterial.find()
        .populate(
          'category',
          'name sortOrder'
        )
        .sort({
          name: 1,
          unit: 1
        })
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
    const material =
      await RawMaterial.create(
        await normalizeMaterial(
          request.body
        )
      );

    await material.populate(
      'category',
      'name sortOrder'
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
    ensureValidId(
      request.params.id,
      'raw material identifier'
    );

    const existing =
      await RawMaterial
        .findById(request.params.id)
        .lean();

    if (!existing) {
      throw createHttpError(
        404,
        'Raw material not found.'
      );
    }

    const normalized =
      await normalizeMaterial(
        request.body
      );

    /*
     * Quantity cannot be overwritten from
     * the management page. It must use the
     * adjustment endpoint so an employee and
     * history record are always saved.
     */
    normalized.quantity =
      existing.quantity;

    const material =
      await RawMaterial
        .findByIdAndUpdate(
          request.params.id,
          normalized,
          {
            new: true,
            runValidators: true
          }
        )
        .populate(
          'category',
          'name sortOrder'
        );

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
    ensureValidId(
      request.params.id,
      'raw material identifier'
    );

    const material =
      await RawMaterial
        .findByIdAndDelete(
          request.params.id
        );

    if (!material) {
      throw createHttpError(
        404,
        'Raw material not found.'
      );
    }

    /*
     * Inventory history is intentionally
     * preserved after an item is deleted.
     */
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.adjustQuantity = async (
  request,
  response,
  next
) => {
  try {
    ensureValidId(
      request.params.id,
      'raw material identifier'
    );

    const type = String(
      request.body.type || ''
    )
      .trim()
      .toLowerCase();

    const quantity = parsePositive(
      request.body.quantity,
      'Adjustment quantity'
    );

    const employeeName = String(
      request.body.employeeName || ''
    ).trim();

    const notes = String(
      request.body.notes || ''
    ).trim();

    if (
      !['add', 'remove'].includes(type)
    ) {
      throw createHttpError(
        400,
        'Adjustment type must be add or remove.'
      );
    }

    if (!employeeName) {
      throw createHttpError(
        400,
        'Employee name is required for every stock change.'
      );
    }

    if (employeeName.length > 120) {
      throw createHttpError(
        400,
        'Employee name must be 120 characters or fewer.'
      );
    }

    if (notes.length > 500) {
      throw createHttpError(
        400,
        'Notes must be 500 characters or fewer.'
      );
    }

    const query = {
      _id: request.params.id
    };

    /*
     * This condition prevents the stock from
     * becoming negative when removing.
     */
    if (type === 'remove') {
      query.quantity = {
        $gte: quantity
      };
    }

    const change =
      type === 'add'
        ? quantity
        : -quantity;

    const previous =
      await RawMaterial.findOneAndUpdate(
        query,
        {
          $inc: {
            quantity: change
          }
        },
        {
          new: false,
          runValidators: true
        }
      );

    if (!previous) {
      const exists =
        await RawMaterial.exists({
          _id: request.params.id
        });

      if (!exists) {
        throw createHttpError(
          404,
          'Raw material not found.'
        );
      }

      throw createHttpError(
        400,
        'There is not enough stock to remove that quantity.'
      );
    }

    const newQuantity =
      previous.quantity + change;

    const movement =
      await InventoryMovement.create({
        material: previous._id,
        materialName: previous.name,
        type,
        quantity,
        unit: previous.unit,
        previousQuantity:
          previous.quantity,
        newQuantity,
        employeeName,
        accountUsername:
          request.user.sub,
        notes
      });

    const material =
      await RawMaterial
        .findById(previous._id)
        .populate(
          'category',
          'name sortOrder'
        )
        .lean();

    response.json({
      material,
      movement
    });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (
  request,
  response,
  next
) => {
  try {
    const requestedLimit =
      Number(request.query.limit) || 200;

    const limit = Math.min(
      Math.max(requestedLimit, 1),
      500
    );

    const movements =
      await InventoryMovement.find()
        .sort({
          createdAt: -1
        })
        .limit(limit)
        .lean();

    response.json(movements);
  } catch (error) {
    next(error);
  }
};