const express = require('express');
const { rateLimit } = require('express-rate-limit');

const authController = require(
  '../controllers/auth.controller'
);

const menuController = require(
  '../controllers/menu.controller'
);

const rawMaterialController = require(
  '../controllers/raw-material.controller'
);

const {
  requireAdmin
} = require('../middlewares/auth.middleware');

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

router.use(requireAdmin);

router.get(
  '/menu',
  menuController.getAdminItems
);

router.post(
  '/menu',
  menuController.createItem
);

router.put(
  '/menu/:id',
  menuController.updateItem
);

router.delete(
  '/menu/:id',
  menuController.deleteItem
);

router.get(
  '/raw-materials',
  rawMaterialController.getMaterials
);

router.post(
  '/raw-materials',
  rawMaterialController.createMaterial
);

router.put(
  '/raw-materials/:id',
  rawMaterialController.updateMaterial
);

router.delete(
  '/raw-materials/:id',
  rawMaterialController.deleteMaterial
);

module.exports = router;