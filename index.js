const _ = require('lodash')
const debug = require('debug')('ali-acm')
const AcmClient = require('@alicloud/acm-sdk')
const makeSynchronous = require('make-synchronous')

class AliAcm extends AcmClient {
  constructor (opts = {}) {
    super(opts)

    opts.json = opts.json == null ? true : opts.json
    this._opts = opts
    this._config = {}

    this._sync()
  }

  _sync () {
    const result = makeSynchronous(async (opts) => {
      const setObj = require('lodash/set')
      const AcmClient = require('@alicloud/acm-sdk')
      const acmClient = new AcmClient(opts)

      const result = {
        configObj: {},
        configInfoArray: await acmClient.getAllConfigInfo()
      }
      // get all config
      await Promise.all(result.configInfoArray.map(async configInfo => {
        const dataIdConfig = await acmClient.getConfig(configInfo.dataId, configInfo.group)
        try {
          setObj(result.configObj, `${configInfo.group}.${configInfo.dataId}`, opts.json ? JSON.parse(dataIdConfig) : dataIdConfig)
        } catch (e) {
          console.error(`group: ${configInfo.group}, dataId: ${configInfo.dataId}, error: ${e}`)
        }
      }))
      return result
    })(this._opts)

    this._config = result.configObj
    debug(`[sync] config: ${JSON.stringify(this._config, null, 2)}`)

    // subscribe all dataId
    for (const configInfo of result.configInfoArray) {
      this.subscribe(configInfo, newDataIdConfig => {
        debug(`[subscribe] group: ${configInfo.group}, dataId: ${configInfo.dataId}, config: ${newDataIdConfig}`)
        try {
          _.set(this._config, `${configInfo.group}.${configInfo.dataId}`, this._opts.json ? JSON.parse(newDataIdConfig) : newDataIdConfig)
        } catch (e) {
          console.error(`group: ${configInfo.group}, dataId: ${configInfo.dataId}, error: ${e}`)
        }
      })
    }

    return this
  }

  get (path) {
    return _.get(this._config, path)
  }
}

module.exports = AliAcm
