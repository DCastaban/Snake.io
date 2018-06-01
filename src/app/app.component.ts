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
  grid: any[];
  direction : string = '';
  leader : Node;
  now : number;
  then : number = 0;
  interval : number = 100;
  food : number[];
  score : number = 0;
  multiplier: number = 1;
  multiplierTimer: number = Date.now();
  pause : boolean = false;
  canGoOppositeDirection : boolean = true;
  
  constructor(){}

ngAfterContentInit(){
  this.canvas = <HTMLCanvasElement>document.getElementById('pls');
  document.addEventListener('keydown', this.keyboardInput);
  this.ctx = this.canvas.getContext("2d");
  this.grid = new Array<number []>(35);
  for(var i = 0; i < 35; i++){
    var temp = new Array<number>(25);
    this.grid[i] = temp;
    for(var b = 0; b < 25; b++){
      this.grid[i][b] = 0;
    }
  }
  this.leader = new Node([Math.floor(Math.random() * (this.grid.length)),
                          Math.floor(Math.random() * (this.grid[0].length))]);
  this.resetFood();
  this.grid[this.leader.x][this.leader.y] = 1;
  this.gameLoop();
  }

  
 public gameLoop = () => {
    if(!this.pause){
      this.now = Date.now();
      if((this.now - this.then) > this.interval){
        this.move();
        this.then = this.now - ((this.now - this.then) % this.interval);
        this.directionFailsafe = true;
      }
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
      this.draw();
    }
    this.animCancelID = requestAnimationFrame(() => this.gameLoop());
 }

public move = () => {
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

public moveLeader = (x : number, y : number) => {
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
public checkForCrash = (x : number, y : number) => {
  let curr = this.leader;
  let crash = false;
  while(!(curr == null)){
    if(x === curr.x && y === curr.y) crash = true;
    curr = curr.next;
  }
  if(crash) this.death();
}
public death = () => {
  window.cancelAnimationFrame(this.animCancelID);
  alert("You have died! Game Over! Your score was: " + this.score);
  window.cancelAnimationFrame(this.animCancelID);
}
public keyboardInput = (event : KeyboardEvent) => {
    if(event.keyCode === 32){
      this.pause = !this.pause;
    }
    else if(this.canGoOppositeDirection){
      if(event.keyCode ===  37){
        this.direction = 'left';
      }
      else if(event.keyCode === 39){
        this.direction = 'right';
      }
      else if(event.keyCode === 38){
        this.direction = 'up';
      }
      else if(event.keyCode === 40){
        this.direction = 'down';
      }
    }
    else{ 
      if(this.directionFailsafe){
        if(event.keyCode ===  37 && !(this.direction === 'right')){
          this.direction = 'left';
        }
        else if(event.keyCode === 39 && !(this.direction === 'left')){
          this.direction = 'right';
        }
        else if(event.keyCode === 38 && !(this.direction === 'down')){
          this.direction = 'up';
        }
        else if(event.keyCode === 40 && !(this.direction === 'up')){
          this.direction = 'down';
        }
      }
      this.directionFailsafe = false;
    }
 }
 public draw = () => {
  this.paintItBlue();
  for(var i = 0; i < this.grid.length; i++){
    for(var b = 0; b < this.grid[i].length; b++){
      if(this.grid[i][b] === 1){
        this.ctx.fillStyle = 'yellow';
        this.ctx.fillRect(i * 30 + 100, b * 30 + 80, 27, 27);
      }
      else if(this.grid[i][b] === 0){
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(i * 30 + 100, b * 30 + 80, 30, 30);
      }
      else if(this.grid[i][b] === 3){
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(i * 30 + 100, b * 30 + 80, 27, 27);
      }
    }
  }
  this.ctx.font = "20px Times New Roman";
  this.ctx.fillStyle = "white";
  this.ctx.fillText("Score: " + this.score, 10, 30); 
  this.ctx.fillText("Multiplier: " + this.multiplier + "x", 10, 60); 
 }
 public paintItBlue = () => {
   for(var i = 0; i < this.grid.length; i++){
     for(var b = 0; b < this.grid[i].length; b++){
       this.ctx.fillStyle = 'blue';
       this.ctx.fillRect(i * 30 + 100, b * 30 + 80, 30, 30);
     }
   }
 }
 public moveSnake = () => {
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
 public setSnake = () => {
   let curr = this.leader;
   while(!(curr == null)){
     this.grid[curr.x][curr.y] = 1;
     curr = curr.next;
   }
 }
 public checkEat = () => {
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
 public eatFood = (followers : number) => {
    this.score += 3 * this.multiplier;
    if(Date.now() - this.multiplierTimer < 3000){ 
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
 public firstMeal = () => {
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
 public checkNearBounds = () => {
   //Check if the snake is near the bound and if it is,
   //add to the end of snake in a different way.
 }
 public resetGrid = () => {
  for(var i = 0; i < this.grid.length; i++){
    for(var b = 0; b < this.grid[i].length; b++){
      this.grid[i][b] = 0;
    }
  }
 }
 public resetFood = () => {
  if(!(this.food == undefined)) { 
    this.grid[this.food[0]][this.food[1]] = 0; 
  }
  this.food = [Math.floor(Math.random() * (this.grid.length)),
               Math.floor(Math.random() * (this.grid[0].length))];
  while((this.food[0] === this.leader.x && this.food[1] === this.leader.y) || this.foodInSnake()){
    this.food = [Math.floor(Math.random() * (this.grid.length )),
      Math.floor(Math.random() * (this.grid[0].length))];
  }
  //Need to implement what if food spawns in snake?
  console.log("This is the grid:" + this.grid);
  console.log("this is food:" + this.food); 
  this.grid[this.food[0]][this.food[1]] = 3;
 }
 public foodInSnake = () : boolean => {
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


