/******************************************************************************\

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2023, foldingathome.org
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

import {createApp}    from 'vue'
import App            from './App.vue'
import router         from './router'
import Button         from './Button.vue'
import Dialog         from './Dialog.vue'
import HelpBalloon    from './HelpBalloon.vue'
import FAHLogo        from './FAHLogo.vue'
import ClientVersion  from './ClientVersion.vue'
import Cache          from './cache.js'
import API            from './api.js'
import Account        from './account.js'
import util           from './util.js'
import crypto         from './crypto.js'
import Node           from './node.js'
import Machines       from './machines.js'
import Stats          from './stats.js'
import Projects       from './projects.js'
import News           from './news.js'
import DirectMachConn from './direct-mach-conn.js'


async function main(url) {
  const cache   = new Cache('fah')
  const api     = new API(url, cache)
  const account = new Account(api)
  const adata   = await account.try_login()
  const machs   = new Machines(api, account)
  const app     = createApp(App);
  const global  = app.config.globalProperties

  console.debug({account: Object.assign({}, adata)})

  global.$util     = util
  global.$crypto   = crypto
  global.$adata    = adata
  global.$account  = account
  global.$api      = api
  global.$machs    = machs
  global.$node     = new Node(account, machs)
  global.$projects = new Projects(api, machs)
  global.$stats    = new Stats(global)
  global.$news     = new News(cache)

  new DirectMachConn(machs, 'local', '127.0.0.1:7396')

  app.use(router)
  app.component('Button',        Button)
  app.component('Dialog',        Dialog)
  app.component('HelpBalloon',   HelpBalloon)
  app.component('FAHLogo',       FAHLogo)
  app.component('ClientVersion', ClientVersion)
  app.mount('#app')
}


if (fah_build_mode == 'development')
  main('http://localhost:7000')
else main('https://api.foldingathome.org')
