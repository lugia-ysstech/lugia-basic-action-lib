/**
 *
 * create by guorg
 *
 * @flow
 */
const path = require('path');
const fs = require('fs');
const ensureFileSync = require('fs-extra').ensureFileSync;
const writeJsonSync = require('fs-extra').writeJsonSync;
const readJsonSync = require('fs-extra').readJsonSync;

const fileRelativePath = '../src/actions';

function getTargetPath(targetPath) {
  const url = targetPath || fileRelativePath;
  return path.join(__dirname, url);
}

async function getFolderNames(
  targetPath,
  Invalid,
) {
  return fs
    .readdirSync(getTargetPath(targetPath))
    .filter(
      (folderName) =>
        Invalid.indexOf(folderName) === -1 && folderName.indexOf('.') === -1,
    );
}

async function create() {
  const folder = await getFolderNames(fileRelativePath, []);

  const pluginsMeta = {};
  folder.forEach(folderItem => {
    const meta = readJsonSync(path.join(__dirname, fileRelativePath, folderItem, `${folderItem}.zh-CN.json`));
    const { actionName } = meta;
    pluginsMeta[actionName] = meta;
  });

  const targetPath = path.join(__dirname, fileRelativePath, 'actionsLibMeta.json');
  ensureFileSync(targetPath);
  writeJsonSync(targetPath, pluginsMeta);
}

create();
