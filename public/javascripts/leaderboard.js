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
  console.log("leaderboard: ", arr);
  if(arr !== null){
    let row, cell;
    let ratioString;
    //arr = arr.reverse();
    arr.forEach(function(l, i, a) {
      if(l.gamesPlayed === 0){
        l.ties = "--"
        ratioString = "0%"
      } else {
        let ratio = (l.wins / l.gamesPlayed) * 100;
        ratioString = ratio + "%"
        if(l.wins === 0){
          l.wins = "--"
        }
        if(l.losses === 0){
          l.losses = "--"
        }
        if(l.ties === 0){
          l.ties = "--"
        }
      }
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
      cell = generateElement('td', 'tied', null, l.ties);
      document.body.querySelectorAll('.PlayerStats')[i].appendChild(cell);
      cell = generateElement('td', 'ratio', null, ratioString);
      document.body.querySelectorAll('.PlayerStats')[i].appendChild(cell);
    });
  }

}
document.addEventListener('DOMContentLoaded', main);
