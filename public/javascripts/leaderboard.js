//generates an HTML element
function generateElement(type, className, id, innerHTML, attrs) {
  const element = document.createElement(type);
  if (className) {
    element.className = className;
  }
  if (id) {
    element.id = id;
  }
  if (innerHTML) {
    element.innerHTML = innerHTML;
  }
  if (attrs) {
    for (prop in attrs) {
      element.setAttribute(prop, attrs[prop]);
    }
  }
  return element;
}

function main(){
  if(leaderboard !== null){
    let row, cell;
    leaderboard.users.forEach(function(l, i, arr) {
      row = generateElement('tr', 'PlayerStats');
      document.body.querySelector('#leadertable').appendChild(row);
      cell = generateElement('td', 'rank', null, i + 1);
      document.body.querySelectorAll('.PlayerStats')[i].appendChild(cell);
      cell = generateElement('td', 'name', null, l.username);
      document.body.querySelectorAll('.PlayerStats')[i].appendChild(cell);
      cell = generateElement('td', 'won', null, l.wins);
      document.body.querySelectorAll('.PlayerStats')[i].appendChild(cell);
      cell = generateElement('td', 'lost', null, l.losses);
      document.body.querySelectorAll('.PlayerStats')[i].appendChild(cell);
      cell = generateElement('td', 'tied', null, l.tied);
      document.body.querySelectorAll('.PlayerStats')[i].appendChild(cell);
      let ratio = (l.wins / l.gamesPlayed);
      let ratioString = ratio + "%"
      cell = generateElement('td', 'ratio', null, ratioString);
      document.body.querySelectorAll('.PlayerStats')[i].appendChild(cell);
    });
  }

}
document.addEventListener('DOMContentLoaded', main);
