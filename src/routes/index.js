const express = require('express');
const router = express.Router();

const auth = require('../controller/authController');
const users = require('../controller/usersController');
const permissions = require('../controller/permissionController');
const userPermissions = require('../controller/userPermissionController');

const { authenticateSession, authorizeAdmin } = require('../utils/validation'); 

// Auth
router.post('/api/auth/register', auth.register); // Done
router.post('/api/auth/login', auth.login); // Done
router.post('/api/auth/logout',auth.logout);


// Users
router.get('/api/users/:id', authenticateSession, users.getById); // Done
router.put('/api/users/:id/profile', authenticateSession, users.updateProfile); // done
router.put('/api/users/:id/password', authenticateSession, users.updatePassword); // done
router.delete('/api/users/:id', authenticateSession, authorizeAdmin, users.softDelete); // done
router.post('/api/users',authenticateSession,users.createUser);

// Permission modules (admin)
router.post('/api/permission-modules',authenticateSession, authorizeAdmin, permissions.create);//done 
router.put('/api/permission-modules/:module_code', authenticateSession, authorizeAdmin, permissions.update); // done
router.delete('/api/permission-modules/:module_code', authenticateSession, authorizeAdmin, permissions.remove); // done

// User permissions (admin)
router.post('/api/user-permissions', authenticateSession, authorizeAdmin, userPermissions.create);
router.put('/api/user-permissions/:id', authenticateSession, authorizeAdmin, userPermissions.update);

module.exports = router;

