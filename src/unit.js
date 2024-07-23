/******************************************************************************\

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2024, foldingathome.org
                               All rights reserved.

       This program is free software; you can redistribute it and/or modify
       it under the terms of the GNU General Public License as published by
        the Free Software Foundation; either version 3 of the License, or
                       (at your option) any later version.

         This program is distributed in the hope that it will be useful,
          but WITHOUT ANY WARRANTY; without even the implied warranty of
          MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
                   GNU General Public License for more details.

     You should have received a copy of the GNU General Public License along
     with this program; if not, write to the Free Software Foundation, Inc.,
           51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

                  For information regarding this software email:
                                 Joseph Coffland
                          joseph@cauldrondevelopment.com

\******************************************************************************/

import columns from './columns.json'


const status = {
  'ASSIGN':   'Assigning',
  'DOWNLOAD': 'Downloading',
  'CORE':     'Core',
  'RUN':      'Running',
  'FINISH':   'Finishing',
  'UPLOAD':   'Uploading',
  'CLEAN':    'Ended',
  'WAIT':     'Waiting',
  'PAUSE':    'Paused',
  'DUMP':     'Dumping',
}

const icons = {
  'ASSIGN':   'download',
  'DOWNLOAD': 'download',
  'CORE':     'download',
  'RUN':      'refresh',
  'FINISH':   'refresh',
  'UPLOAD':   'upload',
  'CLEAN':    'star',
  'WAIT':     'clock-o',
  'PAUSE':    'hourglass-o',
}


function clean_column(name) {return name.toLowerCase().replaceAll(' ', '_')}


class Unit {
  constructor(ctx, unit, mach) {
    this.util = ctx.$util
    this.unit = unit
    this.mach = mach
  }

  get id()      {return this.unit.id}
  get group()   {return this.unit.group}
  get assign()  {return this.unit.assignment || {}}
  get number()  {return this.unit.number}
  get core()    {return (this.assign.core || {}).type}
  get project() {return this.assign.project}
  get run()     {return this.wu.run}
  get clone()   {return this.wu.clone}
  get gen()     {return this.wu.gen}
  get wu()      {return this.unit.wu || {}}
  get cpus()    {return this.unit.cpus}
  get gpus()    {return this.unit.gpus.length}
  get paused()  {return !!this.unit.pause_reason}


  get finish()  {
    return this.unit.state == 'RUN' && this.mach.get_config(this.group).finish
  }


  get cpus_description() {return this.assign.cpus}


  get gpus_description() {
    let gpus = []
    let info = this.mach.get_info().gpus || {}

    for (let gpu of (this.assign.gpus || []))
      if (gpu in info) gpus.push(info[gpu].description)

    return gpus.length ? gpus.join(' ') : 'none'
  }


  get description() {
    return 'project:' + this.project + ' cpus:' + this.assign.cpus +
      ' gpus:' + (this.assign.gpus || []).join(' ')
  }


  get state() {
    if (this.waiting) return 'WAIT'
    if (this.finish)  return 'FINISH'
    if (this.paused)  return 'PAUSE'
    return this.unit.state
  }

  get status() {return `<div class="fa fa-${this.icon}"/>`}
  get status_title() {return this.status_text}


  get status_text() {
    if (this.waiting) return status[this.unit.state]
    return this.unit.pause_reason || status[this.state]
  }


  get icon() {return icons[this.state]}
  get ppd()  {return (this.unit.ppd || 0).toLocaleString()}


  get tpf_secs()  {
    let frames   = (this.unit.wu_progress || 0) * 100
    let run_time = this.run_time_secs
    return run_time / frames
  }


  get tpf() {
    return this.tpf_secs ? this.util.time_interval(this.tpf_secs) : '???'
  }


  get deadline() {
    return this.util.format_timeout(this.assign.time, this.assign.deadline)
  }


  get timeout()  {
    return this.util.format_timeout(this.assign.time, this.assign.timeout)
  }


  get assign_time() {return this.util.since(this.assign.time) + ' ago'}
  get assign_time_title() {return this.util.format_time(this.assign.time)}


  get deadline_time() {
    return this.util.timeout_time(this.assign.time, this.assign.deadline)
  }


  get timeout_time() {
    return this.util.timeout_time(this.assign.time, this.assign.timeout)
  }


  get rcg() {
    if (this.run == undefined) return '?.?.?'
    return `${this.run},${this.clone},${this.gen}`
  }


  get eta() {
    if (this.waiting) {
      let eta = new Date(this.unit.wait).getTime() - (new Date).getTime()
      // Use "progress" to force updates
      return this.util.time_interval(eta / 1000, this.progress)
    }

    if (this.wu_progress == 1) return '0s'

    let eta = this.unit.eta
    return (typeof eta == 'string') ? eta : this.util.time_interval(eta)
  }


  get run_time_secs() {
    let t = this.unit.run_time || 0

    if (this.unit.state == 'RUN' && this.unit.start_time != undefined) {
      let st = new Date(this.unit.start_time).getTime()
      t += (new Date().getTime() - st) / 1000
    }

    return t
  }


  get run_time() {
    // Use "progress" to force updates
    return this.util.time_interval(this.run_time_secs, this.progress)
  }


  get cs() {return (this.wu.cs || []).join(', ')}


  get wait_until() {return new Date(this.unit.wait).getTime()}
  get waiting() {return this.unit.wait && this.util.now < this.wait_until}


  get wait_progress() {
    if (!this.waiting) return 0
    let p = 1 - (this.wait_until - this.util.now) / 1000 / this.unit.delay
    return (0 <= p && p <= 1) ? p : 0
  }


  get wu_progress() {
    let p = this.unit.wu_progress
    return (0 <= p && p <= 1) ? p : (this.unit.progress || 0)
  }


   get progress() {
    let p = this.unit.progress
    if ((this.paused || this.unit.state == 'RUN' ||
      this.unit.state == 'CLEAN')) p = this.wu_progress
    if (this.waiting) p = this.wait_progress
    return (0 <= p && p <= 1) ? (p * 100).toFixed(1) : 0
  }


  get base_credit() {return (this.assign.credit || 0).toLocaleString()}


  static get_column(name)   {return columns[name] || {}}
  static get column_names() {return Object.keys(columns)}


  static get default_columns() {
    return Object.entries(columns).reduce((l, col) => {
      if (col[1].enabled) l.push(col[0])
      return l
    }, [])
  }


  static get_column_grid_template(cols) {
    return cols.map(name => columns[name].size || 'auto').join(' ')
  }


  static get_column_grid_style(cols, append = '') {
    let tmpl = Unit.get_column_grid_template(cols)
    return {'grid-template-columns': tmpl + append}
  }


  get_column_content(name)      {return this[clean_column(name)]}
  static get_column_desc(name) {return Unit.get_column(name).desc}


  get_column_title(name) {
    return this[clean_column(name) + '_title'] || Unit.get_column_desc(name)
  }


  static get_column_header_class(name) {
    return 'column-' + name.toLowerCase().replace(' ', '-')
  }


  get_column_class(name, odd) {
    let klass = Unit.get_column_header_class(name)

    if (name == 'Status' || 'Status Text')
      klass += ` state-${this.state.toLowerCase()}`

    klass += ` column-${Unit.get_column(name).left ? 'left' : 'right'}`
    if (odd != undefined) klass += ` row-${odd ? 'odd' : 'even'}`

    return klass
  }
}

export default Unit
