import ColorThief from './color-thief.js';

window.addEventListener('DOMContentLoaded', () => {
   let bg = document.getElementById('bg');
   let content_wrapper = document.getElementsByClassName('content-wrapper');
   let search_box = content_wrapper[0].children[0].children[1];
   let title_image = content_wrapper[0].children[1].children[0];
   let search_results = content_wrapper[0].children[0].children[2];

   let main_content = content_wrapper[0].children[1].children[1];
   let header = main_content.children[0];
   let summary = main_content.children[1];
   let actors = main_content.children[2].children[1];
   let score_wrapper = main_content.children[3];
   let stats = content_wrapper[0].children[1].children[1].children[4];
   let start_screen = content_wrapper[0].children[1].children[2];

   //console.log(content_wrapper[0].children[1].children[1].children[4].children);

   const key = ''; //API NYCKELN SKA IN HÄR

   let movies;
   const colorThief = new ColorThief();
   let img = document.querySelector('img');

   search_box.addEventListener('input', (e) => {
      div_to_focus = 0;
      //console.log('kommer in här');
      //console.log(e);
      //if(input == )
      if (search_box.value.length > 2) {
         let movie = fetch(
            `http://www.omdbapi.com/?s=${search_box.value}&apikey=${key}`
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
               //movies = json.Search;
            });
      }
   });
   document.addEventListener('mousemove', (e) => {
      //console.log(e.target);
      for (let div of search_results.children) {
         if (e.target.id == div.id) {
            div.classList.add('focus');
            div_to_focus = Number(div.id);
         } else {
            div.classList.remove('focus');
         }
      }
   });
   //console.log(document.hasFocus());
   let div_to_focus = 0;
   let up_or_down = true;
   let focused = document.hasFocus();
   //console.log(focused);
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
            if (div_to_focus < movies.length - 1) {
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
         // console.log(search_results.children[div_to_focus]);
         for (let send of search_results.children) {
            if (send.classList.contains('focus')) {
               getMovie(send);
            }
         }
         //getMovie(search_results.children[div_to_focus - 1]);
      }
   });

   search_results.addEventListener('click', (e) => {
      //console.log(e);
      getMovie(e.target);
   });

   function getMovie(e) {
      bg.innerHTML = `<img id="img1" crossOrigin="anonymous" src='${
         movies[e.id].Poster
      }' width="100%"></img>`;
      img = document.querySelector('img');
      title_image.innerHTML = bg.innerHTML;
      //console.log(movies[e.id]);
      header.innerText = movies[e.id].Title;
      changeBackgroundColor();
      search_results.innerHTML = '';
      search_box.value = '';
      let movie = fetch(
         `http://www.omdbapi.com/?i=${
            movies[e.id].imdbID
         }&plot=full&apikey=${key}`
      )
         .then((response) => response.json())
         .then((json) => {
            console.log(json);
            summary.innerText = json.Plot;

            //IMDB
            score_wrapper.children[0].href = `https://www.imdb.com/title/${json.imdbID}`;
            score_wrapper.children[0].children[1].innerText =
               json.Ratings[0].Value;

            //Rotten Tomatoes
            let formatted_title_rotten = json.Title.split(' ')
               .join('_')
               .toLowerCase();
            score_wrapper.children[1].href = `https://www.rottentomatoes.com/m/${formatted_title_rotten}`;
            score_wrapper.children[1].children[1].innerText =
               json.Ratings[1].Value;

            //Metacritic
            let formatted_title_metacritic = json.Title.split(' ')
               .join('-')
               .toLowerCase();
            score_wrapper.children[2].href = `https://www.metacritic.com/movie/${formatted_title_metacritic}`;
            score_wrapper.children[2].children[1].innerText =
               json.Ratings[2].Value;

            //http://api.tvmaze.com/search/people?q=leonardo-dicaprio
            /*
            score_wrapper.children[1].innerText = json.Ratings[0].Value;
            score_wrapper.children[3].innerHTML = `<a href="https://www.rottentomatoes.com/m/${test}" target="_blank">${json.Ratings[1].Value}</a>`;
            score_wrapper.children[5].innerText = json.Ratings[2].Value;
            */
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
                  `http://api.tvmaze.com/search/people?q=${formatted_name}`
               )
                  .then((actor_response) => actor_response.json())
                  .then((actor_json) => {
                     console.log(actor_json[0].person);
                     actors.innerHTML += `<div class="actor-image"><img src="${actor_json[0].person.image.medium}"><p>${actor_json[0].person.name}</p></div>`;
                  });
            }
         });
   }

   function changeBackgroundColor() {
      let light;
      if (img.complete) {
         light = colorThief.getColor(img, 9);
         content_wrapper[0].style.backgroundColor = `rgba(${light}, 0.94)`;
      } else {
         img.addEventListener('load', function () {
            light = colorThief.getColor(img, 9);
            content_wrapper[0].style.backgroundColor = `rgba(${light}, 0.94)`;
            let dark = light.reduce(
               (accumulated, currentValue) => accumulated + currentValue,
               0
            );
            if (dark < 143) {
               content_wrapper[0].classList.add('content-light');
            } else {
               content_wrapper[0].classList.remove('content-light');
            }
         });
      }
   }
});
