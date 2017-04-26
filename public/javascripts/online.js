function main() {
  function filterHandler(evt){
    evt.preventDefault();
    const director = document.querySelector('#director').value;
    const url = 'http://localhost:3000/api/movies?director=' + director;
    const req = new XMLHttpRequest();
    req.open('GET', url);
    req.addEventListener('load', function() {
      if(req.status >= 200 && req.status < 400){
        const data = JSON.parse(req.responseText);
        //modify dom with new data
        const table = document.createElement('tbody');
        table.id = 'movie-list';
        const oldtable = document.body.querySelector('#movie-list');
        document.body.querySelector('#movie-list').parentNode.replaceChild(table, oldtable);
        data.movies.forEach(function(movies, i) {
          const row = document.createElement('tr');
          document.body.querySelector('#movie-list').appendChild(row);
          let div = document.createElement('td');
          div.textContent = movies.title;
          document.body.querySelector('#movie-list').childNodes[i].appendChild(div);
          div = document.createElement('td');
          div.textContent = movies.director;
          document.body.querySelector('#movie-list').childNodes[i].appendChild(div);
          div = document.createElement('td');
          div.textContent = movies.year;
          document.body.querySelector('#movie-list').childNodes[i].appendChild(div);
        });
      }
    });
    req.addEventListener('error', function() {

    });

    req.send();
  }
  function addHandler(evt){
    evt.preventDefault();
    const movieTitle = document.querySelector('#movieTitle').value;
    const movieDirector = document.querySelector('#movieDirector').value;
    const movieYear = document.querySelector('#movieYear').value;
    const url = 'http://localhost:3000/api/movies/create?movieTitle=' + movieTitle + '&movieDirector=' + movieDirector + '&movieYear=' + movieYear;
    const req = new XMLHttpRequest();
    req.open('POST', url);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.addEventListener('load', function() {
      if(req.status >= 200 && req.status < 400){
        console.log("req responseText: ", req.responseText);
        const data = JSON.parse(req.responseText);
        //modify dom with new data
        console.log(data);
        const table = document.createElement('tbody');
        table.id = 'movie-list';
        const oldtable = document.body.querySelector('#movie-list');
        document.body.querySelector('#movie-list').parentNode.replaceChild(table, oldtable);
        data.movies.forEach(function(movies, i) {
          const row = document.createElement('tr');
          document.body.querySelector('#movie-list').appendChild(row);
          let div = document.createElement('td');
          div.textContent = movies.title;
          document.body.querySelector('#movie-list').childNodes[i].appendChild(div);
          div = document.createElement('td');
          div.textContent = movies.director;
          document.body.querySelector('#movie-list').childNodes[i].appendChild(div);
          div = document.createElement('td');
          div.textContent = movies.year;
          document.body.querySelector('#movie-list').childNodes[i].appendChild(div);
        });
      }
    });
    req.addEventListener('error', function() {

    });

    req.send();
  }
  const filterBtn = document.querySelector('#filterBtn');
  filterBtn.addEventListener('click', filterHandler);
  const addBtn = document.querySelector('#addBtn');
  addBtn.addEventListener('click', addHandler);
}
//waits for entire function to be loaded
document.addEventListener('DOMContentLoaded', main);
