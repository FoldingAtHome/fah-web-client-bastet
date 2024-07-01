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
  'CLEAN':    'stop',
  'WAIT':     'clock-o',
  'PAUSE':    'hourglass-o',
}


class Unit {
  constructor(ctx, unit) {
    this.util = ctx.$util
    this.unit = unit
  }

  get assign()  {return this.unit.assignment || {}}
  get number()  {return this.unit.number}
  get core()    {return (this.assign.core || {}).type}
  get project() {return this.assign.project}
  get wu()      {return this.unit.wu || {}}


  get unit_id() {
    if (this.wu)
      return `Work Unit #${this.unit.number} Project ${this.project} ` +
        `Run ${this.wu.run} Clone ${this.wu.clone} Gen ${this.wu.gen}`
  }


  get cpus()   {return this.unit.cpus}
  get gpus()   {return this.unit.gpus.length}
  get paused() {return !!this.unit.pause_reason}


  get cpus_description() {return this.assign.cpus}


  get gpus_description() {
    return this.assign.gpus ? this.assign.gpus.join(' ') : 'None'
  }


  get state() {
    if (this.waiting) return 'WAIT'
    if (this.unit.pause_reason) return 'PAUSE'
    if (this.unit.state == 'RUN' && this.finish) return 'FINISH'
    return this.unit.state
  }


  get icon() {return icons[this.state]}
  get ppd()  {return (this.unit.ppd || 0).toLocaleString()}
  get tpf()  {
    let frames   = (this.unit.wu_progress || 0) * 100
    let run_time = this.run_time_secs
    return frames ? this.util.time_interval(run_time / frames) : '???'
  }


  get deadline() {
    return this.util.format_timeout(this.assign.time, this.assign.deadline)
  }


  get timeout()  {
    return this.util.format_timeout(this.assign.time, this.assign.timeout)
  }


  get assigned() {
    let secs = (new Date(this.assign.time) - new Date().getTime()) / 1000
    return this.util.time_interval(-secs) + ' ago'
  }


  get assign_time() {
    return this.util.format_time(this.assign.time)
  }


  get deadline_time() {
    return this.util.timeout_time(this.assign.time, this.assign.deadline)
  }


  get timeout_time() {
    return this.util.timeout_time(this.assign.time, this.assign.timeout)
  }


  get rcg() {return this.wu.run + ',' + this.wu.clone + ',' + this.wu.gen}


  get eta() {
    if (this.waiting) {
      let eta = new Date(this.unit.wait).getTime() - (new Date).getTime()
      // Use "progress" to force updates
      return this.util.time_interval(eta / 1000, this.progress)
    }

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


  get status() {
    if (this.waiting) return status[this.unit.state]
    return this.unit.pause_reason || status[this.state]
  }


  get cs() {return (this.wu.cs || []).join(', ')}


  get wait_until() {return new Date(this.unit.wait).getTime()}
  get waiting() {return this.unit.wait && this.util.now < this.wait_until}


  get wait_progress() {
    if (!this.waiting) return 0
    return 1 - (this.wait_until - this.util.now) / 1000 / this.unit.delay
  }


  get wu_progress() {
    let p = this.unit.wu_progress
    return p == undefined ? this.unit.progress || 0 : p
  }


  get progress() {
    let p = this.unit.progress
    if ((this.paused || this.unit.state == 'RUN' ||
      this.unit.state == 'CLEAN')) p = this.wu_progress
    if (this.waiting) p = this.wait_progress
    return isNaN(p) ? 0 : (p * 100).toFixed(1)
  }


  get credit() {return (this.assign.credit || 0).toLocaleString()}


  get assign_time() {return this.util.format_time(this.assign.time)}
}

export default Unit
