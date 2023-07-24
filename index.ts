/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-nocheck TODO remove when fixed
import fs from "fs";

function initMap(): void {
  const bounds = new google.maps.LatLngBounds();
  const markersArray: google.maps.Marker[] = [];

  const map = new google.maps.Map(
    document.getElementById("map") as HTMLElement,
    {
      center: { lat: 55.53, lng: 9.4 },
      zoom: 10,
    }
  );

  // initialize services
  const geocoder = new google.maps.Geocoder();
  const service = new google.maps.DistanceMatrixService();

  // build request
  // const origin1 = { lat: 55.53, lng: 9.3 };
  // const origin2 = "Greenwich, England";
  // const destinationA = "Stockholm, Sweden";
  // const destinationB = { lat: 50.087, lng: 14.421 };

  // location button
  const locationButton = document.createElement("button");

  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");

  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);

  // get current location
  locationButton.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const origin1 = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // build request
          const destinations = ["Bing Mi Food Cart", "Ken's Artisan Pizza"];
          //   "Gracie's",
          //   "PIzzicato",
          //   "Bob's Red Mill",
          //   "Bing Mi Food Cart",
          //   "Pine State Biscuits",
          //   "Murata",
          // "Kabba's Kitchen",
          // "Kee's Loaded Kitchen",
          // "Matta, burgers",
          // "Oma's Hideaway",
          // "Khao Moo Dang",
          // "Rose VL Deli, soup",
          // "Jin Jin Deli",
          // "guero",
          // "Gumba",
          // "Laughing planet",
          // "Eem",
          // "Ken's artisan",
          // "Matt's bbq",
          // "Phuket cafe",
          // "Lang baan",
          // "Magna kusina",
          // "Bar west",
          // "Yang kee bbq noodle house",
          // "The palengke",
          //];

          const request = {
            origins: [origin1],
            destinations: destinations,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false,
          };

          // put request on page
          (document.getElementById("request") as HTMLDivElement).innerText =
            JSON.stringify(request, null, 2);

          // get distance matrix response
          service.getDistanceMatrix(request).then((response) => {
            console.log("Full Response:", response);
            const originList = response.originAddresses;
            const destinationList = response.destinationAddresses;

            const durations = response.rows[0].elements.map((element) => {
              return element.duration.value; // Use value (duration in seconds) for sorting
            });

            // Combine destination names and durations into an array of objects
            const destinationsWithDurations = destinationList.map(
              (destination, index) => {
                return {
                  destination,
                  duration: durations[index],
                };
              }
            );

            // Sort the destinations by duration in ascending order
            destinationsWithDurations.sort((a, b) => a.duration - b.duration);

            const responseElement = document.getElementById("response");
            responseElement.innerHTML = ""; // Clear any previous content

            // Iterate through the sorted destinations and display them on the screen
            destinationsWithDurations.forEach((item) => {
              const destinationName = item.destination;
              const duration = item.duration;
              const formattedDuration = formatDuration(duration);

              // Create a new paragraph element to hold the duration and destination
              const paragraphElement = document.createElement("p");
              paragraphElement.innerText = `${formattedDuration} to ${destinationName}`;

              // Append the paragraph element to the response element
              responseElement.appendChild(paragraphElement);
            });

            function formatDuration(durationInSeconds) {
              const hours = Math.floor(durationInSeconds / 3600);
              const minutes = Math.floor((durationInSeconds % 3600) / 60);
              return hours > 0
                ? `${hours} hours ${minutes} mins`
                : `${minutes} mins`;
            }

            deleteMarkers(markersArray);

            const showGeocodedAddressOnMap = (asDestination: boolean) => {
              const handler = ({ results }: google.maps.GeocoderResponse) => {
                map.fitBounds(bounds.extend(results[0].geometry.location));
                markersArray.push(
                  new google.maps.Marker({
                    map,
                    position: results[0].geometry.location,
                    label: asDestination ? "D" : "O",
                  })
                );
              };

              return handler;
            };

            for (let i = 0; i < originList.length; i++) {
              const results = response.rows[i].elements;

              geocoder
                .geocode({ address: originList[i] })
                .then(showGeocodedAddressOnMap(false));

              for (let j = 0; j < results.length; j++) {
                geocoder
                  .geocode({ address: destinationList[j] })
                  .then(showGeocodedAddressOnMap(true));
              }
            }
          });

          function deleteMarkers(markersArray: google.maps.Marker[]) {
            for (let i = 0; i < markersArray.length; i++) {
              markersArray[i].setMap(null);
            }

            markersArray = [];
          }

          // infoWindow.setPosition(pos);
          // infoWindow.setContent("Location found.");
          // infoWindow.open(map);
          map.setCenter(origin1);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter()!);
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter()!);
    }
  });
}

// const request = {
//   origins: [origin1, origin2],
//   destinations: [destinationA, destinationB],
//   travelMode: google.maps.TravelMode.DRIVING,
//   unitSystem: google.maps.UnitSystem.METRIC,
//   avoidHighways: false,
//   avoidTolls: false,
// };

function handleLocationError(
  browserHasGeolocation: boolean,
  infoWindow: google.maps.InfoWindow,
  pos: google.maps.LatLng
) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;
export {};
