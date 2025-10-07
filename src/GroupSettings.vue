<!--

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

-->

<script>
export default {
  props: ['config', 'cpus', 'gpus', 'advanced', 'version'],


  computed: {
    all_gpus() {
      let gpus = [...this.gpus]
      let ids  = {}
      for (const gpu of gpus) ids[gpu.id] = true

      // Add undetected GPUs
      for (const [id, gpu] of Object.entries(this.config.gpus))
        if (!ids[id])
          gpus.push({id, supported: true, description: 'Undetected'})

      return gpus
    }
  },


  methods: {
    project_key_changed() {if (!this.config.key) this.config.key = 0}
  }
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
      and keyboard are not being used.  Note that folding will not start
      when idle if your machine goes to sleep first.

    input(v-model="config.on_idle", type="checkbox",
      title="Only fold when machine is idle")

  template(v-if="$util.version_less('8.3.1', version)")
    .setting
      HelpBalloon(name="While On Battery"): p.
        If this option is disabled, folding will pause when your machine is
        running on battery power.

      input(v-model="config.on_battery", type="checkbox",
        title="Allow folding when machine is on battery")

    .setting
      HelpBalloon(name="Keep Awake"): p.
        When enabled, this option prevents your machine from going to sleep
        while folding is active and your machine is not on battery power.

      input(v-model="config.keep_awake", type="checkbox",
        title="Prevent system sleep when folding and not on battery")

fieldset.settings.view-panel
  legend
    HelpBalloon(name="Resource Usage"): p.
      These settings control the usage of your machine's compute resources.

  .setting
    HelpBalloon(name="CPUs")
      p Choose how many CPU cores Folding@home should try to utilize.
      p.
        Reduce the number of CPUs allocated to folding if your system runs
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
        too old, too new, the necessary driver software is missing from your
        computer or the GPU has known bugs that prevent folding from working
        correctly.  If your GPU is not supported you will not be able to
        enable it.

      p Either CUDA, HIP, or OpenCL is required for folding.


    table.gpus-input.view-table
      thead
        tr
          th Description
          th Enabled

      tbody
        tr.gpu-row(v-for="gpu in all_gpus",
          :class="{unsupported: !gpu.supported}",
          :title="gpu.supported ? `${gpu.id} ${gpu.description}` : \
            'Unsupported GPU'")
          td.gpu-description {{gpu.description}}

          td.gpu-enabled
            input(v-if="gpu.supported", type="checkbox",
              v-model="config.gpus[gpu.id].enabled")
            span(v-else) Unsupported

fieldset.settings.view-panel(v-if="advanced")
  legend
    HelpBalloon(name="Advanced"): p.
      These settings are for testing Folding@home.

  .setting
    HelpBalloon(name="Beta Projects"): p.
      Enable folding of beta projects.  Beta projects are in testing and may
      fail and cause you to lose points.

    input(v-model="config.beta", type="checkbox",
      title="Enable beta projects")

  .setting
    HelpBalloon(name="Project Key"): p.
      Project keys are used for internal testing of folding projects.
      Unless you are specially instructed by a Folding@home researcher to
      use a project key, leave this field set to zero.

    input(v-model="config.key", type="number", title="Project key",
      pattern="\\d+", @change="project_key_changed")

  .setting
    HelpBalloon(name="Enable CUDA"): p.
      Enable CUDA support.  Normally this should be left enabled.  Disabling
      CUDA is used for testing purposes.

    input(v-model="config.cuda", type="checkbox", title="Enable CUDA")

  .setting
    HelpBalloon(name="Enable HIP"): p.
      Enable HIP support.  Normally this should be left enabled.  Disabling
      HIP is used for testing purposes.

    input(v-model="config.hip", type="checkbox", title="Enable HIP")
</template>

<style lang="stylus">
.settings-view
  fieldset
   .cpus-input
      display flex
      gap var(--gap)

      > :first-child
        flex 1

      > span
        white-space nowrap

    .gpus-input
      .gpu-row
        &.unsupported td
          opacity 0.4

        .gpu-enabled, .cuda-enabled, .hip-enabled
          text-align center

      .gpu-description
        max-width 10em
        width 100%
        white-space nowrap
        overflow hidden
        text-overflow ellipsis

    .setting > :first-child
      width 9em
</style>
