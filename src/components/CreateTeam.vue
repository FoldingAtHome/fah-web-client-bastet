<template lang="pug">
#createTeam.modal.fade(tabindex="-1" data-bs-backdrop="static" aria-labelledby="createTeam" aria-hidden="true")
  .modal-dialog
    .modal-content
      .modal-header
        h5#createTeamLabel.modal-title Create Team
        button.btn-close(type="button" data-bs-dismiss="modal" aria-label="Close")
      .modal-body
        .alert.alert-danger(v-if="response && response.error" role="alert")
          span Sorry, there was some error creating the team.
          span(v-if="!isEmpty(response.data) && response.data.error") {{ response.data.error }}
        div(v-if="!response.error && !isEmpty(response.data)")
          .alert.alert-success
            span Successfully created team with id {{ response.data }}
          .modal-footer
            button.btn.btn-warning(type="button" @click="response.data = {}") Create New Team
        Form(v-else @submit="create" :validation-schema="schema" v-slot="{ errors, isSubmitting }")
          .row.mb-3
            label.col-sm-3.col-md-3.col-form-label(for="name") Name* :
            .col-sm-9
              Field#team-name.form-control(name="name" type="text")
              ErrorMessage.error(name="name")
          .row.mb-3
            label.col-sm-3.col-md-3.col-form-label(for="founder") Founder* :
            .col-sm-9
              Field#founder.form-control(name="founder" type="text")
              ErrorMessage.error(name="founder")
          .row.mb-3
            label.col-sm-3.col-md-3.col-form-label(for="email") Email* :
            .col-sm-9
              Field#email.form-control(name="email" type="email")
              ErrorMessage.error(name="email")
          .row.mb-3
            label.col-sm-3.col-md-3.col-form-label(for="url") URL :
            .col-sm-9
              Field#url.form-control(name="url" type="url")
              ErrorMessage.error(name="url")
          .row.mb-3
            label.col-sm-3.col-md-3.col-form-label(for="logo") Logo URL :
            .col-sm-8
              Field#logoURL.form-control(name="logo" type="url")
              ErrorMessage.error(name="logo")
            .col-sm-1
              img.logo(v-if="logoURL" :src="logo" height=32 width=32)
          .row.mb-3
            label.col-sm-3.col-md-3.col-form-label(for="password") Password* :
            .col-sm-9
              Field#password.form-control(name="password" type="password")
              ErrorMessage.error(name="password")
          .row.mb-3
            label.col-sm-3.col-md-3.col-form-label(for="confirm") Password* :
            .col-sm-9
              Field#confirm.form-control(name="confirm" type="password")
              ErrorMessage.error(name="confirm")
          .modal-footer
            button.btn.btn-secondary(type="button" data-bs-dismiss="modal") Close
            button.btn.btn-primary(type="submit" :disabled="isSubmitting") Create
</template>

<script>
import { useForm, useField, Form, ErrorMessage, Field } from 'vee-validate';
import * as yup from 'yup';
import { useTeamAPI } from '../composables/useAPI';
import { reactive, toRefs } from 'vue';

export default {
  name: 'CreateTeam',
  components: { Field, Form, ErrorMessage },
  setup() {
    const schema = yup.object().shape({
      name: yup.string().required().label("Team name"),
      founder: yup.string().required().label("Founder name"),
      email: yup.string().required().email().label("Team email id"),
      url: yup.string().url().label("Team URL"),
      logo: yup.string().url().label("Logo URL"),
      password: yup.string().min(6).required().label("Password"),
      confirm: yup.string().required("Re-enter the password.").oneOf([yup.ref("password")], "Passwords do not match.")
    });

    const { resetForm, isSubmitting } = useForm();
    const { value: logoURL } = useField('logo')
    const { response, createTeam } = useTeamAPI;

    const isEmpty = (obj) => {
      return Object.entries(obj).length === 0 && obj.constructor === Object
    }

    const create = async (values) => {
      await createTeam(values);
      resetForm();
    }

    return { logoURL, schema, isSubmitting, response, create, isEmpty };
  }
}
</script>

<style lang="stylus" scoped>
.col-form-label
  text-align: left

  @media (min-width: 768px)
    text-align: right

.error
  color: red
  font-size: small
</style>
