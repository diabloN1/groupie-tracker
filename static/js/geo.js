// Read and parse json (takes a string and returns the parsed object)

const artist = JSON.parse(document.getElementById('artistData').textContent)

async function initMap() {
    let locations = [];
    const promises = artist.Locations.map(async (location) => {
        const url = "https://maps.googleapis.com/maps/api/geocode/json?address="+encodeURIComponent(location)+"&key=AIzaSyC2YF98sYKPI_9APG0O0vFFRDcL1K9nBl0";
        try {
            const data = await fetch(url);
            const response = await data.json();
            if (response.results.length > 0) {
                const result = response.results[0].geometry.location;
                locations.push({ name: location, lat: result.lat, lng: result.lng });
            return result;
            } else {
                console.error('No results found for the given city.');
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
        
    })
    
    // Await for the api requests to get response
    await Promise.all(promises);

    // Create a map centered at a default location
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 2,
        center: { lat: 20.0, lng: 0.0 }  // Center on the world map
        });
 
        locations.forEach((city) => {
        var marker = new google.maps.Marker({
            position: { lat: city.lat, lng: city.lng },
            map: map,
        });
    });

}

