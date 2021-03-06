import { app, applicationTempPath, jimp, path, remote } from '@/global';
import directoryTree from 'directory-tree';
import moment from 'moment';
import uuid from 'uuid';
// @ts-ignore
const fs = remote.require('fs');

export function showSelectFolderDialog() {
  const dialog = remote.dialog;
  return dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
}

export function selectImageFiles({ path }) {
  const dialog = remote.dialog;
  return dialog.showOpenDialog({
    defaultPath: path,
    filters: [
      { name: 'image', extensions: ['jpg', 'png', 'jpeg'] },
    ],
    properties: ['openFile', 'multiSelections'],
  });
}

export function selectImageFile({ path }) {
  const dialog = remote.dialog;
  return dialog.showOpenDialog({
    defaultPath: path,
    filters: [
      { name: 'image', extensions: ['jpg', 'png', 'jpeg'] },
    ],
    properties: ['openFile'],
  });
}

export function readFolders({ path }) {
  const tree = directoryTree(path);
  return tree;
}

export async function listDir({ path }) {
  return new Promise(
    (resolve, reject) => {
      fs.readdir(path, (err, files) => {
        if (err) {
          reject(err);
        }
        resolve(files);
      });
    },
  );
}

export async function loadCoverFile({ originFilePath, originThumbnailPath, filePath, projectPath }) {
  const image = await jimp.read(filePath);
  const sourceFileName = path.posix.basename(filePath);
  const sourceFileExt = path.extname(sourceFileName);
  const coverFileName = `${uuid.v4()}${sourceFileExt}`;
  const coverThumbnailFileName = `${uuid.v4()}${sourceFileExt}`;
  await image.writeAsync(path.join(projectPath,coverFileName));
  await image
    .resize(150, jimp.AUTO)
    .writeAsync(path.join(projectPath,coverThumbnailFileName));
  if (originFilePath !== undefined) {
    fs.unlinkSync(originFilePath);
  }
  if (originThumbnailPath !== undefined) {
    fs.unlinkSync(originThumbnailPath);
  }
  return {
    coverName: coverFileName,
    cover: path.join(projectPath,coverFileName),
    thumbnail: path.join(projectPath,coverThumbnailFileName),
    thumbnailName: coverThumbnailFileName,
  };
}


export function listDirectoryFiles({ path }) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        reject(err);
      }
      resolve(files);
    });
  });
}

export function readFileStat({ filePath }) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      }
      resolve(stats);
    });
  });
}

export function writeFile({ path, data }) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

export function readProjectConfig({ projectPath }) {
  const storePath = path.join(projectPath, 'project.json');
  return new Promise((resolve, reject) => {
    fs.readFile(storePath, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(data));
    });
  });
}



export function deleteBookPagesFile({ pages }: { pages: Array<{ filePath, thumbnailPath }> }) {
  pages.forEach(pageToDelete => {
    fs.unlinkSync(pageToDelete.filePath);
    fs.unlinkSync(pageToDelete.thumbnailPath);
  });
}

export function getFilesWithExtension({ sourceDirectoryPath, extensions }) {
  return new Promise((resolve, reject) => {
    fs.readdir(sourceDirectoryPath, (err, files) => {
      if (err) {
        reject(err);
      }
      const imageFiles = files.filter(fileName => {
        return extensions.find(extension => path.extname(fileName).toLowerCase() === extension.toLowerCase()) !== undefined;
      });
      resolve(imageFiles);
    });
  });
}
