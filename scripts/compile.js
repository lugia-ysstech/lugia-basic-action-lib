/**
 *
 * create by grg on 2020/6/30
 *
 * @flow
 */

const is = require('electron-is');
const kill = require('tree-kill');

const { outputJson, readJsonSync, ensureFileSync } = require('fs-extra');
const { join } = require('path');
const path = require('path');
const { fork } = require('child_process');
const runPath = require('npm-run-path');

const moduleName = '@lugia/action-plugin';

const result = {};

function getEnv() {
  const env = runPath.env();
  const result = Object.assign({}, process.env, env, {
    CLICOLOR: 1,
    FORCE_COLOR: 1,
    COLORTERM: 'truecolor',
    TERM: 'xterm-256color',
  });
  const newPath = [
    join(__dirname, './app/bin'),
    './node_modules',
    './.bin',
    env.PATH,
    process.env.PATH,
  ].filter(e => !!e);

  const isWindows = is.windows();
  if (isWindows) {
    const e = Object.keys(process.env);
    const hasLowerPath = e.indexOf('Path') !== -1;
    const hasUpperPath = e.indexOf('PATH') !== -1;
    const newPathString = newPath.join(path.delimiter);
    if (hasUpperPath) {
      result.PATH = newPathString;
    } else if (hasLowerPath) {
      result.Path = newPathString;
    } else {
      result.path = newPathString;
    }
    console.info('pack in windows');
  } else {
    newPath.push('/usr/local/bin');
    result.PATH = newPath.join(path.delimiter);
    console.info('pack in mac');
  }

  return result;
}

function singleCompile(path, cwd) {
  const forkPath = join(path, './mega/singleCompile.js');

  return fork(forkPath, [], {
    cwd,
    env: {
      ...getEnv(),
      PATH: join(__dirname, './app/bin/node_modules/.bin'),
      NODE_ENV: 'production',
      __FROM_TEST: true,
      ESLINT: 'none',
      TSLINT: 'none',
      COMPRESS: 'none',
    },
    stdio: [null, 'ignore', null, 'ipc'],
  });
}

async function getAction(info) {
  const {
    pluginName,
    title: pluginTitle,
    desc: pluginDesc,
    userDef: pluginUserDef,
    type: pluginType,
    entryPath,
    outputDir: outputDirName,
  } = info;
  const outputDir = join(__dirname, outputDirName);
  // const outputPath = join(outputDir, './plugin.dll.json');
  const version = getPkgVersion();
  const targetName = `__${moduleName}__${pluginName}`;

  const buildAction = async () => {
    let action;
    const path = join(__dirname);
    const cwd = join(__dirname, entryPath);
    // const entryFileName = 'index';
    // const entry = entryFileName + '.ts';
    const entry = 'index.js';

    let processInfo;
    const lugiaResult = new Promise(async (resolve, reject) => {
      try {
        processInfo = singleCompile(path, cwd);
        processInfo
          .on('message', m => {
            if (m && m.SINGLE_COMPILED) {
              const { error, assets } = m;

              if (error) {
                reject(error);
              }

              if (assets) {
                const asset = assets.filter(a => a.name === entry)[0] || null;
                action = {
                  version,
                  targetName,
                  asset,
                };
                resolve(action);
                // outputJson(outputPath, action, err => {
                //   if (err) {
                //     reject(err);
                //   } else {
                //     resolve(action);
                //   }
                // });
              }
            } else {
              console.log('SINGLE_COMPILE_PATH message [', m, ']');
            }
          })
          .on('error', error => {
            const msg = error.toString();
            console.log('SINGLE_COMPILE_PATH error [', msg, ']');
            reject(msg);
          })
          .on('exit', code => {
            console.log('SINGLE_COMPILE_PATH exit [', code, ']');
          })
          .send({
            SINGLE_COMPILE: true,
            cwd,
            entry,
            name: targetName,
            // outputDir,
            publicPath: `file:///${outputDir.replace(/\\/g, '\\\\')}/`,
            disableCssExtract: true,
          });
      } catch (e) {
        reject(e);
      }
    });
    lugiaResult.then(res => {
      result[pluginName] = {
        title: pluginTitle,
        desc: pluginDesc,
        userDef: pluginUserDef,
        type: pluginType,
        code: res.asset.content,
        targetName,
      };
    });
    lugiaResult.catch(err => {
      console.error(err);
    });
    lugiaResult.finally(() => {
      kill(processInfo.pid, 'SIGKILL');
    });

    return lugiaResult;
  };

  return buildAction();
}

function getPkgVersion() {
  const { version } = readJsonSync(join(__dirname, '../package.json'));

  return version;
}

async function compile(buildData) {
  for (let i = 0; i < buildData.length; i++) {
    await getAction(buildData[i]);
  }

  const pluginDllPath = path.join(__dirname, '../pluginInfos.dll.json');
  console.log('actions =====>>>>', Object.keys(result));
  ensureFileSync(pluginDllPath);
  return outputJson(pluginDllPath, result);
}

module.exports = compile;
