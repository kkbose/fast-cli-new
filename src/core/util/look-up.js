/* eslint-disable no-useless-return */
/* eslint-disable semi */
'use strict'
module.exports = {
  ref: function (variables) {
    return function (ref) {
      // let name = ref.slice(5);
      // eslint-disable-next-line prefer-const
      let refName = ref.match(/\:([a-zA-Z0-9]*)\|/)
      // eslint-disable-next-line prefer-const
      let name = refName[1]
      // eslint-disable-next-line prefer-const
      let result = variables.find(i => i.variable === name)
      if (result) {
        return result
      }
      return;
    };
  },
}
