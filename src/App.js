import './App.css';
import React, { useState, useEffect } from 'react'
import { Loader } from "@googlemaps/js-api-loader"
import {
  getRoutes,
  getVehicles,
  getPatterns
} from './service/portAuthority.service'

const App = () => {
  const th = ["rt", "rtdd", "rtnm", "rtpidatafeed"]
  const [json, setJson] = useState([])
  const [map, setMap] = useState({})
  const [googleMaps, setGoogleMaps] = useState({})
  const [busoes, setBusoes] = useState([])
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
  useEffect(() => {
    if (busoes.length > 0) {
      const interval = setInterval(() => {
        console.log("oi")
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [busoes]);

  useEffect(() => {
    if (Object.keys(googleMaps).length > 0) {
      setMap(
        new googleMaps.Map(document.getElementById("maps"), {
          center: { lat: 40.460860, lng: -79.934630 },
          zoom: 13,
        }))
    }
  }, [googleMaps])

  const click = (element) => {
    getVehicles(element.rt).then(res => {
      if (res.error) {
        alert("Busao nao ta rodando")
      }
      else {
        res.vehicle.forEach(v => {
          const d = {
            id: v.pid, circle: new googleMaps.Circle({
              strokeColor: "black",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#FF0000",
              fillOpacity: 0.1,
              map,
              center: { "lat": Number(v.lat), "lng": Number(v.lon) },
              radius: 200,
            })
          };
          setBusoes(busoes => [...busoes, d])
        })
      }
    });
    getPatterns(element.rt, element.rtpidatafeed)
      .then(res => {
        const arr = res
        const r = []
        Object.keys(arr.ptr).forEach(k => {
          arr.ptr[k].pt.forEach(p => {
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
        })

        new googleMaps.Polyline({
          path: r,
          geodesic: true,
          strokeColor: element.rtclr,
          strokeOpacity: 1.0,
          strokeWeight: 2,
        }).setMap(map)
      })
  }

  return (
    <div style={{ display: "flex", flexDirection: "row"}}>
      <div style={{ overflowY: "auto" }}>
        <table style={{ borderStyle: "dotted", borderColor: "red"}}>
          <tbody>
            <tr>
              {th.map(x => (
                <th key={x} style={{position: 'sticky', top: 0}}>{x}</th>
              ))}
            </tr>
            {json.map(x => (
              <tr key={x.rtdd} style={{ backgroundColor: x.rtclr, opacity: 0.9 }} onClick={() => click(x)}>
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
        </table>
      </div>
      <div >
        <div style={{ width: "1480px", position:"relative", height: "500px" }} id="maps" />
      </div>
    </div >
  );
}

export default App;