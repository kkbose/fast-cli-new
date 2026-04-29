"use strict";
/* eslint-disable unicorn/filename-case */
const { generateFiles } = require('./code.js');
const path = require('path');
const os = require('os');
const { fileContentUpdates } = require('./update.js');
const generateCodeV2 = async (input, workspace) => {
    // let response = []
    const lookup = input.lookUpTable;
    const varLookup = input.variables;
    let promiseArr = [];
    promiseArr = input.projectConfig.applications.map(async (appData) => {
        // input.projectConfig.applications.forEach(appData => {
        // let pluginPath = getPlugin(appData.templateId).pluginPath;
        let pluginPath = path.join(os.homedir(), '.fast', 'templates', appData.templateId);
        let resp = await generateFiles(workspace, pluginPath, appData, lookup, varLookup);
        // console.log("resp is ",resp)
        // return output;
        return resp;
        // response.push(resp)
    });
    let response = await Promise.all(promiseArr);
    response = response.flat();
    // console.log("line 32==>",response);
    if (response.filter(({ isUpdate }) => isUpdate).length > 0) {
        response = fileContentUpdates({
            response,
        });
    }
    return response;
};
module.exports = { generateCodeV2 };
