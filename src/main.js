/******************************************************************************\

                  This file is part of the Folding@home Client.

          The fah-client runs Folding@home protein folding simulations.
                    Copyright (c) 2001-2026, foldingathome.org
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

import {createApp, ref} from 'vue'
import App            from './App.vue'
import router         from './router'
import Button         from './Button.vue'
import Dialog         from './Dialog.vue'
import ProgressBar    from './ProgressBar.vue'
import DragList       from './DragList.vue'
import InfoItem       from './InfoItem.vue'
import Award          from './Award.vue'
import HelpBalloon    from './HelpBalloon.vue'
import ImageInput     from './ImageInput.vue'
import PlotView       from './PlotView.vue'
import FAHLogo        from './FAHLogo.vue'
import ClientVersion  from './ClientVersion.vue'
import ViewHeader     from './ViewHeader.vue'
import MainHeader     from './MainHeader.vue'
import ProjectView    from './ProjectView.vue'
import UnitHeader     from './UnitHeader.vue'
import UnitHeaders    from './UnitHeaders.vue'
import UnitsView      from './UnitsView.vue'
import UnitField      from './UnitField.vue'
import UnitInfo       from './UnitInfo.vue'
import Cache          from './cache.js'
import API            from './api.js'
import APISock        from './api-sock.js'
import Account        from './account.js'
import Util           from './util.js'
import Crypto         from './crypto.js'
import Node           from './node.js'
import Machines       from './machines.js'
import Stats          from './stats.js'
import Projects       from './projects.js'
import News           from './news.js'
import DirectMachConn from './direct-mach-conn.js'


function add_components(app, components) {
  for (let [name, component] of Object.entries(components))
    app.component(name, component)
}


async function main(url) {
  const app     = createApp(App);
  const ctx     = app.config.globalProperties
  ctx.$ctx      = ctx
  ctx.$util     = new Util
  ctx.$crypto   = new Crypto(ctx)
  ctx.$cache    = new Cache('fah')
  ctx.$api      = new API(ctx, url)
  ctx.$apiSock  = new APISock(ctx, 'https://ws.foldingathome.org/')
  ctx.$account  = new Account(ctx)
  ctx.$adata    = await ctx.$account.try_login()
  ctx.$machs    = new Machines(ctx)
  ctx.$node     = new Node(ctx)
  ctx.$projects = new Projects(ctx)
  ctx.$stats    = new Stats(ctx)
  ctx.$news     = new News(ctx)

  // Used to force computed values to refresh
  ctx.$refresh = ref(0)
  setInterval(() => ctx.$refresh.value++, 1000)

  let addr = ctx.$util.get_direct_address()
  ctx.$direct   = new DirectMachConn(ctx, 'local', addr)

  console.debug({account: Object.assign({}, ctx.$adata)})

  app.use(router)
  add_components(app, {
    Button, Dialog, ProgressBar, Award, HelpBalloon, FAHLogo, ClientVersion,
    ViewHeader, MainHeader, ProjectView, InfoItem, DragList, UnitHeader,
    UnitsView, ImageInput, PlotView, UnitField, UnitHeaders, UnitInfo
  })

  app.mount('#app')
}


console.debug('Web Control Version', import.meta.env.PACKAGE_VERSION)
main(import.meta.env.VITE_API_URL || 'https://api.foldingathome.org')
