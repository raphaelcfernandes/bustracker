import './App.css';
import React, { useState, useEffect, useRef, Children } from 'react'
import { Loader } from "@googlemaps/js-api-loader"
import {
  getRoutes,
  getVehicles,
  getPatterns,
  getPatternsAndVehicles
} from './service/portAuthority.service'


const TableHeader = ({ head }) => (
  <thead>
    <tr>
      {head.map(x => (
        <th key={x} style={{ position: 'sticky', top: 0 }}>{x}</th>
      ))}
    </tr>
  </thead>
)

const TableBody = ({ data, onClick }) => (
  <tbody>
    {data.map(x => (
      <tr key={x.rtdd} style={{ backgroundColor: x.rtclr, opacity: 0.9 }} onClick={() => onClick(x)}>
        <td>
          {x.rt}
        </td>
        <td>
          {x.rtdd}
        </td>
        <td>
          {x.rtnm}
        </td>
        <td>
          {x.rtpidatafeed}
        </td>
      </tr>
    ))}
  </tbody>
)

const Table = ({ data, head, onClick }) => (
  <table style={{ borderStyle: "dotted", borderColor: "red" }}>
    <TableHeader head={head} />
    <TableBody data={data} onClick={onClick} />
  </table>

)


const App = () => {
  const th = ["rt", "rtdd", "rtnm", "rtpidatafeed"]
  const [json, setJson] = useState([])
  const [map, setmMap] = useState({})
  const [googleMaps, setGoogleMaps] = useState({})
  const [busoes, _setBusoes] = useState({})
  const [activeBus, setActiveBus] = useState([]);
  
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
    console.log(activeBus);
    console.log("REF COMPLETE", busoesRef.current);
    activeBus.forEach(element => {
      getPatternsAndVehicles(element.rt, element.rtpidatafeed).then(res => {
        if (res == "error" || !res.vehicles.vehicle) {
          return;
        }
        const vehiclesList = res.vehicles.vehicle.map(v => {
          if (busoesRef.current[element.rt]) {
            const oldPoint = busoesRef.current[element.rt].find(bus => {
              console.log("bus", bus);
              return bus.id === v.vid;
            });
            if (oldPoint) {
              console.log(v.lat,v.lon)
              oldPoint.circle.setCenter(new googleMaps.LatLng(Number(v.lat), Number(v.lon)))
              return oldPoint
            }
          }
          // onibus
         return  ({
           id: v.vid, circle: new googleMaps.Circle({
             strokeColor: "black",
             strokeOpacity: 0.8,
             strokeWeight: 2,
             fillColor: "#FF0000",
             fillOpacity: 0.1,
             map,
             center: { "lat": Number(v.lat), "lng": Number(v.lon) },
             radius: 200
           }), rt: element.rt
         });
        })
        console.log(vehiclesList)
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
         setBusoes(vehiclesList, element.rt);
        })
     });
    })
  }

  useEffect(() => {
    if (activeBus.length > 0) {
      test()
      const interval = setInterval(() => {
        test()
        /*if (busoesRef.current.length) {
          console.log(busoesRef.current)
          busoesRef.current.forEach(bus => bus.circle.setMap(null));
        }*/
      }, 10000);
      return () => {
        clearInterval(interval)
      }
    }
  }, [activeBus]);

  useEffect(() => {
    if (Object.keys(googleMaps).length > 0) {
      // Esse é o set do react
      setmMap(
        new googleMaps.Map(mapRef.current, {
          center: { lat: 40.460860, lng: -79.934630 },
          zoom: 13,
        }))
    }
  }, [googleMaps])

  const click = (element) => {
    setActiveBus([...activeBus, element]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "500px" }}>
      <div style={{ overflowY: "auto" }}>
        <Table head={th} onClick={click} data={json} />
      </div>
      <div >
        <div style={{ width: "1480px", position: "relative", height: "100%" }} ref={mapRef} />
      </div>
    </div >
  );
}

export default App;