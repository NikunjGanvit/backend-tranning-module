const express = require('express');
const router = express.Router();

const auth = require('../controller/authController');
const users = require('../controller/usersController');
const permissions = require('../controller/permissionController');
const userPermissions = require('../controller/userPermissionController');

const { authenticateJWT, authorizeAdmin } = require('../utils/validation'); // we'll implement auth here

// Auth
router.post('/api/auth/register', auth.register);
router.post('/api/auth/login', auth.login);

// Users
router.get('/api/users/:id', authenticateJWT, users.getById);
router.put('/api/users/:id/profile', authenticateJWT, users.updateProfile);
router.put('/api/users/:id/password', authenticateJWT, users.updatePassword);
router.delete('/api/users/:id', authenticateJWT, authorizeAdmin, users.softDelete);

// Permission modules (admin)
router.post('/api/permission-modules', authenticateJWT, authorizeAdmin, permissions.create);
router.put('/api/permission-modules/:module_code', authenticateJWT, authorizeAdmin, permissions.update);
router.delete('/api/permission-modules/:module_code', authenticateJWT, authorizeAdmin, permissions.remove);

// User permissions (admin)
router.post('/api/user-permissions', authenticateJWT, authorizeAdmin, userPermissions.create);
router.put('/api/user-permissions/:id', authenticateJWT, authorizeAdmin, userPermissions.update);

module.exports = router;
