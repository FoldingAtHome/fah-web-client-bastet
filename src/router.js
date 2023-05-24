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

import {createRouter, createWebHistory} from 'vue-router'
import HomeView      from './HomeView.vue'
import SettingsView  from './SettingsView.vue'
import Visualization from './Visualization.vue'
import LogView       from './LogView.vue'
import MachineView   from './MachineView.vue'
import AccountView   from './AccountView.vue'


export default createRouter({
  history: createWebHistory(),
  routes: [
    {path: '/',        component: HomeView},
    {path: '/account', component: AccountView, props: true},
    {
      path: '/:machID?',
      props: true,
      component: MachineView,
      children: [
        {path: 'settings',     component: SettingsView},
        {path: 'view/:unitID', component: Visualization, props: true},
        {
          path: 'log',
          component: LogView,
          props: route => ({query: route.query.q})
        }
      ]
    }
  ]
})
