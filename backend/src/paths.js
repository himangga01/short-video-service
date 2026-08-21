const path = require('path');

function resolveFromBackend(configuredPath, fallbackPath) {
  const targetPath = configuredPath || fallbackPath;
  return path.isAbsolute(targetPath) ? targetPath : path.resolve(__dirname, '..', targetPath);
}

const uploadRoot = resolveFromBackend(process.env.UPLOAD_DIR, 'uploads');
const imageUploadDir = path.join(uploadRoot, 'images');
const audioUploadDir = path.join(uploadRoot, 'audio');
const renderUploadDir = path.join(uploadRoot, 'renders');

function localPathFromUploadUrl(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) {
    return null;
  }

  const relativePath = url.replace(/^\/uploads\//, '');
  const resolvedPath = path.resolve(uploadRoot, relativePath);
  const isInsideUploads =
    resolvedPath === uploadRoot || resolvedPath.startsWith(`${uploadRoot}${path.sep}`);

  return isInsideUploads ? resolvedPath : null;
}

function uploadUrlFor(folder, filename) {
  return `/uploads/${folder}/${filename}`;
}

module.exports = {
  uploadRoot,
  imageUploadDir,
  audioUploadDir,
  renderUploadDir,
  localPathFromUploadUrl,
  uploadUrlFor,
};
