console.log("hello from client side");



export const displayMap=locations=>{

  mapboxgl.accessToken = `pk.eyJ1IjoicmFoMTIzYSIsImEiOiJja2dnZTYwbWcxN2NmMnFzMWZsajF0ejVrIn0.wfUfuCjW-sg3hiyE9GzVIw`;


  var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/rah123a/ckggp6ypy024p19p4u3y4lwac',
  });
  const bounds = new mapboxgl.LngLatBounds();
  
    locations.forEach(loc => {
      // Create marker
      const el = document.createElement('div');
      el.className = 'marker';
  
      // Add marker
      new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat(loc.coordinates)
        .addTo(map);
  
      // Add popup
      new mapboxgl.Popup({
        offset: 30
      })
        .setLngLat(loc.coordinates)
       .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map);
  
      // Extend map bounds to include current location
      bounds.extend(loc.coordinates);
    });
  
    map.fitBounds(bounds, {
      padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100
      }
    });
}
