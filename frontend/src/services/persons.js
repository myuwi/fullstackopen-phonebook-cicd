import axios from "axios";

const baseUrl = "/api/persons";

async function getAllPersons() {
  return axios.get(baseUrl).then((res) => res.data);
}

async function createPerson(person) {
  return axios.post(baseUrl, person).then((res) => res.data);
}

async function updatePerson(id, person) {
  return axios.put(`${baseUrl}/${id}`, person).then((res) => res.data);
}

async function deletePerson(id) {
  return axios.delete(`${baseUrl}/${id}`).then((res) => res.data);
}

export default {
  getAll: getAllPersons,
  create: createPerson,
  update: updatePerson,
  delete: deletePerson,
};
