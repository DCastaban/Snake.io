import { Component, AfterContentInit } from '@angular/core';
import { Node } from '../helperClasses/Node';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterContentInit{
  directionFailsafe: boolean;
  title = 'app';
  canvas : HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  animCancelID : number;
  deathBool: boolean = false;
  grid: any[];
  direction : string = '';
  leader : Node;
  now : number;
  then : number = 0;
  interval : number = 100;
  food : number[];
  score : number = 0;
  multiplier: number = 1;
  multiplierTimer : number = Date.now();
  multiplierExpiry : number = 3000;
  pause : boolean = false;
  canGoOppositeDirection : boolean = true;
  highscore : any = "loading...";
  highscoreName : string = "";
  highscoreColour: string = "white";
  highscoreColourChange: boolean = true;
  beatenHighscore : boolean = false;
  boxSize : number = Math.max(window.innerHeight * 0.04538577912, window.innerWidth * 0.02196193265);
  boxSpacing : number = 3;
  widthPadding : number = 0;
  heightPadding : number = 0;
  encourage : boolean = false;
  
  constructor(){
    // Get the highscore from public s3 bucket
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            this.highscoreGetCallback(xmlHttp.response);
        }
    }
    xmlHttp.open("GET", "https://ubu6p7l7be.execute-api.us-east-1.amazonaws.com/Production/gethighscore", true); // true for asynchronous 
    xmlHttp.send(null);
  }

  private highscoreGetCallback = (response) => {
    this.highscore = JSON.parse(response)['highscore'];
    this.highscoreName = JSON.parse(response)['name'];
  }

ngAfterContentInit(){
  this.canvas = <HTMLCanvasElement>document.getElementById('container');
  this.canvas.height = window.innerHeight - this.heightPadding;
  this.canvas.width = window.innerWidth - this.widthPadding;
  document.addEventListener('keydown', this.keyboardInput);
  this.ctx = this.canvas.getContext("2d");
  //each square is 30 or 27
  //want it to be responsive
  var gridHeight = Math.floor(window.innerHeight / this.boxSize) - 8
  var gridWidth = Math.floor(window.innerWidth / this.boxSize) - 11
  
  this.grid = new Array<number []>(gridWidth);
  for(var i = 0; i < gridWidth; i++){
    var row = new Array<number>(gridHeight);
    this.grid[i] = row;
    for(var b = 0; b < gridHeight; b++){
      this.grid[i][b] = 0;
    }
  }
  this.leader = new Node([Math.floor(Math.random() * (this.grid.length)),
                          Math.floor(Math.random() * (this.grid[0].length))]);
  this.resetFood();
  this.grid[this.leader.x][this.leader.y] = 1;
  this.gameLoop();
}

  
 private gameLoop = () => {
    if(!this.pause){
      this.now = Date.now();
      if((this.now - this.then) > this.interval){
        this.move();
        this.then = this.now - ((this.now - this.then) % this.interval);
        this.directionFailsafe = true;
      }
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.draw();
    }
    this.animCancelID = requestAnimationFrame(() => this.gameLoop());
 }

private move = () => {
 if(this.direction === 'left'){
  this.moveLeader(this.leader.x - 1, this.leader.y);
 }
 else if(this.direction === 'right'){
  this.moveLeader(this.leader.x + 1, this.leader.y);
 }
 else if(this.direction === 'up'){
  this.moveLeader(this.leader.x, this.leader.y - 1);
 }
 else if(this.direction === 'down'){
  this.moveLeader(this.leader.x, this.leader.y + 1);
 }
}

private moveLeader = (x : number, y : number) => {
  if(x > this.grid.length - 1 || x < 0
  || y > this.grid[0].length - 1 || y < 0){
    this.death();
    return;
  }
  this.checkForCrash(x,y);
  this.resetGrid();
  this.checkEat();
  this.moveSnake();
  this.leader.x = x;
  this.leader.y = y;
  this.setSnake();
}
private checkForCrash = (x : number, y : number) => {
  let curr = this.leader;
  let crash = false;
  while(!(curr == null)){
    if(x === curr.x && y === curr.y) crash = true;
    curr = curr.next;
  }
  if(crash) this.death();
}
private death = () => {
  //Potential try again code:
  // this.deathBool = true;
  // if(window.confirm("You have died! Your score was: " + this.score + " Would you like to play again?")){
  // 	// this.resetGame();
  // }
  window.cancelAnimationFrame(this.animCancelID);
  alert("You have died! Game Over! Your score was: " + this.score);
  window.cancelAnimationFrame(this.animCancelID);
  this.pause = true;
}
private keyboardInput = (event : KeyboardEvent) => {
    if(event.keyCode === 32){
      this.pause = !this.pause;
    }
    else if(this.canGoOppositeDirection){
      if(event.keyCode ===  <number>37 || event.keyCode === <number>65){
        this.direction = 'left';
      }
      else if(event.keyCode === <number>39 || event.keyCode === <number>68){
        this.direction = 'right';
      }
      else if(event.keyCode === <number>38 || event.keyCode === <number>87){
        this.direction = 'up';
      }
      else if(event.keyCode === <number>40 || event.keyCode === <number>83){
        this.direction = 'down';
      }
    }
    else{ 
      if(this.directionFailsafe){
        if((event.keyCode ===  <number>37 || event.keyCode === <number>65) && !(this.direction === 'right')){
          this.direction = 'left';
        }
        else if((event.keyCode === <number>39 || event.keyCode === <number>68) && !(this.direction === 'left')){
          this.direction = 'right';
        }
        else if((event.keyCode === <number>38 || event.keyCode === <number>87) && !(this.direction === 'down')){
          this.direction = 'up';
        }
        else if((event.keyCode === <number>40 || event.keyCode === <number>83) && !(this.direction === 'up')){
          this.direction = 'down';
        }
      }
      this.directionFailsafe = false;
    }
 }
 private draw = () => {
  this.paintItBlue();
  for(var i = 0; i < this.grid.length; i++){
    for(var b = 0; b < this.grid[i].length; b++){
      if(this.grid[i][b] === 1){
        this.ctx.fillStyle = 'yellow';
        this.ctx.fillRect(i * (this.boxSize + this.boxSpacing) + 100, // X value
          b * (this.boxSize + this.boxSpacing) + 80, // Y value
          this.boxSize , // length
          this.boxSize); // width
      }
      else if(this.grid[i][b] === 3){
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(i * (this.boxSize + this.boxSpacing) + 100, // X value
          b * (this.boxSize + this.boxSpacing) + 80, // Y value
          this.boxSize , // length
          this.boxSize); // width
      }

      else if(this.grid[i][b] === 0){
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(i * (this.boxSize + this.boxSpacing) + 100, // X value
          b * (this.boxSize + this.boxSpacing) + 80, // Y value
          this.boxSize + this.boxSpacing, // length
          this.boxSize + this.boxSpacing); // width
      }

    }
  }
  this.ctx.font = "20px Times New Roman";
  this.ctx.fillStyle = "white";
  this.ctx.fillText("Score: " + this.score, 10, 30); 
  this.ctx.fillText("Multiplier: " + this.multiplier + "x", 10, 60); 
  this.paintHighscore();
  if (this.encourage) {
    this.sayEncouragingThings();
  }
 }
 private paintHighscore(){
  if(this.beatenHighscore){
    // Congratulate with random colours!
    this.updateHighscore();
    this.highscore = this.score;
    this.ctx.fillStyle = this.highscoreColour;
    if(this.highscoreColourChange){
      this.highscoreColour = "#"+((1<<24)*Math.random()|0).toString(16);
      this.highscoreColourChange = false;
      setTimeout(() => {
        this.highscoreColourChange = true;
      }, 100)
    }
  }
  this.ctx.font = "40px Times New Roman";
  var highscoreText = "Global Highscore: " + this.highscore + " - " + this.highscoreName;
  this.ctx.fillText(highscoreText, window.innerWidth - window.innerWidth * 0.7, 55); 
  var textLength = this.ctx.measureText(highscoreText);
  this.ctx.fillRect(window.innerWidth - window.innerWidth * 0.7, 65, textLength.width, 5);
 }
 private updateHighscore(){
  var url = "https://ubu6p7l7be.execute-api.us-east-1.amazonaws.com/Production/updatehighscore?highscore=" + this.score + "&name=" + this.highscoreName;
  // create a new XMLHttpRequest
  var xhr = new XMLHttpRequest();
  // open the request with the verb and the url
  xhr.open('PUT', url);
  // send the request
  xhr.send();
 }
 private paintItBlue = () => {
   for(var i = 0; i < this.grid.length; i++){
     for(var b = 0; b < this.grid[i].length; b++){
       this.ctx.fillStyle = 'blue';
       this.ctx.fillRect(i * this.boxSize + 100 + this.boxSpacing * i, 
        b * (this.boxSize + this.boxSpacing) + 80, 
        this.boxSize + this.boxSpacing, 
        this.boxSize + this.boxSpacing);
     }
   }
 }
 private moveSnake = () => {
   if(this.leader.next == null) return;
   //Sets curr to the node after the leader
   let curr = this.leader.next;
   //Sets prevData to leaders data
   let prevData = [this.leader.x, this.leader.y];
   //While there is another node
   while(!(curr.next == null)){
      //stores current nodes data temporarily
      let temp = [curr.x, curr.y];
      //changes current nodes data
      curr.data = prevData;
      //stores current nodes data permanently
      prevData = temp;
      //iterates loop
      curr = curr.next;
   }
   curr.data = prevData;
 }
 private setSnake = () => {
   let curr = this.leader;
   while(!(curr == null)){
     this.grid[curr.x][curr.y] = 1;
     curr = curr.next;
   }
 }

 private possibleEncouragingTexts = ["Legendary!", "Holy Smokes!", "God Tier Plays!", "God????"];
 private encouragingText = this.possibleEncouragingTexts[Math.floor(Math.random() * this.possibleEncouragingTexts.length)];

 private sayEncouragingThings = () => {
  this.ctx.font = "40px Times New Roman";
  this.ctx.fillStyle = "white";
  this.ctx.fillText(this.encouragingText, window.innerWidth - window.innerWidth * 0.7, window.innerHeight * 0.9);
  setTimeout(() => {
    this.encourage = false;
    this.encouragingText = this.possibleEncouragingTexts[Math.floor(Math.random() * this.possibleEncouragingTexts.length)];
  }, 3000)
 }

 private checkEat = () => {
   let curr = this.leader;
   let foodNotEaten = true;
   while((!(curr == null)) && foodNotEaten){
      if(curr.x === this.food[0] && curr.y === this.food[1]) foodNotEaten = false;
      curr = curr.next;
   }
   if(!foodNotEaten) this.eatFood(3);
   else{
     this.grid[this.food[0]][this.food[1]] = 3;
   }
 }
 private eatFood = (followers : number) => {
    this.encourage = true;
    this.score += 3 * this.multiplier;
    if (this.score % 3 != 0) {
      while (true) {
        alert("Stop hacking you absolute pleb! Cheaters never truly win.");
      }
    }
    this.checkForHighscore()
    let timeElapsed = Date.now() - this.multiplierTimer;
    if(timeElapsed < this.multiplierExpiry){ 
      this.multiplier++; 
    }
    else {
      this.multiplier = 1;
    }
    this.multiplierTimer = Date.now();
    this.resetFood();
    for(var i = 0; i < followers; i++){
      let curr = this.leader;
      let prev = null;
      while(!(curr.next == null)){
        prev = curr;
        curr = curr.next;
      }
      if(prev == null) {
        this.firstMeal();
        return;
      }
      this.checkNearBounds();
      //if snake is going to the left
      if(prev.x - 1 === curr.x){
        curr.next = new Node([curr.x + 1, curr.y]);
      }
      //If snake is going to the right
      else if (prev.x + 1 === curr.x){
        curr.next = new Node([curr.x - 1, curr.y]);
      }
      //If snake is going down
      else if(prev.y - 1 === curr.y){
        curr.next = new Node([curr.x, curr.y + 1]);
      }
      //If snake is going up
      else if(prev.y + 1 === curr.y){
        curr.next = new Node([curr.x, curr.y - 1]);
      }
    }
    

 }
 
 private checkForHighscore(){
     if(this.score > this.highscore){
         this.highscore = this.score;
         if (this.beatenHighscore == false) {
           this.pause = true;
           this.highscoreName = prompt("Oh legendary one, please give a name for the highscore leaderboards");
           alert("resuming in 3 seconds, get ready!");
           setTimeout( () => {
             this.pause = false;
           }, 3000);
         }
         this.beatenHighscore = true;
     }
 }

 private firstMeal = () => {
   if(this.direction === 'left'){
     this.leader.next = new Node([this.leader.x + 1, this.leader.y]);
   }
   else if(this.direction === 'right'){
    this.leader.next = new Node([this.leader.x - 1, this.leader.y]);
   }
   else if(this.direction === 'up'){
    this.leader.next = new Node([this.leader.x, this.leader.y - 1]);
   }
   else if(this.direction === 'down'){
    this.leader.next = new Node([this.leader.x, this.leader.y + 1]);
   }
   this.canGoOppositeDirection = false;
   this.eatFood(2);
 }
 private checkNearBounds = () => {
   //Check if the snake is near the bound and if it is,
   //add to the end of snake in a different way.
 }
 private resetGrid = () => {
  for(var i = 0; i < this.grid.length; i++){
    for(var b = 0; b < this.grid[i].length; b++){
      this.grid[i][b] = 0;
    }
  }
 }
 private resetFood = () => {
  if(!(this.food == undefined)) { 
    this.grid[this.food[0]][this.food[1]] = 0; 
  }
  this.food = [Math.floor(Math.random() * (this.grid.length)),
               Math.floor(Math.random() * (this.grid[0].length))];
  while((this.food[0] === this.leader.x && this.food[1] === this.leader.y) || this.foodInSnake()){
    this.food = [Math.floor(Math.random() * (this.grid.length )),
      Math.floor(Math.random() * (this.grid[0].length))];
  }
  //Need to implement what if food spawns in snake? TODO
  this.grid[this.food[0]][this.food[1]] = 3;
  // Set multiplier timer expiry to be a function of the euclidean distance
  let xdistance = Math.abs(this.food[0] - this.leader.x);
  let ydistance = Math.abs(this.food[1] - this.leader.y);
  this.multiplierExpiry = xdistance * 220 + ydistance * 220 + 300;
 }

 private foodInSnake = () : boolean => {
   let curr = this.leader;
   let foodInSnake = false;
   while(!(curr == null) && !foodInSnake){
      if(this.food[0] === curr.x && this.food[1] === curr.y){
        foodInSnake = true;
      }
      curr = curr.next;
   }
   return foodInSnake;
 }
 

}


