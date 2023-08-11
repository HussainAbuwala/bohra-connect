import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "./Map.css";
import Chart from "chart.js/auto";
import countries from "../data/countries.json";
import { feature } from "@rapideditor/country-coder";
import { useLocation } from "react-router-dom";
import WordCloud from "wordcloud";
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

export default function Map() {
   const location = useLocation();
   const mapContainer = useRef(null);
   const map = useRef(null);
   const [showScrollButton, setScrollButton] = useState(true);
   const [bohraData, setBohraData] = useState([]);

   console.log("PASSED LOCATION", location.state);
   console.log(bohraData);
   console.log(countries[0]);

   const handleScroll = () => {
      if (window.scrollY < 300) {
        setScrollButton(true);
      } else {
        setScrollButton(false);
      }
   };

   useEffect(() => {
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);

   useEffect(() => {
      async function getRecords() {
         const response = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/bohras`
         );

         if (!response.ok) {
            const message = `An error occured: ${response.statusText}`;
            window.alert(message);
            return;
         }
         const records = await response.json();
         setBohraData(records);
      }

      getRecords();
   }, []);

   useEffect(() => {
      if (!map.current) {
         map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/light-v11",
            center: [78.667743, 22.351115],
            zoom: 0,
         });
      } // initialize map only once

      if (location.state) {
         setTimeout(() => {
            map.current.flyTo({
               center: location.state.lngLat, // New center coordinates
               zoom: 3, // New zoom level
               essential: true, // If true, the transition will interrupt user input
            });
            addMarkers();
         }, 2000);
      } else {
         addMarkers();
      }

      console.log("hello");
      console.log(bohraData);

      const barChart = createBarChart();
      const donutChart = createDonutChart();
      return () => {
         barChart.destroy();
         donutChart.destroy();
      };
   }, [bohraData]);

   function addMarkers() {
      bohraData.forEach((item) => {
         var coordinatesArray = item.lngLat.split(",");
         var longitude = parseFloat(coordinatesArray[0]);
         var latitude = parseFloat(coordinatesArray[1]);
         console.log(longitude, latitude);
         var marker = new mapboxgl.Marker()
            .setLngLat([longitude, latitude])
            .addTo(map.current);

         var imgSrc =
            "downloadUrl" in item
               ? item.downloadUrl
               : "https://img.icons8.com/?size=512&id=LmQmm5fCJsqQ&format=png";
         var popup = new mapboxgl.Popup().setHTML(
            `<div class="popup-content">
               <img class="user-image" src="${imgSrc}" alt="User Image">

               <h4>${item.fullName}</h4>
               <li><em><strong>Profession</strong></em>: ${item.profession}></li>
               <li><em><strong>Connect</strong></em>: <a href='${item.url}'>${item.url}</a>
            </div>`
         );
         marker.setPopup(popup);
         if (location.state && location.state.ejamaat === item.ejamaat) {
            marker.togglePopup();
         }

         marker.getElement().addEventListener("click", () => {
            popup.addTo(map.current);
         });
      });
   }

   function createBarChart() {
      // Count the frequency of each profession

      var professionCounts = {};
      bohraData.forEach((item) => {
         if (!professionCounts[item.profession]) {
            professionCounts[item.profession] = 1;
         } else {
            professionCounts[item.profession]++;
         }
      });
      console.log(bohraData);
      console.log(professionCounts);
      // Extract professions and their corresponding frequencies
      var professions = Object.keys(professionCounts);
      var frequencies = Object.values(professionCounts);

      var ctx = document.getElementById("barChart").getContext("2d");
      let myChart = new Chart(ctx, {
         type: "bar",
         data: {
            labels: professions,
            datasets: [
               {
                  label: "",
                  data: frequencies,
                  backgroundColor: frequencies.map(() => generateRandomColor()),
                  borderWidth: 1,
               },
            ],
         },
         options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
               title: {
                  display: true,
                  text: "Bohra's by Industry",
                  font: {
                     size: 24, // Increase font size for the title
                  },
               },
            },
         },
      });
      return myChart;
   }

   function createDonutChart() {
      const cArray = [];

      bohraData.forEach((bData) => {
         var coordinatesArray = bData.lngLat.split(",");
         var longitude = parseFloat(coordinatesArray[0]);
         var latitude = parseFloat(coordinatesArray[1]);

         if (feature([longitude, latitude])) {
            cArray.push(feature([longitude, latitude])["properties"]["nameEn"]);
         }
      });

      var countryCounts = {};
      cArray.forEach((c) => {
         if (!countryCounts[c]) {
            countryCounts[c] = 1;
         } else {
            countryCounts[c]++;
         }
      });

      var countryNames = Object.keys(countryCounts);
      var frequencies = Object.values(countryCounts);

      const ctx = document.getElementById("donutChart").getContext("2d");

      const donutChart = new Chart(ctx, {
         type: "doughnut",
         data: {
            labels: countryNames,
            datasets: [
               {
                  data: frequencies,
                  backgroundColor: frequencies.map(() => generateRandomColor()),
               },
            ],
         },
         options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
               title: {
                  display: true,
                  text: "Bohras By Location",
                  font: {
                     size: 24, // Increase font size for the title
                  },
               },
            },
         },
      });

      return donutChart;
   }

   function createWordCloud() {
      WordCloud(document.getElementById("wordCloud"), {
         list: [
            ["foo", 12],
            ["bar", 6],
         ],
         backgroundColor: "#F7DC6F",
         minSize: 10,
      });
   }

   function generateRandomColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
         color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
   }

   const scrollTo = (targetElement) => {
      targetElement.scrollIntoView({
         behavior: 'smooth' // Scroll with smooth animation
      });
    };

   return (
      <div className="all-container">
         <div ref={mapContainer} className="map-container" id="map-container"></div>
         <div className="canvas-container">
            <canvas id="barChart"></canvas>
            <canvas id="donutChart"></canvas>
            <canvas id="wordCloud"></canvas>
         </div>
            <div className="scroll-down-button">
               {showScrollButton ? <button className="btn btn-outline-dark btn-sm" onClick={() => scrollTo(document.getElementById('barChart'))}>Scroll Down</button>: 
            <button className="btn btn-outline-dark btn-sm" onClick={() => scrollTo(document.getElementById('map-container'))}>Scroll Up</button>
            }

               
            </div>
      </div>
   );
}
