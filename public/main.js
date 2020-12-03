fetch("https://quotes15.p.rapidapi.com/quotes/random/", {
  method: "GET",
  headers: {
    "x-rapidapi-key": "79c3948347msh2edfdafbd44f6f9p1a6e45jsn2537a1b2adbe",
    "x-rapidapi-host": "quotes15.p.rapidapi.com",
  },
})
  .then((response) => response.json())
  .then((response) => {
    console.log(response);
    console.log(response.content);
    document.getElementById("displayQuote").innerHTML = response.content;
  })
  .catch((err) => {
    console.error(err);
  });