// THIS SITE USES THE COLOR THIEF LIBRARY.
//
// Grab the color palette from an image using just Javascript.
// Works in the browser and in Node.
//
// VISIT https://github.com/lokesh/color-thief FOR MORE INFO.
import ColorThief from './color-thief.js';

window.addEventListener('DOMContentLoaded', () => {
   let bg = document.getElementById('bg');
   let content_wrapper = document.getElementsByClassName('content-wrapper');

   //THESE 2 VARIABLES ARE NEEDED FOR THE COLORTHIEF FUNCTION TO WORK
   const colorThief = new ColorThief();
   let img = document.querySelector('img');

   //VARIABLES TO HELP WITH NAVIGATING THE DOM
   let search_box = content_wrapper[0].children[0].children[1];
   let search_btn = search_box.parentElement.children[0];
   let title_image = content_wrapper[0].children[1].children[0];
   let search_results = content_wrapper[0].children[0].children[2];
   let main_content = content_wrapper[0].children[1].children[1];
   let header = main_content.children[0];
   let summary = main_content.children[1];
   let actors = main_content.children[2].children[1];
   let score_wrapper = main_content.children[3];
   let stats = main_content.children[4];
   let start_screen = content_wrapper[0].children[1].children[2];

   //VARIABLES NEEDED BY MULTIPLE FUNCTIONS

   const key = '525f83c2'; //THE Omdb API KEY
   let movies = []; //WILL GET FILLED WITH RESULTS FROM CURRENT SEARCH
   let div_to_focus = 0; //USED TO NAVIGATE THE SEARCH RESULTS
   let up_or_down = true; //HELPER WHEN NAVIGATING WITH ARROWKEYS

   //THE FUNCTION THAT SEARCHES FOR MOVIES
   search_box.addEventListener('input', (e) => {
      div_to_focus = 0;

      if (search_box.value.length > 2) {
         if (search_box.value[search_box.value.length - 1] != ' ') {
            let movie = fetch(
               `https://www.omdbapi.com/?s=${search_box.value}&apikey=${key}`
            )
               .then((response) => response.json())
               .then((json) => {
                  let class_of_index = 0;
                  search_results.innerHTML = '';
                  movies = [];

                  for (let result of json.Search) {
                     if (result.Poster != 'N/A') {
                        let div = document.createElement('div');
                        div.innerHTML = `<img src="${result.Poster}" width="30px" height="40px">`;
                        div.classList.add('search-title');
                        let title = document.createTextNode(result.Title);
                        div.id = class_of_index++;
                        div.appendChild(title);
                        search_results.appendChild(div);
                        movies.push(result);
                     }
                  }
               })
               .catch((error) => {
                  //WE DO NOTHING HERE BUT BAD DATA IS HIDDEN
               });
         }
      }
   });

   //THE FUNCTION USED TO SIMULATE A FOCUS EFFECT WHEN USING THE MOUSE TO
   //MOVE OVER SEARCH RESULTS. I USED THIS AS I COULDN'T FIND A WAY TO
   //GIVE FOCUS TO DIVS WITH THE ARROWKEYS.
   document.addEventListener('mousemove', (e) => {
      for (let div of search_results.children) {
         if (e.target.id == div.id) {
            div.classList.add('focus');
            div_to_focus = Number(div.id);
         } else {
            div.classList.remove('focus');
         }
      }
   });

   //THE FUNCTION FOR TRAVERSING THE SEARCH RESULTS WITH THE ARROWKEYS
   search_box.addEventListener('keydown', (e) => {
      if (e.key == 'ArrowDown') {
         if (up_or_down == false) {
            div_to_focus++;
            up_or_down = true;
         }
         search_results.children[div_to_focus].classList.add('focus');
         if (div_to_focus > 0) {
            search_results.children[div_to_focus - 1].classList.remove('focus');
         }
         if (div_to_focus < movies.length - 1) {
            div_to_focus++;
         }
      } else if (e.key == 'ArrowUp') {
         if (up_or_down == true) {
            if (div_to_focus < movies.length - 1 && div_to_focus > 0) {
               div_to_focus--;
            }
            up_or_down = false;
         }
         if (div_to_focus > 0) {
            div_to_focus--;
         }
         search_results.children[div_to_focus].classList.add('focus');
         if (div_to_focus >= 0 && div_to_focus < movies.length - 1) {
            search_results.children[div_to_focus + 1].classList.remove('focus');
         }
      } else if (e.key == 'Enter') {
         for (let send of search_results.children) {
            if (send.classList.contains('focus')) {
               getMovie(send);
            }
         }
      }
   });

   search_results.addEventListener('click', (e) => {
      getMovie(e.target);
   });

   search_btn.addEventListener('click', () => {
      if (movies.length > 0) {
         getMovie(search_results.children[0]);
      }
   });

   //THE FUNCTION THAT GETS AND SETS ALL THE ELEMENTS FOR THE MAIN
   //CONTENT OF THE PAGE. IT WORKS WITH 2 DIFFERENT API'S AT THE
   //MOMENT, Omdb TO GET MOVIE DATA AND TVMAZE TO GET ACTOR IMAGES
   function getMovie(search_movie) {
      bg.innerHTML = `<img id="img1" crossOrigin="anonymous" src='${
         movies[search_movie.id].Poster
      }' width="100%"></img>`;

      img = document.querySelector('img');
      title_image.innerHTML = bg.innerHTML;
      header.innerText = movies[search_movie.id].Title;
      changeBackgroundColor();
      search_results.innerHTML = '';
      search_box.value = '';
      let movie = fetch(
         `https://www.omdbapi.com/?i=${
            movies[search_movie.id].imdbID
         }&plot=full&apikey=${key}`
      )
         .then((response) => response.json())
         .then((json) => {
            summary.innerText = json.Plot;

            //GENERATING A LINK TO THE MOVIE ON IMDB
            score_wrapper.children[0].href = `https://www.imdb.com/title/${json.imdbID}`;
            score_wrapper.children[0].children[1].innerText =
               json.Ratings[0].Value;

            //GENERATING A LINK TO THE MOVIE ON ROTTEN TOMATOES
            try {
               let formatted_title_rotten = json.Title.split(' ')
                  .join('_')
                  .toLowerCase();
               score_wrapper.children[1].href = `https://www.rottentomatoes.com/m/${formatted_title_rotten}`;
               score_wrapper.children[1].children[1].innerText =
                  json.Ratings[1].Value;
            } catch {
               score_wrapper.children[1].href = 'javascript:;';
               score_wrapper.children[1].children[1].innerText = 'N/A';
            }
            //GENERATING A LINK TO THE MOVIE ON METACRITIC
            try {
               let formatted_title_metacritic = json.Title.split(' ')
                  .join('-')
                  .toLowerCase();
               score_wrapper.children[2].href = `https://www.metacritic.com/movie/${formatted_title_metacritic}`;
               score_wrapper.children[2].children[1].innerText =
                  json.Ratings[2].Value;
            } catch {
               score_wrapper.children[2].href = 'javascript:;';
               score_wrapper.children[2].children[1].innerText = 'N/A';
            }

            stats.style.display = 'flex';
            start_screen.style.display = 'none';
            title_image.style.display = 'block';
            score_wrapper.style.display = 'flex';

            stats.children[1].innerText = json.Director;
            stats.children[3].innerText = json.Production;
            stats.children[5].innerText = json.Released;
            stats.children[7].innerText = json.Genre;
            stats.children[9].innerText = json.Country;
            stats.children[11].innerText = json.Awards;
            stats.children[13].innerText = json.BoxOffice;

            let actor_names = json.Actors.split(', ');
            actors.innerHTML = '<div class="starring"><h1>Starring</h1></div>';
            for (let actor of actor_names) {
               let formatted_name = actor.split(' ').join('-').toLowerCase();
               let actor_data = fetch(
                  `https://api.tvmaze.com/search/people?q=${formatted_name}`
               )
                  .then((actor_response) => actor_response.json())
                  .then((actor_json) => {
                     actors.innerHTML += `<div class="actor-image"><img src="${actor_json[0].person.image.medium}"><p>${actor_json[0].person.name}</p></div>`;
                  })
                  .catch((error) => {
                     //DO NOTHING BUT BAD DATA IS HIDDEN
                  });
            }
         });
   }

   //THE FUNCTIONS CALLS THE COLOR THIEF LIBRARY TO GET THE PRIMARY COLOR
   //OF THE CURRENT POSTER. THEN IT GIVES THIS COLOR TO THE MAIN CONTENT
   //WRAPPER DIV. I ALSO ADDED THE FEATURE THAT THE TEXT CHANGES COLOR
   //IF THE DIV HAPPENS TO GET DARK.
   function changeBackgroundColor() {
      let color;
      if (img.complete) {
         color = colorThief.getColor(img, 9);
         content_wrapper[0].style.backgroundColor = `rgba(${color}, 0.94)`;
      } else {
         img.addEventListener('load', function () {
            color = colorThief.getColor(img, 9);
            content_wrapper[0].style.backgroundColor = `rgba(${color}, 0.94)`;
            let dark = color.reduce(
               (accumulated, currentValue) => accumulated + currentValue,
               0
            );

            if (dark < 168) {
               content_wrapper[0].classList.add('content-light');
            } else {
               content_wrapper[0].classList.remove('content-light');
            }
         });
      }
   }
});
