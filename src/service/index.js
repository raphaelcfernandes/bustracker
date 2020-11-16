import axios from 'axios'

const httpClient = axios.create({
    baseURL: "http://truetime.portauthority.org/bustime/api/v3/",
    params: {
        key: process.env.REACT_APP_PORT_AUTHORITY_KEY,
        format: "json"
    }
})

httpClient.interceptors.response.use(function (response) {
    return response.data["bustime-response"];
}, function (error) {
    new Promise.reject(error)
})

export default httpClient