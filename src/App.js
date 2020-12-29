import './App.css';
import React, { useState, useEffect, useRef } from 'react'
import _ from 'lodash'
import { Loader } from "@googlemaps/js-api-loader"
import {
  getRoutes,
  getPatternsAndVehicles,
  getPatterns
} from './service/portAuthority.service'
import Table from './components/table'

const loader = new Loader({
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  version: "weekly",
});

const App = () => {
  const th = ["Route", "Name"]
  const [availableRoutes, setAvailableRoutes] = useState([])
  const [map, setmMap] = useState({})
  const [routesSelected, setRoutesSelected] = useState({});
  const [googleMaps, setGoogleMaps] = useState({})
  const [busoes, _setBusoes] = useState({})
  const [activeBus, setActiveBus] = useState([]);
  const busoesRef = useRef(busoes);
  const mapRef = useRef(null)

  /**
   * Get all BUSES line available from Port Authority
   */
  useEffect(() => {
    getRoutes().then(res => {
      setAvailableRoutes(res.routes)
    }).catch(err => console.error(err));
  }, [])

  /**
   * Load google maps JS-API 
   */
  useEffect(() => {
    loader.load().then(() => {
      setGoogleMaps(window.google.maps)
    })
  }, [])

  /**
   * Render google maps on screen after google js-api is loaded
   */
  useEffect(() => {
    if (Object.keys(googleMaps).length > 0) {
      setmMap(
        new googleMaps.Map(mapRef.current, {
          center: { lat: 40.460860, lng: -79.934630 },
          zoom: 13,
          mapTypeControl: false,

        }))
    }
  }, [googleMaps])

  const setBusPathAndStops = (busPattern) => {
    const paths = []
    const stops = []
    busPattern.forEach(pattern => {
      pattern.pt.forEach(p => {
        // If it's a bus stop
        if (p.stpid) {
          stops.push(new googleMaps.Circle({
            strokeColor: "black", strokeOpacity: 0.8, strokeWeight: 2,
            fillColor: "#FF0000", fillOpacity: 0.35, map, center: { "lat": p.lat, "lng": p.lon }, radius: 9,
          }))
        } else
          paths.push({ "lat": p.lat, "lng": p.lon })
      })
    })
    return { paths, stops }
  }

  const click = async (e, element) => {
    // setActiveBus([...activeBus, element]);
    if (e.target.checked) {
      const busPattern = await getPatternsAndVehicles(element.rt, element.rtpidatafeed);
      const buses = []
      // Set bus line and bus stops
      const busPathsAndStops = setBusPathAndStops(busPattern.patterns.ptr)
      const stops = busPathsAndStops.stops
      const pathLine = _.cloneDeep(new googleMaps.Polyline({
        path: busPathsAndStops.paths, geodesic: true,
        strokeColor: element.rtclr, strokeOpacity: 1.0, strokeWeight: 2
      }))
      pathLine.setMap(map)
      if (busPattern.vehicles.error) alert("No running bus found.");
      else {
        console.log("oi")
      }
      setRoutesSelected({
        ...routesSelected, [element.rt]: {
          pathLines: pathLine,
          buses: [],
          stops: stops,
          info: element
        }
      })
    } else {
      // @TODO
      // THIS MUST BE REMOVED, THIS IS FOR TEST/DEV PURPOSES
      if (routesSelected[element.rt] !== undefined) {
        routesSelected[element.rt].stops.forEach(stop => stop.setMap(null))
        routesSelected[element.rt].pathLines.setMap(null)
        setRoutesSelected(_.omit(routesSelected, element.rt));
      }
    }
  }

  const setBusoes = (data, rt) => {
    _setBusoes(data);
    busoesRef.current[rt] = data;
  }

  useEffect(() => {
    // console.log(routesSelected)
  }, [routesSelected])

  const test = () => {
    activeBus.forEach(element => {
      getPatternsAndVehicles(element.rt, element.rtpidatafeed).then(res => {
        if (res == "error" || !res.vehicles.vehicle) {
          return;
        }

      });
      // const vehiclesList = res.vehicles.vehicle.map(v => {
      //   if (busoesRef.current[element.rt]) {
      //     const oldPoint = busoesRef.current[element.rt].find(bus => {
      //       return bus.id === v.vid;
      //     });
      //     if (oldPoint) {
      //       oldPoint.circle.setCenter(new googleMaps.LatLng(Number(v.lat), Number(v.lon)))
      //       return oldPoint
      //     }
      //   }
      //   // onibus
      //   return ({
      //     id: v.vid, circle: new googleMaps.Circle({
      //       strokeColor: "black",
      //       strokeOpacity: 0.8,
      //       strokeWeight: 2,
      //       fillColor: "#FF0000",
      //       fillOpacity: 0.1,
      //       map,
      //       center: { "lat": Number(v.lat), "lng": Number(v.lon) },
      //       radius: 200
      //     }), rt: element.rt
      //   });
      // })

    })
  }

  useEffect(() => {
    if (activeBus.length > 0) {
      test()
      const interval = setInterval(() => {
        test()
      }, 3000);
      return () => {
        clearInterval(interval)
      }
    }
  }, [activeBus]);

  return (
    <div >
      <div id="sou gay" style={{ position: "absolute", zIndex: 9, height: "100%" }}>
        <Table head={th} onClick={click} data={availableRoutes} />
        <button style={{ position: "absolute", top: 0, right: -157 }}>Test button</button>
      </div>
      <div style={{ width: "100vw", height: "100vh" }} ref={mapRef} />
    </div>
  );
}

export default App;