import {reactive, watchEffect} from 'vue'
import Sock   from './sock.js'
import util   from './util.js'
import Cookie from './cookie.js'

const default_host = '127.0.0.1'
const default_port = 7396
const api_url      = 'https://api.foldingathome.org'


class Client extends Sock {
  constructor(address = '', ...args) {
    let peer = util.parse_peer_address(address)
    if (!peer) throw 'Invalid peer address "' + address + "'"

    let host = peer.host || default_host
    let port = peer.port || default_port
    let path = peer.path || ''

    let url = 'ws://' + host + ':' + port + '/api/websocket' + path
    super(url, ...args)

    this.state = reactive({
      host:        peer.host,
      port:        peer.port,
      path:        peer.path,
      address,
      default:     address == '',
      connected:   false,
      log_enabled: false,
      viz_unit:    undefined,
      stats:       new Cookie().get('stats', {}),
      data:        {}
    })

    this.connect()
  }


  version() {
    return this.state.data.info ? this.state.data.info.version : undefined
  }


  on_open() {
    this.first = true
    this.state.connected = true
    this.watch_config_stop = watchEffect(() => {this.update_stats()})
  }


  on_close(event) {
    this.state.connected = false
    if (this.watch_config_stop) this.watch_config_stop()
  }


  on_message(msg) {
    console.debug(this.state.address + ':', msg)

    if (this.first) {
      this.state.data = msg
      this._update()

    } else util.update(this.state.data, msg)

    this.first = false
  }


  _update() {
    if (this.viz_unit)    this._send_viz_enable()
    if (this.log_enabled) this._send_log_enable()
  }


  paused() {
    if (!this.state.data.config) return false
    return this.state.data.config.paused
  }


  fold()            {this.send({cmd: 'unpause'})}
  finish()          {this.send({cmd: 'finish'})}
  pause()           {this.send({cmd: 'pause'})}
  dump(unit)        {this.send({cmd: 'dump', unit})}
  configure(config) {this.send({cmd: 'config', config})}


  is_active() {
    let units = this.state.data.units

    if (units && units.length)
      for (let unit of units)
        if (!unit.paused) return true

    return false
  }


  viz_get_frames() {
    let unit = this.viz_unit
    if (unit && this.state.data.viz && this.state.data.viz[unit])
      return this.state.data.viz[unit].frames.length
  }


  _send_viz_enable() {
    if (!this.connected) return
    const unit   = this.viz_unit
    const frames = this.viz_get_frames()
    this.send({cmd: 'viz', unit, frames})
  }


  visualize_unit(unit) {
    if (this.viz_unit == unit) return
    this.viz_unit = unit || undefined
    this._send_viz_enable()
  }


  _send_log_enable() {
    if (this.connected) this.send({cmd: 'log', enable: this.log_enabled})
  }


  log_enable(enable) {
    if (this.log_enabled == enable) return
    this.log_enabled = enable
    this._send_log_enable()
  }


  update_stats() {
    // TODO update stats periodically
    if (!this.state.data.config) return

    let {user, team, passkey} = this.state.data.config
    if (!user) return

    let url = api_url + `/user/${user}/stats?team=${team}`
    if (passkey) url += `&${passkey}`

    fetch(url)
      .then(r => r.json())
      .then(data => {
        let config = this.state.data.config

        if (user == config.user && team == config.team &&
            passkey == config.passkey) {
          this.state.stats = data
          new Cookie().set('stats', data)
        }
      })
  }
}

export default Client
