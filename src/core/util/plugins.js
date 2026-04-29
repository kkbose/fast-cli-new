/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable operator-assignment */
/* eslint-disable no-console */
/* eslint-disable brace-style */
/* eslint-disable no-else-return */
/* eslint-disable semi */
/* eslint-disable prefer-const */
/* eslint-disable no-implicit-coercion */
/* eslint-disable arrow-parens */
/* eslint-disable no-undef */
/* eslint-disable indent */
'use strict'
const pluginExists = (name) => {
    if (localStorage.getItem('plugins')) {
        // eslint-disable-next-line prefer-const
        let plugins = JSON.parse(localStorage.getItem('plugins'))
        // eslint-disable-next-line arrow-parens
        return !!plugins.find((i) => i.templateId === name)
    }
    
        return false
};
// get installed  plugin from templateId
const getPlugin = function (templateId) {
    if (localStorage.getItem('plugins')) {
        let plugins = JSON.parse(localStorage.getItem('plugins'))
        let plugin = plugins.find((item) => item.templateId === templateId)
        if (plugin)
            return plugin
        return null
    }
    else {
        return null
    }
}
const getAllPlugins = () => {
    if (localStorage.getItem('plugins')) {
        let plugins = JSON.parse(localStorage.getItem('plugins'))
        return plugins
    }
}
const getPluginListView = () => {
    let p = getAllPlugins()
    if (p) {
        let r = ''
        console.log(p)
        p.forEach((q) => {
            r =
                r +
                    `

         <div class="card hoverable">
         <div class="card-content">
         <span class="card-title">${q.name || 'No name'}</span>
         <div class="card-content"><p>${q.description || 'No description'}</p></div>
         <div class="row">
         ${q.tag.map((t) => `<div class="chip">${t}</div>`).join('\n')}
         </div>
         </div>
         </div>

      `
        })
        return `
  <div class="row">${r}</div>`
    }
    
        return '<p>No Plugins installed<p>'
};
function sleep(milliseconds) {
    const date = Date.now()
    let currentDate = null
    do {
        currentDate = Date.now()
    } while (currentDate - date < milliseconds)
}
module.exports = {
    pluginUpload,
    pluginExists,
    getPlugin,
    getAllPlugins,
    getPluginListView,
}
