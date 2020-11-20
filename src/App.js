import './App.css';
import React, { useState, useEffect, useRef } from 'react'
import { Loader } from "@googlemaps/js-api-loader"
import {
  getRoutes,
  getPatternsAndVehicles
} from './service/portAuthority.service'
import Table from './components/table'

const App = () => {
  const th = ["Route", "Name"]
  const [json, setJson] = useState([])
  const [map, setmMap] = useState({})
  const [googleMaps, setGoogleMaps] = useState({})
  const [busoes, _setBusoes] = useState({})
  const [activeBus, setActiveBus] = useState([]);
  const click = (element) => {
    setActiveBus([...activeBus, element]);
  }
  const busoesRef = useRef(busoes);
  const setBusoes = (data, rt) => {
    _setBusoes(data);
    busoesRef.current[rt] = data;
  }
  const mapRef = useRef(null)
  const loader = new Loader({
    apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    version: "weekly",
  });
  useEffect(() => {
    getRoutes().then(res => {
      setJson(res.routes)
    }).catch(err => console.log(err));
    loader.load().then(() => {
      setGoogleMaps(window.google.maps)
    })
  }, [])

  const test = () => {
    activeBus.forEach(element => {
      getPatternsAndVehicles(element.rt, element.rtpidatafeed).then(res => {
        if (res == "error" || !res.vehicles.vehicle) {
          return;
        }
        const patternsList = res.patterns.ptr.map(pres => {
          const r = []
          pres.pt.forEach(p => {
            r.push({ "lat": p.lat, "lng": p.lon })
            if (p.stpid) {
              new googleMaps.Circle({
                strokeColor: "black",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35,
                map,
                center: { "lat": p.lat, "lng": p.lon },
                radius: 9,
              });
            }
          })
          new googleMaps.Polyline({
            path: r,
            geodesic: true,
            strokeColor: element.rtclr,
            strokeOpacity: 1.0,
            strokeWeight: 2,
          }).setMap(map) // Google maps setMap
          // setBusoes(vehiclesList, element.rt);
        })
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

  

  return (
    <div >
      <div id="sou gay" style={{ position: "absolute", zIndex: 9, height:"100%" }}>
        <Table head={th} onClick={click} data={json} />
        <button style={{position: "absolute", top:0, right:-157}}>Gosto de penis grosso</button>
      </div>
      <div style={{ width: "100vw", height: "100vh" }} ref={mapRef} />
    </div>
  );
}

export default App;