<!--

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

-->

<script>
import CommonSettings from './CommonSettings.vue'


export default {
  props: ['name', 'config', 'cpus', 'gpus', 'advanced'],
}
</script>

<template lang="pug">
fieldset.settings.view-panel
  legend
    HelpBalloon(name="Scheduling"): p.
      These settings control when Folding@home runs.

  .setting
    HelpBalloon(name="Only When Idle"): p.
      Enable folding only when your machine is idle.  I.e. when the mouse
      and keyboard are not being used.

    input(v-model="config.on_idle", type="checkbox",
      title="Only fold when computer is idle.")

fieldset.settings.view-panel
  legend
    HelpBalloon(name="Resource Usage"): p.
      These settings control the usage of your machines compute resources.

  .setting
    HelpBalloon(name="CPUs")
      p Choose how many CPU cores Folding@home should try to utilize.
      p.
        Reduce the number of CPUs allocate to folding if your system runs
        too slow while Folding@home is running.  Set to the maximum to earn
        the most points.  However, you may also consider reserving a few
        CPUs if you are also doing GPU folding.  GPU folding may also need
        some CPU power.

    .cpus-input
      input(v-model.number="config.cpus", :min="0", type="range",
        :max="cpus", v-if="0 < cpus")
      span {{config.cpus}} of {{cpus}}

  .setting
    HelpBalloon(name="GPUs")
      p Choose which of your GPUs to run Folding@home on.
      p.
        Some GPUs are not supported by Folding@home either because they are
        too old, too new, the necessary driver software is missing from you
        computer or the GPU has know bugs that prevent folding from working
        correctly.  If your GPU is not supported you will not be able to
        enable it.

      p Either CUDA, OpenCL or both is required for folding.


    table.gpus-input.view-table
      tr
        th ID
        th Description
        th Enabled

      tr.gpu-row(v-for="gpu in gpus",
        :class="{unsupported: !gpu.supported}",
        :title="!gpu.supported ? 'Unsupported GPU.' : ''")
        td.gpu-id {{gpu.id.substr(4)}}
        td.gpu-description {{gpu.description}}

        td.gpu-enabled
          input(type="checkbox", v-model="config.gpus[gpu.id].enabled",
            :title="''")

fieldset.settings.view-panel(v-if="advanced")
  legend
    HelpBalloon(name="Advanced"): p.
      These settings are for testing Folding@home.

  .setting
    HelpBalloon(name="Beta Projects"): p.
      Enable folding of beta projects.  Beta projects are in testing and may
      fail and cause you to loose points.

    input(v-model="config.beta", type="checkbox",
      title="Enable beta projects.")

  .setting
    HelpBalloon(name="Project Key"): p.
      Project keys are used for internal testing of folding projects.
      Unless you are specically instructed by a Folding@home researcher to
      use a project key, leave this field set to zero.

    input(v-model="config.key", type="number", title="Project key.")
</template>

<style lang="stylus">
</style>
