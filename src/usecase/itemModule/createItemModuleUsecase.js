const itemRepo = require('../../data-access/repositories/itemModuleRepository');
const minioUploader = require('../../utils/minioUploader'); // correct helper path

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

  // ❗ Check if item_code already exists
  const existing = await itemRepo.findLatestByItemCode(item_code);
  if (existing) {
    throw { status: 409, message: `Item code '${item_code}' already exists` };
  }

  // Since item_code doesn't exist → this will be version 1
  const nextVersion = 1;

  // Upload images if provided (use your minioUploader)
  let item_pictures = [];
  if (files && files.length > 0) {
    try {
      item_pictures = await minioUploader.uploadFiles(
        'items-pictures',  // Bucket name (match your MinIO setup)
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
    item_pictures,  // Array of URLs from MinIO
    length,
    breadth,
    height,
    version: nextVersion,
    created_by: requester.id
  };

  const created = await itemRepo.create(payload);

  return created.toJSON ? created.toJSON() : created;
};

module.exports = createItemModuleUsecase;

