const express = require('express');
const router = express.Router();

const auth = require('../controller/authController');
const users = require('../controller/usersController');
const permissions = require('../controller/permissionController');
const userPermissions = require('../controller/userPermissionController');
const item = require('../controller/itemController');
const authorizePermission = require('../utils/checkPermission');
const role = require('../controller/roleController');
const assignrole = require('../controller/roleAssignController');

const multer = require('multer');  
const upload = multer({ 
  storage: multer.memoryStorage(),  
  limits: { fileSize: 10 * 1024 * 1024, files: 5 }  
});

const { authenticateSession, authorizeAdmin } = require('../utils/validation'); 

// Auth
router.post('/api/auth/register', auth.register); // Done
router.post('/api/auth/login', auth.login); // Done
router.post('/api/auth/logout',auth.logout);


// Users
router.get('/api/users/:id', authenticateSession,authorizePermission('view'),users.getById); // Done
router.put('/api/users/:id/profile', authenticateSession,authorizePermission('update'), users.updateProfile); // done
router.put('/api/users/:id/password', authenticateSession, authorizePermission('update'), users.updatePassword); // done
router.delete('/api/users/:id', authenticateSession, authorizePermission('delete'), users.softDelete); // done
router.post('/api/users',authenticateSession,authorizePermission('create'),users.createUser);

// Permission modules (admin)
router.post('/api/permission-modules',authenticateSession, authorizeAdmin, permissions.create);//done 
router.put('/api/permission-modules/:module_code', authenticateSession, authorizeAdmin, permissions.update); // done
router.delete('/api/permission-modules/:module_code', authenticateSession, authorizeAdmin, permissions.remove); // done

// User permissions (admin)
router.post('/api/user-permissions', authenticateSession, authorizeAdmin, userPermissions.create);
router.put('/api/user-permissions/:id', authenticateSession, authorizeAdmin, userPermissions.update);

//Item module 
router.post('/api/item-modules',authenticateSession,upload.array('pictures', 5), item.create); // create item
router.put('/api/item-modules/:item_code', authenticateSession, upload.array('pictures', 5),item.updateItem); // update version 
router.get('/api/item-modules',authenticateSession,item.listLatestForAll); // get all item // done
router.get('/api/item-modules/:item_code',authenticateSession,item.getLatestByItemCode); // get latest item by item_code // done 
router.get('/api/item-modules/all-version/:item_code',authenticateSession,item.getVersions); //all version for item_code

//Roles 
router.get('/api/roles/:role_id',authenticateSession,authorizeAdmin,role.getById); //get role by id
router.get('/api/roles',authenticateSession,authenticateSession,role.list); // get all roles
router.post('/api/roles',authenticateSession,authorizeAdmin,role.create); // create role 
router.put('/api/roles/:role_id',authenticateSession,authorizeAdmin,role.update); // update role by id 
router.delete('/api/roles/:role_id',authenticateSession,authorizeAdmin,role.remove); // delete role by id 

//Assign Roles
router.post('/api/assign-role',authenticateSession,authorizeAdmin,assignrole.assign);

module.exports = router;
