/* classes */ 

// Color constructor
class Color {
    constructor(r,g,b,a) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0)) 
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255)) 
                throw "color component bigger than 255";
            else {
                this.r = r; this.g = g; this.b = b; this.a = a; 
            }
        } // end try
        
        catch (e) {
            console.log(e);
        }
    } // end Color constructor

        // Color change method
    change(r,g,b,a) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0)) 
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255)) 
                throw "color component bigger than 255";
            else {
                this.r = r; this.g = g; this.b = b; this.a = a; 
            }
        } // end throw
        
        catch (e) {
            console.log(e);
        }
    } // end Color change method
} // end color class


/* utility functions */

// draw a pixel at x,y using color
function drawPixel(imagedata,x,y,color) {
    try {
        if ((typeof(x) !== "number") || (typeof(y) !== "number"))
            throw "drawpixel location not a number";
        else if ((x<0) || (y<0) || (x>=imagedata.width) || (y>=imagedata.height))
            throw "drawpixel location outside of image";
        else if (color instanceof Color) {
            var pixelindex = (y*imagedata.width + x) * 4;
            imagedata.data[pixelindex] = color.r;
            imagedata.data[pixelindex+1] = color.g;
            imagedata.data[pixelindex+2] = color.b;
            imagedata.data[pixelindex+3] = color.a;
        } else 
            throw "drawpixel color is not a Color";
    } // end try
    
    catch(e) {
        console.log(e);
    }
} // end drawPixel
    
// draw random pixels
function drawRandPixels(context) {
    var c = new Color(0,0,0,0); // the color at the pixel: black
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);
    const PIXEL_DENSITY = 0.01;
    var numPixels = (w*h)*PIXEL_DENSITY; 
    
    // Loop over 1% of the pixels in the image
    for (var x=0; x<numPixels; x++) {
        c.change(Math.random()*255,Math.random()*255,Math.random()*255,255); // rand color
        drawPixel(imagedata,Math.floor(Math.random()*w),Math.floor(Math.random()*h),c);
    } // end for x
    context.putImageData(imagedata, 0, 0);
} // end draw random pixels

// get the input spheres from the standard class URL
function getInputSpheres() {
    const INPUT_SPHERES_URL = 
        "https://prashant1212.github.io/SphereFiles/spheres.json";
        
    // load the spheres file
    var httpReq = new XMLHttpRequest(); // a new http request
    httpReq.open("GET",INPUT_SPHERES_URL,false); // init the request
    httpReq.send(null); // send the request
    var startTime = Date.now();
    while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
        if ((Date.now()-startTime) > 3000)
            break;
    } // until its loaded or we time out after three seconds
    if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE)) {
        console.log*("Unable to open input spheres file!");
        return String.null;
    } else
        return JSON.parse(httpReq.response); 
} // end get input spheres

// put random points in the spheres from the class github
function drawRandPixelsInInputSpheres(context) {
    var inputSpheres = getInputSpheres();
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);
    const PIXEL_DENSITY = 100;
    var numCanvasPixels = (w*h)*PIXEL_DENSITY; 
    
    if (inputSpheres != String.null) { 
        var x = 0; var y = 0; // pixel coord init
        var cx = 0; var cy = 0; // init center x and y coord
        var sphereRadius = 0; // init sphere radius
        var numSpherePixels = 0; // init num pixels in sphere
        var c = new Color(0,0,0,0); // init the sphere color
        var n = inputSpheres.length;
        //console.log("number of spheres: " + n);

        // Loop over the spheres, draw rand pixels in each
        for (var s=0; s<n; s++) {
            cx = w*inputSpheres[s].x; // sphere center x
            cy = h*inputSpheres[s].y; // sphere center y
            sphereRadius = Math.round(w*inputSpheres[s].r); // radius
            numSpherePixels = sphereRadius*4*Math.PI; // sphere area
            numSpherePixels *= PIXEL_DENSITY; // percentage of sphere on
            numSpherePixels = Math.round(numSpherePixels);
            //console.log("sphere radius: "+sphereRadius);
            //console.log("num sphere pixels: "+numSpherePixels);
            c.change(
                inputSpheres[s].diffuse[0]*255,
                inputSpheres[s].diffuse[1]*255,
                inputSpheres[s].diffuse[2]*255,
                255); // rand color
            for (var p=0; p<numSpherePixels; p++) {
                do {
                    x = Math.random()*2 - 1; // in unit square 
                    y = Math.random()*2 - 1; // in unit square
                } while (Math.sqrt(x*x + y*y) > 1)
                drawPixel(imagedata,
                    cx+Math.round(x*sphereRadius),
                    cy+Math.round(y*sphereRadius),c);
                //console.log("color: ("+c.r+","+c.g+","+c.b+")");
                //console.log("x: "+Math.round(w*inputSpheres[s].x));
                //console.log("y: "+Math.round(h*inputSpheres[s].y));
            } // end for pixels in sphere
        } // end for spheres
        context.putImageData(imagedata, 0, 0);
    } // end if spheres found
} // end draw rand pixels in input spheres

// draw 2d projections read from the JSON file at class github
function drawInputSpheresUsingArcs(context) {
    var inputSpheres = getInputSpheres();
    
    
    if (inputSpheres != String.null) { 
        var c = new Color(0,0,0,0); // the color at the pixel: black
        var w = context.canvas.width;
        var h = context.canvas.height;
        var n = inputSpheres.length; 
        //console.log("number of spheres: " + n);

        // Loop over the spheres, draw each in 2d
        for (var s=0; s<n; s++) {
            context.fillStyle = 
                "rgb(" + Math.floor(inputSpheres[s].diffuse[0]*255)
                +","+ Math.floor(inputSpheres[s].diffuse[1]*255)
                +","+ Math.floor(inputSpheres[s].diffuse[2]*255) +")"; // rand color
            context.beginPath();
            context.arc(
                Math.round(w*inputSpheres[s].x),
                Math.round(h*inputSpheres[s].y),
                Math.round(w*inputSpheres[s].r),
                0,2*Math.PI);
            context.fill();
            //console.log(context.fillStyle);
            //console.log("x: "+Math.round(w*inputSpheres[s].x));
            //console.log("y: "+Math.round(h*inputSpheres[s].y));
            //console.log("r: "+Math.round(w*inputSpheres[s].r));
        } // end for spheres
    } // end if spheres found
} // end draw input spheres



//--------------------------------------------------------------------------//
// MY CODE GOES HERE //


//Global variables//
var LLx = 0; var LLy = 0; var LLz = 0;
var ULx = 0; var ULy = 1; var ULz = 0;
var URx = 1; var URy = 1; var URz = 0;
var LRx = 1; var LRy = 0; var LRz = 0;


function getColorForSphere(inputSphere, px, py, pz, cx, cy, cz, r){
    var La = 1; var Ld = 1; var Ls = 1;
    var Kar = inputSphere.ambient[0];    var Kag = inputSphere.ambient[1];    var Kab = inputSphere.ambient[2];
    var Kdr = inputSphere.diffuse[0];    var Kdg = inputSphere.diffuse[1];    var Kdb = inputSphere.diffuse[2];
    var Ksr = inputSphere.specular[0];    var Ksg = inputSphere.specular[1];    var Ksb = inputSphere.specular[2];

    var lx = 2; var ly = 4; var lz = -0.5; //white light location

    //calculate diffused light Ld.Kd(N.L)
    //Normal Vector N
    var Nvec = Vector.create([px-cx,py-cy,pz-cz]);
    var N = Nvec.toUnitVector();
    //L vector from surface to light
    var L = (Vector.create([lx-px,ly-py,lz-pz])).toUnitVector();

    //ambient color
    var ambR = Kar*La;
    var ambG = Kag*La;
    var ambB = Kab*La;

    //diffused color
    var diffRed = Kdr*Ld*(N.dot(L));
    var diffGreen = Kdg*Ld*(N.dot(L));
    var diffBlue = Kdb*Ld*(N.dot(L));

    //calculate specular light Ls.Ks.(N.H)^n --- H=L+V/2
    //specular color
    var V = (Vector.create([0.5-px,0.5-py,-05-pz])).toUnitVector(); //vector from pixel to eye
    var H = (L.add(V)).toUnitVector();
    var sdt = Math.pow(N.dot(H),5); //exponent of n
    //specular color
    var specR = Ksr*Ls*sdt;
    var specG = Ksg*Ls*sdt;
    var specB = Ksb*Ls*sdt;

    //adding the A+D+S for each color
    var ColR = ambR+diffRed+specR;
    var ColG = ambG+diffGreen+specG;
    var ColB = ambB+diffBlue+specB;

    //console.log(ColR+","+ColG+","+ColB);
    //return the color object
    var cOb = new Color(ColR*255,ColG*255,ColB*255,255);
    return cOb;
}

function findIntersection(px, py, pz, cx, cy, cz, r){
    var ex=0.5; var ey=0.5; var ez = -0.5;

    //defining a,b and c of quad eqn
    var a = (px-ex)*(px-ex) + (py-ey)*(py-ey) + (pz-ez)*(pz-ez); //dot(D,D) = dot(P-E)
    var b = 2*((px-ex)*(ex-cx) + (py-ey)*(ey-cy) + (pz-ez)*(ez-cz)); //2*dot(D,E-C)
    var c = (ex-cx)*(ex-cx) + (ey-cy)*(ey-cy) + (ez-cz)*(ez-cz) - r*r; //dot(E-C,E-C)
    console.log("b:"+b);
    var des = b*b - 4*a*c;
    if (des >= 0){
        var t1 = (-b+Math.sqrt(des))/(2*a);
        var t2 = (-b-Math.sqrt(des))/(2*a);
        var t;
        if(t1<t2)
            t=t1;
        else
            t=t2;

        //point of intersection
        var PintX = ex+t*(px-ex);
        var PintY = ey+t*(py-ey);
        var PintZ = ez+t*(pz-ez); 
        var arr = [PintX,PintY,PintZ];
        return arr;
    }
    else
        return null;
}


//draws the grid of pixels on the window
function drawSpherePixels(context, cx, cy, cz, radius, imagedata, inputSphere){
    var col = new Color(0,0,0,255);
    var w = context.canvas.width;
    var h = context.canvas.height;

    for(var t=0; t<=1; t=t+0.01){
        var LeftRowX = LLx + t*(ULx - LLx);
        var LeftRowY = LLy + t*(ULy - LLy);
        //var LeftRowZ = LLz + t*(ULz - LLz);  //not required
        
        var RightRowX = LRx + t*(URx - LRx);
        var RightRowY = LRy + t*(URy - LRy); 
        //var RightRowZ = LRz + t*(URz - LRz);  //not required
        
        for(var s=0; s<=1; s=s+0.01){
            //var px = Math.floor((LeftRowX + s*(RightRowX - LeftRowX))*w);
            //var py = Math.floor((LeftRowY + s*(RightRowY - LeftRowY))*h);
            var px = LeftRowX + s*(RightRowX - LeftRowX);
            var py = LeftRowY + s*(RightRowY - LeftRowY);
            var pz = 0;
            
            var poi = findIntersection(px, py, pz, cx, cy, cz, radius);
            if(poi != null){
                //console.log(poi);
                col = getColorForSphere(inputSphere, poi[0], poi[1], poi[2], cx, cy, cz, radius);
                //console.log("pX:"+px+"  pY:"+py);
                drawPixel(imagedata,Math.floor(px*w),Math.floor(py*h),col);
                //console.log(px +" , " + py);
            }
        }
    }
    context.putImageData(imagedata,0,0);
}


//loop over the spheres and draw them 
function drawSpheres(context){
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);
    //read the sphere file
    var inputSpheres = getInputSpheres();
    if (inputSpheres != String.null) { 
        var cx = 0; var cy = 0; var cz = 0; // init center x and y coord
        var radius = 0; // init sphere radius
        var n = inputSpheres.length;
        for(var s=0;s<n;s++){
            cx = inputSpheres[s].x; // sphere center x
            cy = inputSpheres[s].y; // sphere center y
            cz = inputSpheres[s].z; // sphere center z
            radius = inputSpheres[s].r; // radius

            //draw the pixels for sphere
            drawSpherePixels(context, cx, cy, cz, radius, imagedata, inputSpheres[s]);
        }
    }
}

//--------------------------------------------------------------------------//


/* main -- here is where execution begins after window load */

function main() {

    // Get the canvas and context
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");
    canvas.style.backgroundColor = 'rgba(0, 0, 0, 255)';
 
    // Create the image
   // drawRandPixels(context);
      // shows how to draw pixels
    
    //drawRandPixelsInInputSpheres(context);
      // shows how to draw pixels and read input file
      
    //drawInputSpheresUsingArcs(context);
      // shows how to read input file, but not how to draw pixels

     //drawSinglePixel(context);
      // draws the window pixels grid 

    drawSpheres(context);
}