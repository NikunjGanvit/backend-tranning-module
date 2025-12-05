const express = require('express');
const router = express.Router();

const auth = require('../controller/authController');
const users = require('../controller/usersController');
const permissions = require('../controller/permissionController');
const userPermissions = require('../controller/userPermissionController');

const { authenticateJWT, authorizeAdmin } = require('../utils/validation'); 

// Auth
router.post('/api/auth/register', auth.register); // Done
router.post('/api/auth/login', auth.login); // Done

// Users
router.get('/api/users/:id', authenticateJWT, users.getById); // Done
router.put('/api/users/:id/profile', authenticateJWT, users.updateProfile); // done
router.put('/api/users/:id/password', authenticateJWT, users.updatePassword); // done
router.delete('/api/users/:id', authenticateJWT, authorizeAdmin, users.softDelete); // done

// Permission modules (admin)
router.post('/api/permission-modules', authenticateJWT, authorizeAdmin, permissions.create);//done 
router.put('/api/permission-modules/:module_code', authenticateJWT, authorizeAdmin, permissions.update); // done
router.delete('/api/permission-modules/:module_code', authenticateJWT, authorizeAdmin, permissions.remove); // done

// User permissions (admin)
router.post('/api/user-permissions', authenticateJWT, authorizeAdmin, userPermissions.create);
router.put('/api/user-permissions/:id', authenticateJWT, authorizeAdmin, userPermissions.update);

module.exports = router;
