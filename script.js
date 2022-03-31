let canvas = document.getElementById('canvas');
let slider = document.getElementById('Rank')
let value = document.getElementById('value')
value.textContent = slider.value;

slider.onchange = function() {
    value.textContent = this.value;
    k = parseInt(this.value)
    lowerResolution(k)
}


let img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'Tiger.png';


let ctx = canvas.getContext('2d');

img.onload = function() {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
};


function reduceMatrix(A, k, bool) {
    // removes the last k columns of A
    // if bool is true then it also removes the last k rows
    if (bool) {
        A.splice(k, A.length -1);   
        return A;
    }
    else {
        B = [];
        let newRow
        for (row of A){
            newRow = row.slice(0,k)
            B.push(newRow);
        }
        return B
    }
}


let lowerResolution = function(k) {

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let colorsArray = [];
    let newLine = [];
    let j =0;

    for (let i = 0; i < data.length; i += 4) {
        j++
        let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

        if (j<100) {
            newLine.push(avg)
        }
        else {
            j=0
            newLine.push(avg)
            colorsArray.push(newLine)
            newLine = [];
        }
    }

    // SVD calculation:

    const {u, v, q} = SVDJS.SVD(colorsArray)

    Uk = reduceMatrix(u, k, false);
    Vk = reduceMatrix(v, k, false);
    Sk = reduceMatrix(q, k, true)
    
    const matrixUk = math.matrix(Uk)
    const matrixVk = math.matrix(Vk)
    const matrixVkTransp = math.transpose(matrixVk)
    const matrixSk = math.diag(Sk)

    USk = math.multiply(matrixUk, matrixSk);
    const Ak = math.multiply(USk, matrixVkTransp)

    // Convert into image
    const [height, width] = Ak._size;
    let buffer = new Uint8ClampedArray(width*height*4)
    const oneDimensional = [];
    for(var y = 0; y < height; y++) {
        for(var x = 0; x < width; x++) {
            var pos = (y * width + x) * 4; 
            buffer[pos  ] = Ak._data[y][x];  // R
            buffer[pos+1] = Ak._data[y][x];  // G
            buffer[pos+2] = Ak._data[y][x];  // B
            buffer[pos+3] = 255;       // alpha         }
        }        
    }

    imageData.data.set(buffer);    
    ctx.putImageData(imageData, 0, 0);
}

