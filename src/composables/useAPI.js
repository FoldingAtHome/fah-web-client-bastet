import { reactive, toRefs } from 'vue'
import axios from 'axios'

const data = reactive({
  api: null,
  project: { data: {}, error: false},
  team: { data: {}, error: false},
  user: { data: {}, error: false}
})

export default function useAPI() {

  data.api = axios.create({
    baseURL: 'https://api.foldingathome.org'
  })

  const basicResponse = () =>{
    return { data: {}, error: false}
  }

  const getProjectData = async (projectId) => {
    data.project = basicResponse()
    try {
      let result = await data.api.get('/project/' + projectId)
      data.project.data = result.data
    } catch(error) {
      data.project.error = true
    }
  }

  const createTeam = async (object) => {
    data.team = basicResponse()
    try {
      let request = {}
      for(let key in object) if(object[key] && key != 'confirm') request[key] = object[key]

      let result = await data.api.post('/team/create', request)
      data.team.data = result.data
    } catch(error) {
      data.team.error = true
      if(error.response) data.team.data = error.response.data
    }
  }

  const getUserContribution = async (user, teamId) => {
    data.user = basicResponse()
    try {
      let result = await data.api.get('/user/'+user+'/stats', {
        params: { team: teamId }
      })
      data.user.data = result.data
    } catch(error) {
      data.user.error = true
      if(error.response) data.user.data = error.response.data
    }
  }

  return { ...toRefs(data), getProjectData, createTeam, getUserContribution }
}
