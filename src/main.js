window.weatherUnit = "C";

document.querySelector(".units-btn").addEventListener("click", () => {
  window.weatherUnit = window.weatherUnit === "C" ? "F" : "C";
  window.dispatchEvent(new CustomEvent("unit-change"));
});

function success(pos) {
  const crd = pos.coords;

  // console.log("Your current position is:");
  // console.log(`Latitude: ${crd.latitude}`);
  // console.log(`Longitude: ${crd.longitude}`);
  // console.log(`More or less ${crd.accuracy} meters.`);

  document.dispatchEvent(
    new CustomEvent("city-search", {
      detail: { lat: crd.latitude, lon: crd.longitude },
      bubbles: true,
      composed: true,
    }),
  );
}

const crd = navigator.geolocation.getCurrentPosition(
  success,
  (err) => console.warn(`ERROR(${err.code}): ${err.message}`),
  {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  },
);
