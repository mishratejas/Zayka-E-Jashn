let map;
let marker;
let deliveryLatLng;

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Set up button event listeners
  document.getElementById('useCurrentLocation')?.addEventListener('click', setCurrentLocation);
  document.getElementById('selectOnMap')?.addEventListener('click', showMap);
  document.getElementById('manualEntry')?.addEventListener('click', showManualEntry);
});

function showMap() {
  // Hide manual entry and show map
  document.getElementById('manualAddressContainer').classList.add('hidden');
  document.getElementById('mapContainer').classList.remove('hidden');
  
  // Initialize map if not already done
  if (!map) {
    initMap();
  }
}

function showManualEntry() {
  // Hide map and show manual entry
  document.getElementById('mapContainer').classList.add('hidden');
  document.getElementById('manualAddressContainer').classList.remove('hidden');
}

function initMap() {
  if (map) return;
  
  // Default to a central location in India
  map = L.map('map').setView([20.5937, 78.9629], 5);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Click handler for map
  map.on('click', function(e) {
    setDeliveryLocation(e.latlng);
  });

  // Search control
  const searchControl = new L.Control.Search({
    position: 'topright',
    layer: L.layerGroup().addTo(map),
    initial: false,
    zoom: 16,
    marker: false,
    autoType: false,
    autoCollapse: true,
    textPlaceholder: 'Search for location...',
    provider: new L.GeoSearch.Provider.OpenStreetMap()
  });

  searchControl.on('search:locationfound', function(e) {
    setDeliveryLocation(e.latlng);
    map.setView(e.latlng, 16);
  });

  map.addControl(searchControl);
}

function setDeliveryLocation(latlng) {
  if (!latlng || !latlng.lat || !latlng.lng) {
    console.error('Invalid coordinates:', latlng);
    return;
  }

  deliveryLatLng = latlng;
  
  if (marker) {
    marker.setLatLng(latlng);
  } else {
    marker = L.marker(latlng, { 
      draggable: true,
      icon: L.divIcon({
        className: 'delivery-marker',
        html: '<div style="color:red;font-size:2em;">📍</div>',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      })
    }).addTo(map);
    
    marker.on('dragend', function() {
      deliveryLatLng = marker.getLatLng();
      updateAddressFromLatLng(deliveryLatLng);
    });
  }
  
  updateAddressFromLatLng(latlng);
}

function updateAddressFromLatLng(latlng) {
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`, {
    headers: {
      'User-Agent': 'FoodDeliveryApp/1.0'
    }
  })
  .then(response => response.json())
  .then(data => {
    const address = data.display_name || 'Selected Location';
    document.getElementById('manualAddress').value = address;
    // Also show the address field
    document.getElementById('manualAddressContainer').classList.remove('hidden');
  })
  .catch(error => {
    console.error('Error reverse geocoding:', error);
    document.getElementById('manualAddress').value = `Location at ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
  });
}

function setCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const latlng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        // Show the map container
        document.getElementById('mapContainer').classList.remove('hidden');
        document.getElementById('manualAddressContainer').classList.add('hidden');
        
        // Initialize map if not done
        if (!map) initMap();
        
        setDeliveryLocation(latlng);
        map.setView(latlng, 16);
      },
      error => {
        console.error('Error getting location:', error);
        alert('Could not get your current location. Please select manually.');
        // Fall back to manual entry
        showManualEntry();
      }
    );
  } else {
    alert('Geolocation is not supported by your browser. Please select manually.');
    showManualEntry();
  }
}