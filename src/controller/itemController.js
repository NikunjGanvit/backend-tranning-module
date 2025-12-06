// controllers/itemController.js
const createItemModuleUsecase = require('../usecase/itemModule/createItemModuleUsecase');
const itemRepo = require('../data-access/repositories/itemModuleRepository');
const { uploadFiles } = require('../utils/minioUploader');
const { generatePresignedUrls } = require('../utils/minioUrlGenerator');

const create = async (req, res, next) => {
  try {
    const payload = {
      requester: req.user,
      item_code: req.body.item_code,
      description: req.body.description,
      length: req.body.length ? Number(req.body.length) : null,
      breadth: req.body.breadth ? Number(req.body.breadth) : null,
      height: req.body.height ? Number(req.body.height) : null,
      files: req.files || []  // From multer
    };

    const created = await createItemModuleUsecase(payload);
    return res.status(201).json(created);
  } catch (err) {
    next(err);  // Passes to error middleware
  }
};

// Controller
const updateItem = async (req, res, next) => {
  try {
    const { item_code } = req.params;
    const patch = req.body;
    const files = req.files || [];

    if (!item_code) {
      return res.status(400).json({ message: 'item_code is required in params' });
    }
    if (!patch || Object.keys(patch).length === 0) {
      return res.status(400).json({ message: 'body must contain fields to update' });
    }

   
    let item_pictures = null;  
    if (files.length > 0) {
      const bucket = 'items-pictures';

      const latest = await itemRepo.findLatestByItemCode(item_code);  
      if (!latest) {
        return res.status(404).json({ message: 'Item not found' });
      }
      const currentVersion = latest.version;
      const nextVersion = currentVersion + 1;

      item_pictures = await uploadFiles(bucket, files, item_code, nextVersion);

      patch.item_pictures = item_pictures;
    }


    const newVersion = await itemRepo.updateByItemCode(item_code, patch, { requester: req.user });

   
    let responseData = newVersion.toJSON ? newVersion.toJSON() : newVersion;
    if (item_pictures && item_pictures.length > 0) {
      const urls = await generatePresignedUrls('items-pictures', item_pictures);
      responseData.item_pictures = urls;  
    }

    return res.status(201).json(responseData);
  } catch (err) {
    next(err);
  }
};

const getLatestByItemCode = async (req, res, next) => {
  try {
    const { item_code } = req.params;
    const item = await itemRepo.findLatestByItemCode(item_code);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    return res.json(item);
  } catch (err) {
    next(err);
  }
};

const listLatestForAll = async (req, res, next) => {
  try {
    const items = await itemRepo.getLatestForAll(req.query);

    return res.json({
      count: items.length,
      data: items
    });

  } catch (err) {
    next(err);
  }
};




const getVersions = async (req, res, next) => {
  try {
    const { item_code } = req.params;
    if (!item_code) return res.status(400).json({ message: 'item_code is required in params' });


    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 50); 
    const offset = (page - 1) * limit;

    const versions = await itemRepo.getAllVersionsForItemCode(item_code, { limit, offset });

    if (!versions || versions.length === 0) {
      return res.status(404).json({ message: `No item versions found for item_code: ${item_code}` });
    }

    return res.json({
      meta: { item_code, count: versions.length, page, limit },
      data: versions
    });
  } catch (err) {
    next(err);
  }
};



const getSpecificVersion = async (req, res, next) => {
  try {
    const { item_code, version } = req.params;
    const ver = Number(version);
    const item = await itemRepo.findByItemCodeAndVersion(item_code, ver);
    if (!item) return res.status(404).json({ message: 'Version not found' });
    return res.json(item);
  } catch (err) {
    next(err);
  }
};


module.exports = {
  create,
  getLatestByItemCode,
  listLatestForAll,
  getVersions,
  getSpecificVersion,
  updateItem

};
