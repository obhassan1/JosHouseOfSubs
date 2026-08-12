const express = require('express');

const {
  rateLimit
} = require('express-rate-limit');

const authController = require(
  '../controllers/auth.controller'
);

const categoryController = require(
  '../controllers/inventory-category.controller'
);

const menuController = require(
  '../controllers/menu.controller'
);

const rawMaterialController = require(
  '../controllers/raw-material.controller'
);

const {
  requireAuthentication,
  requireSuperAdmin
} = require(
  '../middlewares/auth.middleware'
);

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      'Too many sign-in attempts. Please wait 15 minutes and try again.'
  }
});

router.post(
  '/login',
  loginLimiter,
  authController.login
);

router.use(requireAuthentication);

/*
 * Normal staff and super administrator.
 */

router.get(
  '/raw-materials',
  rawMaterialController.getMaterials
);

router.post(
  '/raw-materials/:id/adjust',
  rawMaterialController.adjustQuantity
);

router.get(
  '/inventory-history',
  rawMaterialController.getHistory
);

router.get(
  '/inventory-categories',
  categoryController.getCategories
);

/*
 * Super administrator only.
 */

router.get(
  '/menu',
  requireSuperAdmin,
  menuController.getAdminItems
);

router.post(
  '/menu',
  requireSuperAdmin,
  menuController.createItem
);

router.put(
  '/menu/:id',
  requireSuperAdmin,
  menuController.updateItem
);

router.delete(
  '/menu/:id',
  requireSuperAdmin,
  menuController.deleteItem
);

router.post(
  '/raw-materials',
  requireSuperAdmin,
  rawMaterialController.createMaterial
);

router.put(
  '/raw-materials/:id',
  requireSuperAdmin,
  rawMaterialController.updateMaterial
);

router.delete(
  '/raw-materials/:id',
  requireSuperAdmin,
  rawMaterialController.deleteMaterial
);

router.post(
  '/inventory-categories',
  requireSuperAdmin,
  categoryController.createCategory
);

router.put(
  '/inventory-categories/:id',
  requireSuperAdmin,
  categoryController.updateCategory
);

router.delete(
  '/inventory-categories/:id',
  requireSuperAdmin,
  categoryController.deleteCategory
);

module.exports = router;