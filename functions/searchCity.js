async function handleRequest(request) {
    const url = new URL(request.url);
    const cityInput = url.searchParams.get("cityInput");
    const APIKEY = context.env.WeatherAPIKey
    if (cityInput) {
    request(`https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&appid=${APIKEY}`)

    return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
    });
    } else {
    return new Response("City input not provided", {
        status: 400,
        headers: { "Content-Type": "text/plain" },
    });
    }
}
