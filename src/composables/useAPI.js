import { reactive } from 'vue';
import axios from 'axios';

const data = reactive({
  api: null
})

data.api = axios.create({
  baseURL: 'https://api.foldingathome.org'
});

const getProjectData = async (projectId) => {
  try {
    const projectData = await data.api.get('/project/' + projectId);
    console.log(projectData);
    return projectData;
  } catch(error) {
    console.log("Error: " + error);
  }
}

const useAPI = { getProjectData };

export default useAPI;

