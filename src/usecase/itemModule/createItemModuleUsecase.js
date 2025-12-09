const itemRepo = require('../../data-access/repositories/itemModuleRepository');
const minioUploader = require('../../utils/minioUploader');  // Your uploader

const createItemModuleUsecase = async ({
  requester,
  item_code,
  description,
  length,
  breadth,
  height,
  files = []
}) => {
  if (!requester || typeof requester.id === 'undefined') {
    throw { status: 401, message: 'Unauthenticated request' };
  }

  // Check if item_code already exists (plain object)
  const existing = await itemRepo.findLatestByItemCode(item_code);
  if (existing) {
    throw { status: 409, message: `Item code '${item_code}' already exists` };
  }

  // Version 1 for new
  const nextVersion = 1;

  // Upload images if provided
  let item_pictures = [];
  if (files && files.length > 0) {
    try {
      item_pictures = await minioUploader.uploadFiles(
        'items-pictures',
        files,
        item_code,
        nextVersion
      );

      
    } catch (uploadErr) {
      throw { status: 500, message: 'File upload failed', details: uploadErr.message };
    }
  }

  const payload = {
    item_code,
    description,
    item_pictures,  // Array from MinIO
    length,
    breadth,
    height,
    version: nextVersion,
    created_by: requester.id
  };

  const created = await itemRepo.create(payload);  // Plain object—no .toJSON()

  return created;
};

module.exports = createItemModuleUsecase;