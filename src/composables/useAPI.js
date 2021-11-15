import { reactive, toRefs } from 'vue';
import axios from 'axios';

const data = reactive({
  api: null,
  response: { data: null, error: false }
})

data.api = axios.create({
  baseURL: 'https://api.foldingathome.org'
});

const getProjectData = async (projectId) => {
  data.response = { data: null, error: false};

  try {
    let result = await data.api.get('/project/' + projectId);
    data.response.data = result.data;
  } catch(error) {
    data.response.error = true;
  }
}

const useAPI = { ...toRefs(data), getProjectData };

export default useAPI;

