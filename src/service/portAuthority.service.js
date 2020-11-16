import httpClient from './'

const getRoutes = () => {
    return httpClient.get("getroutes")
}
const getVehicles = (rt) => {
    return httpClient.get("getvehicles", {
        params: {
            rt: rt
        }
    })
}
const getPatterns = (rt, rtpidatafeed) => {
    return httpClient.get("getpatterns", {
        params: {
            rt: rt,
            rtpidatafeed: rtpidatafeed
        }
    })
}

export {
    getRoutes,
    getVehicles,
    getPatterns
}