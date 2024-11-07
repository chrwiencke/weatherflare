Rewrite of https://github.com/chrwiencke/pludo-weather-tutorial

/searchCity er en cloudflare worker:
```
export default {
  async fetch(request, env, ctx) {
    const ipAddress = request.headers.get("cf-connecting-ip") || ""
    const { success } = await env.LIMITAPIREQ.limit({ key: ipAddress })
    if ( success ) {
      return await handleRequest(request, env);
    } else {
      return new Response(`429 Failure – rate limit exceeded`, { status: 429 })
    }
  }
};

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const cityInput = url.searchParams.get("cityInput");
  if (cityInput) {
    try {
      // Fetch weather data
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&appid=${env.APIKEY}`;
      const weatherResponse = await fetch(apiUrl);

      if (!weatherResponse.ok) {
        return new Response("Error fetching weather data", {
          status: weatherResponse.status,
          headers: { "Content-Type": "text/plain" },
        });
      }

      const weatherData = await weatherResponse.json();

      // Function to fetch image
      async function imageSearch() {
        const imageUrl = `https://free-images-api.p.rapidapi.com/v2/${cityInput}/1`;
        const options = {
          method: 'GET',
          headers: {
            'x-rapidapi-key': `${env.IMAGEAPIKEY}`,
            'x-rapidapi-host': 'free-images-api.p.rapidapi.com'
          }
        };

        try {
          const response = await fetch(imageUrl, options);

          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }

          const result = await response.json();
          const firstImage = result.results[0]?.image;

          return firstImage;
        } catch (error) {
          console.error("Failed to fetch image:", error);
          return null;
        }
      }

      // Await image search result
      const cityImage = await imageSearch();

      // Generate HTML content
      const htmlContent = `
      <style>
        #search-results {
          padding: 8px;
          border-radius: 5px;
          background-color: #1c1c1c;
          text-align: start;
        }
      </style>
      <div id="search-results">
        <h2>Weather for ${weatherData.name}</h2>
        <p><i class="fa-solid fa-temperature-three-quarters"></i> ${(weatherData.main.temp - 273.15).toFixed(2)}°C</p>
        <p><i class="fa-solid fa-droplet"></i> ${weatherData.main.humidity}%</p>
        <p><i class="fa-solid fa-cloud-sun-rain"></i> ${weatherData.weather[0].description}</p>
        <p><i class="fa-solid fa-wind"></i> ${weatherData.wind.speed} m/s</p>
        <div class="image-container">
          ${cityImage ? `<img src="${cityImage}" alt="City Image">` : "<p>No image available</p>"}
        </div>
      </div>
      `;

      return new Response(htmlContent, {
        headers: { "Content-Type": "text/html" },
      });
    } catch (error) {
      return new Response("Failed to fetch weather data", {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } else {
    return new Response("City input not provided", {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }
}```
