let canvasArray = document.getElementsByTagName("canvas");
if (canvasArray.length > 0) {
  let canvas = canvasArray[0];
  if (canvas) {
    canvas.style.display = "none";
    const {children} = canvas.parentNode;
    let len = children.length;
    let div = children[1];
    if(div){
      div.style.display='none';
      console.log('hide div')
    }
    // console.log(div);
  }
}

let div=document.getElementById('myDiv')
console.log(div)
