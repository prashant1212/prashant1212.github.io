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


//Global variables//
var eye = [0.5,0.5,-0.5];
var light = [2,4,-0.5];
//var viewUp = Vector.create([0,1,0]);
//var lookAt = Vector.create([0,0,1]);
var LL = [0,0,0];
var UR = [1,1,0];
var UL = [0,1,0];
var LR = [1,0,0];
var sphJson = String.null;

//read spheres from the file
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
        sphJson = String.null;
    } else
        sphJson = JSON.parse(httpReq.response); 
} // end get input spheres

//find intersection of the ray from eye-pixel and the sphere
function findIntersection(pixel){
	var tmin = 999999;
	var sph = 0;
	var pixelRenderFlag = false;
	for(var i=0;i<sphJson.length;i++){
		var t=0;
		var centre = [sphJson[i].x,sphJson[i].y,sphJson[i].z];
		var D = Vector.create([pixel[0]-eye[0], pixel[1]-eye[1], pixel[2]-eye[2]]); //D=P-E
		var EC = Vector.create([eye[0]-centre[0], eye[1]-centre[1], eye[2]-centre[2]]);
		var a = D.dot(D);	
		var b = 2*(D.dot(EC));
		var c = EC.dot(EC)-(Math.pow(sphJson[i].r,2));
		var det = b*b - 4*a*c;
		if(det >= 0){
			pixelRenderFlag=1;
			var t1 = (-b+Math.sqrt(det))/(2*a);
        	var t2 = (-b-Math.sqrt(det))/(2*a);
        	if(t1<t2)
            	t=t1;
        	else
            	t=t2;
        }
        //if intersecting multiple spheres
        if(pixelRenderFlag==1 && t>=1 && t<tmin){
        	tmin = t;
        	sph = i;
        }
	}
	if(pixelRenderFlag==1 && tmin>=1 && tmin<999999){
		//calculate the point of intersection
		var poi=[(eye[0]+tmin*(pixel[0]-eye[0])),(eye[1]+tmin*(pixel[1]-eye[1])),(eye[2]+tmin*(pixel[2]-eye[2]))];
		return [poi,sph];
	}
	else
		return String.null;
}


//get the color on the point of intersection
function getColorForPoi(poi,sno,pixel){
	var La=1; var Ld=1; var Ls=1;
	var Ka = [sphJson[sno].ambient[0], sphJson[sno].ambient[1], sphJson[sno].ambient[2]]; //Ka ambient for sphere[sno] in the order RGB
	var Kd = [sphJson[sno].diffuse[0], sphJson[sno].diffuse[1], sphJson[sno].diffuse[2]];
	var Ks = [sphJson[sno].specular[0], sphJson[sno].specular[1], sphJson[sno].specular[2]];

	//normal vector
	var c = [sphJson[sno].x, sphJson[sno].y, sphJson[sno].z];
	var N = Vector.create([poi[0]-c[0], poi[1]-c[1], poi[2]-c[2]]);
	N = N.toUnitVector();

	//L vector from surface to light
	var L = Vector.create([light[0]-poi[0], light[1]-poi[1], light[2]-poi[2]]);
	L = L.toUnitVector();

	//ambient color
	var amb = [Ka[0]*La, Ka[1]*La, Ka[2]*La];

	//diffused color
	var NdotL = N.dot(L);
	var diff = [(Kd[0]*Ld*NdotL), (Kd[1]*Ld*NdotL), (Kd[2]*Ld*NdotL)];

	//calculate specular light Ls.Ks.(N.H)^n --- H=L+V/2
    //specular color
    var V = (Vector.create([eye[0]-pixel[0], eye[1]-pixel[1], eye[2]-pixel[2]])).toUnitVector(); //vector from pixel to eye
    var H = (L.add(V)).toUnitVector();
    var sdt = Math.pow(N.dot(H),5); //exponent of n
    //specular color
    var spec = [(Ks[0]*Ls*sdt), (Ks[1]*Ls*sdt), (Ks[2]*Ls*sdt)];


	//Adding A+D+S
	var colR = amb[0]+diff[0]+spec[0];
	var colG = amb[1]+diff[1]+spec[1];
	var colB = amb[2]+diff[2]+spec[2];
	console.log("R:"+colR*255+" G:"+colG*255+" B:"+colB*255);
	var col = new Color(colR*255, colG*255, colB*255,255);
	
	return col;
}

//draw pixels on the window
function loopOverPixels(context){
	var imagedata = context.createImageData(600,600);
	var leftPixel = new Array(3);
	var rightPixel = new Array(3);
	var pixel = new Array(3);
	var col;
	for(var t=0;t<=1;t=t+0.1){
		leftPixel[0] = LL[0]+t*(UL[0]-LL[0]); leftPixel[1] = LL[1]+t*(UL[1]-LL[1]); leftPixel[2] = LL[2]+t*(UL[2]-LL[2]);
		rightPixel[0] = LR[0]+t*(UR[0]-LR[0]); rightPixel[1] = LR[1]+t*(UR[1]-LR[1]); rightPixel[2] = LR[2]+t*(UR[2]-LR[2]);
		for(var s=0;s<=1;s=s+0.1){
			pixel[0] = leftPixel[0]+s*(rightPixel[0]-leftPixel[0]);
			pixel[1] = leftPixel[1]+s*(rightPixel[1]-leftPixel[1]);
			pixel[2] = leftPixel[2]+s*(rightPixel[2]-leftPixel[2]);
			//now for each pixel, iterate over each sphere to find the intersection
			var poinSph = findIntersection(pixel); 
			if(poinSph != String.null){
				var poi = poinSph[0];
				var sno = poinSph[1];
				col = getColorForPoi(poi,sno,pixel);
            }
            else{
            	col = new Color(1,1,1,255); 
            }
            			//drawing the pixel	
			var pixelindex = ((Math.floor(pixel[1]*600))*600 + (Math.floor(pixel[0]*600))) * 4;
            imagedata.data[pixelindex] = col.r;
            imagedata.data[pixelindex+1] = col.g;
            imagedata.data[pixelindex+2] = col.b;
            imagedata.data[pixelindex+3] = 255;
		}
	}
	context.putImageData(imagedata,0,0);	
}

//

//main method
function main(){
	var canvas = document.getElementById("viewport");
	var context = canvas.getContext("2d");
	//canvas.style.backgroundColor = 'rgba(0, 0, 0, 255)';
	//getTheSpheres
	getInputSpheres();
	loopOverPixels(context)
}
