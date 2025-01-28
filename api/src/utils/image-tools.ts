// const { createCanvas, loadImage } = require('canvas')

export namespace ImageTools {

  // export const generateTexture = (text: string, x = 300, y: number = 300, optimize_sizes = false) => {

  //   let width = x;
  //   let height = y;

  //   if (optimize_sizes) {
  //     width = Math.ceil(width/100)*100;
  //     height = Math.ceil(height/100)*100;
  //   }

  //   const colors = [
  //     '#f0adb0',
  //     '#f5c2ab',
  //     '#fae0ad',
  //     '#c6d7b2',
  //     '#c4def0'
  //   ]

  //   text = text.toUpperCase().repeat(10);

  //   // Set variables
  //   const canvasShift = 80;
  //   const copyAmount = 4;
  //   const fontSize = width / copyAmount;
  //   const fontStyle = `Bold ${fontSize}px Arial Black`;
  
  //   // Create canvas
  //   const canvas = createCanvas(width, height)

  //   canvas.width = width;
  //   canvas.height = height;
  
  //   // Create 2d context
  //   const ctx = canvas.getContext("2d");
  //   // canvas.width = ctx.measureText(text).width;

  //   // Add canvas background color #344
  //   const hash = hashCode(text) % colors.length;
  //   ctx.fillStyle = colors[hash];
  //   ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  //   // Add font style again
  //   ctx.fillStyle = "#fff";
  //   ctx.font = fontStyle;

  //   ctx.translate(-250, 250);
  //   ctx.rotate(-Math.PI / 6);

  //   // Add text on the canvas
  //   const scaledText = (index) => {
  //     ctx.fillText(text, 0, fontSize * ++index - canvasShift);
  //   };

  //   Array(copyAmount + 1)
  //     .fill(0)
  //     .forEach((item, i) => {
  //       scaledText(i);
  //     });
  
  //   const background = canvas.toDataURL("image/webp");
  //   const regex = /^data:.+\/(.+);base64,(.*)$/;
  //   const matches = background.match(regex);
  //   if (!matches || matches.length !== 3) {
  //     console.error('Invalid base64 image');
  //     return null;
  //   }
  //   const ext = matches[1];
  //   const data = matches[2];
  //   const buffer = Buffer.from(data, 'base64');
  //   return buffer;
  // };



  function hashCode(str: string) {
    let hash = 0,
      i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return Math.abs(hash);
  }

}