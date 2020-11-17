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

const getPatternsAndVehicles = async (rt, rtpidatafeed) => {
    try {
        const patterns = await getPatterns(rt, rtpidatafeed);
        const vehicles = await getVehicles(rt)
        return { patterns, vehicles }
    } catch {
        return;
    }
}

export {
    getRoutes,
    getVehicles,
    getPatterns,
    getPatternsAndVehicles
}