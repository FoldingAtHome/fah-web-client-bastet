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

import fields from './unit_fields.json'


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

  'DUMPED':   'Dumped',
  'EXPIRED':  'Expired',
  'ABORTED':  'Aborted',
  'MISSING':  'Missing Data',
  'RETRIES':  'Max Retries',
  'FAILED':   'Failed',
  'REJECTED': 'Rejected',
  'CREDITED': 'Credited',
}


const wait_status = {
  'ASSIGN':   'Assign Wait',
  'DOWNLOAD': 'Download Wait',
  'CORE':     'Core Wait',
  'RUN':      'Run Wait',
  'UPLOAD':   'Upload Wait',
  'DUMP':     'Dump Wait',
}

const icons = {
  'ASSIGN':   'download',
  'DOWNLOAD': 'download',
  'CORE':     'download',
  'RUN':      'refresh',
  'FINISH':   'refresh',
  'UPLOAD':   'upload',
  'CLEAN':    'check', // Deprecated
  'WAIT':     'clock-o',
  'PAUSE':    'hourglass-o',

  'DUMPED':   'trash',
  'EXPIRED':  'calendar-times-o',
  'CREDITED': 'star',
}


function clean_field(name) {return name.toLowerCase().replaceAll(' ', '_')}


function get_os_icon(os) {
  switch (os) {
  case 'macosx':              os = 'apple';   break
  case 'win32': case 'win64': os = 'windows'; break
  }
  return `<div class="fa fa-${os}"></div>`
}


class Unit {
  constructor(ctx, unit, mach) {
    this.util = ctx.$util
    this.unit = unit
    this.mach = mach
  }

  get id()          {return this.unit.id}
  get machine()     {return this.mach.get_name()}
  get version()     {return this.mach.get_version()}
  get group()       {return this.unit.group}
  get group_name()  {return this.group || 'Default'}
  get assign()      {return this.unit.assignment || {}}
  get number()      {return this.unit.number}
  get core()        {return (this.assign.core || {}).type}
  get project()     {return this.assign.project}
  get run()         {return this.wu.run}
  get clone()       {return this.wu.clone}
  get gen()         {return this.wu.gen}
  get wu()          {return this.unit.wu || {}}
  get type()        {return this.gpus ? 'GPU' : 'CPU'}
  get cpus()        {return this.unit.cpus}
  get gpus()        {return this.unit.gpus.length}
  get os()          {return get_os_icon(this.mach.get_os())}
  get os_text()     {return this.os + this.os_title}
  get os_title()    {return this.mach.get_os()}
  get paused()      {return !!this.unit.pause_reason}
  get work_server() {return this.assign.ws}


  get finish()  {
    return this.unit.state == 'RUN' && this.mach.get_config(this.group).finish
  }


  get gpus_text() {
    let gpus = []
    let info = this.mach.get_info().gpus || {}

    for (let gpu of (this.assign.gpus || []))
      if (gpu in info) gpus.push(info[gpu].description)

    return gpus.length ? gpus.join(' ') : 'none'
  }


  get resources() {
    let cpus = this.cpus
    let gpus = this.gpus_text

    let parts = []
    if (1 < cpus || gpus == 'none') parts.push(`${cpus} CPUs`)
    if (gpus != 'none') parts.push(gpus)

    return parts.join(' ')
  }


  get description() {
    let {project, cpus, gpus_text} = this
    return `project:${project} cpus:${cpus} gpus:${gpus_text}`
  }


  get state() {
    if (this.waiting)     return 'WAIT'
    if (this.finish)      return 'FINISH'
    if (this.paused)      return 'PAUSE'
    if (this.unit.result) return this.unit.result.toUpperCase()
    return this.unit.state
  }

  get status() {return `<div class="fa fa-${this.icon}"></div>`}
  get status_title() {return this._status_text}


  get _status_text() {
    if (this.waiting) return wait_status[this.unit.state] || status[this.state]
    return this.unit.pause_reason || status[this.state]
  }


  get status_text() {return `${this.status} ${this._status_text}`}


  get icon()    {return icons[this.state] || 'times'}
  get ppd_raw() {return this.unit.ppd || 0}
  get ppd()     {return this.ppd_raw.toLocaleString()}


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
    if (this.run == undefined) return '?,?,?'
    return `${this.run},${this.clone},${this.gen}`
  }


  get eta() {
    if (this.waiting) {
      let eta = new Date(this.unit.wait).getTime() - (new Date).getTime()
      // Use "progress" to force updates
      return this.util.time_interval(0 < eta ? eta / 1000 : 0, this.progress)
    }

    let eta = this.wu_progress < 1 ? this.unit.eta : 0
    if (typeof eta == 'string') eta = this.util.parse_interval(eta)

    let s = this.util.time_interval(0 < eta ? eta : 0)

    if (this.deadline < eta)
      s = `<div class="eta-warning",
        title="WARNING: May not complete before deadline.">
        <i class="fa fa-exclamation-triangle"></i> ${s}
        <i class="fa fa-exclamation-triangle"></i></div>`

    return s
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
    let remaining = (this.wait_until - this.util.now) / 1000
    let p = 1 - remaining / this.unit.delay
    return this.util.clamp(p, 0, 1)
  }


  get wu_progress() {
    let p = this.unit.wu_progress
    if (p == undefined) p = this.unit.progress
    return this.util.clamp(p, 0, 1)
  }


   get progress() {
    let p = this.unit.progress || 0
    if (this.wu_progress != undefined &&
      (this.paused || ['RUN', 'CLEAN'].includes(this.unit.state) ||
        this.unit.result))
      p = this.wu_progress
    if (this.waiting) p = this.wait_progress
    return this.util.clamp(p * 100, 0, 100).toFixed(1)
  }


  get base_credit() {return (this.assign.credit || 0).toLocaleString()}


  static has_field(name)      {return name in fields}
  static get_field(name)      {return fields[name] || {}}
  static get_field_size(name) {return Unit.get_field(name).size || 'auto'}
  static get field_names()    {return Object.keys(fields)}


  static get default_columns() {
    return Object.entries(fields).filter(e => e[1].enabled).map(e => e[0])
  }


  static get minimal_columns() {
    return Object.entries(fields).filter(e => e[1].minimal).map(e => e[0])
  }


  static get_column_grid_style(cols, append = '') {
    cols = cols.filter(name => Unit.has_field(name))
    let tmpl = cols.map(name => Unit.get_field_size(name)).join(' ')
    return {'grid-template-columns': tmpl + append}
  }


  get_field_content(name)       {return this[clean_field(name)]}
  static get_field_desc(name)   {return Unit.get_field(name).desc}
  static get_field_header(name) {return Unit.get_field(name).header || name}


  get_field_title(name) {
    return this[clean_field(name) + '_title'] || Unit.get_field_desc(name)
  }


  static get_field_header_class(name) {
    let klass = `unit-${name.toLowerCase().replace(' ', '-')}`
    klass += ` unit-${Unit.get_field(name).align || 'right'}`
    return klass
  }


  get_field_class(name, odd) {
    let klass = Unit.get_field_header_class(name)

    name = clean_field(name)
    if (name == 'status' || name == 'status_text' || name == 'progress')
      klass += ` state-${this.state.toLowerCase()}`

    if (odd != undefined) klass += ` row-${odd ? 'odd' : 'even'}`

    return klass
  }
}

export default Unit
