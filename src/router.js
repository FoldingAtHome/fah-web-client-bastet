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

import {createRouter, createWebHistory} from 'vue-router'
import StatsView          from './StatsView.vue'
import MachinesView       from './MachinesView.vue'
import NewsView           from './NewsView.vue'
import ProjectsView       from './ProjectsView.vue'
import WUsView            from './WUsView.vue'
import SettingsView       from './SettingsView.vue'
import Visualization      from './Visualization.vue'
import LogView            from './LogView.vue'
import MachineMux         from './MachineMux.vue'
import MachineDetailsView from './MachineDetailsView.vue'
import UnitDetailsView    from './UnitDetailsView.vue'
import AccountView        from './AccountView.vue'
import VerifyView         from './VerifyView.vue'
import ResetView          from './ResetView.vue'
import AccountSettings    from './AccountSettings.vue'
import AccountAppearance  from './AccountAppearance.vue'
import AccountTeams       from './AccountTeams.vue'


export default createRouter({
  history: createWebHistory(),
  routes: [
    {path: '/',                    redirect: '/machines'},
    {path: '/stats',               component: StatsView},
    {path: '/machines',            component: MachinesView},
    {path: '/projects',            component: ProjectsView},
    {path: '/wus',                 component: WUsView},
    {path: '/news',                component: NewsView},
    {path: '/unit/:unitID',        component: UnitDetailsView, props: true},
    {path: '/verify/:token',       component: VerifyView,  props: true},
    {
      path: '/account/:tab?',
      component: AccountView,
      props: route => route.params,
      children: [
        {path: 'settings',         component: AccountSettings},
        {path: 'appearance',       component: AccountAppearance},
        {path: 'teams',            component: AccountTeams},
        {path: ':pathMatch(.*)',   redirect: '/account/settings'},
      ]
    }, {
      path: '/reset/:token',
      component: ResetView,
      props: route => Object.assign({email: route.query.email}, route.params)
    }, {
      path: '/:machID?',
      props: true,
      component: MachineMux,
      children: [
        {path: '',                 redirect: '/'},
        {path: 'settings',         component: SettingsView},
        {path: 'details',          component: MachineDetailsView},
        {path: 'view/:unitID',     component: Visualization,   props: true},
        {
          path: 'log',
          component: LogView,
          props: route => ({query: route.query.q})
        },
        {path: ':pathMatch(.*)*', redirect: '/'},
      ]
    },
  ]
})
