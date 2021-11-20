import { reactive, toRef } from 'vue';
import axios from 'axios';

const data = reactive({
  api: null,
  project: { data: {}, error: false},
  team: { data: {}, error: false}
})

data.api = axios.create({
  baseURL: 'https://api.foldingathome.org'
});

const basicResponse = () =>{
  return { data: {}, error: false};
}

const getProjectData = async (projectId) => {
  data.project = basicResponse();
  try {
    let result = await data.api.get('/project/' + projectId);
    data.project.data = result.data;
  } catch(error) {
    data.project.error = true;
  }
}

const createTeam = async (object) => {
  data.team = basicResponse();
  try {
    let request = {}
    for(let key in object) if(object[key] && key != 'confirm') request[key] = object[key];

    let result = await data.api.post('/team/create', request);
    data.team.data = result.data;
  } catch(error) {
    data.team.error = true;
    data.team.data = error.response.data;
  }
};

const useProjectAPI = { response: toRef(data, 'project'), getProjectData };
const useTeamAPI = { response: toRef(data, 'team'), createTeam};

export  { useProjectAPI, useTeamAPI };

