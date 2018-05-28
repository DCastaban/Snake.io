import { Component, AfterContentInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterContentInit{
  title = 'app';
  canvas : HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  grid: any[];
  direction : string = '';
  leader : number[];

  move(){
    console.log('move ran');
   if(this.direction === 'left'){
     this.leader[0]--;
     this.gameLoop();
   }
   else if(this.direction === 'right'){
     this.leader[0]++;
     this.gameLoop();
   }
   else if(this.direction === 'up'){
     this.leader[1]++;
     this.gameLoop();
   }
   else if(this.direction === 'down'){
     this.leader[1]--;
     this.gameLoop();
   }
   else if(this.direction === 'space'){
 
   }
  }
  constructor(){
    this.leader = new Array(2);
  }
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
  this.leader[0] = Math.floor(Math.random() * (this.grid.length + 1)) - 1;
  this.leader[1] = Math.floor(Math.random() * (this.grid[0].length + 1)) - 1;
  this.grid[this.leader[0]][this.leader[1]] = 1;
  this.gameLoop();
  }

  
 gameLoop() {
  () => {
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
    this.draw();
    this.move();
  }
    requestAnimationFrame(this.gameLoop);

 }
 keyboardInput(event : KeyboardEvent){
    if(event.keyCode ===  37){
      this.direction = 'left';
      this.move();
    }
    else if(event.keyCode === 39){
      this.direction = 'right';
      this.move();
    }
    else if(event.keyCode === 38){
      this.direction = 'up';
      this.move();
    }
    else if(event.keyCode === 40){
      this.direction = 'down';
      this.move();
    }
    else if(event.keyCode === 32){
      this.direction = 'space';
      this.move();
    }
 }
 draw(){
  for(var i = 0; i < this.grid.length; i++){
    for(var b = 0; b < this.grid[i].length; b++){
      if(this.grid[i][b] === 1){
        this.ctx.fillStyle = 'yellow';
        this.ctx.fillRect(i * 30 + 100, b * 30 + 80, 30, 30);
      }
      else if(this.grid[i][b] === 0){
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(i * 30 + 100, b * 30 + 80, 30, 30);
      }
    }
  }
 }
 

}


