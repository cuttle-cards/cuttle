class Player{
  //int
  id = null;
  //String
  name =  null;
  //Array<Card>
  hand = null;
  //Array<Card>
  points = null;
  //Array<Card>
  faceCards = null;

  constructor(player) {
      this.hand = player.hand ? player.hand : null; 
      this.points = player.points ? player.points :null; 
      this.faceCards = player.faceCards ? player.faceCards :null;
      this.name = player.name ? player.name :null; 
      this.id = player.id ? player.id :null;
  }
}

module.exports = Player;