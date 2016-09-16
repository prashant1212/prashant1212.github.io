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
var w = 600;
var h = 600;
var eye = [0.5,0.5,-0.50];
//var light = [1,1,-0.5];
//var viewUp = Vector.create([0,1,0]);
//var lookAt = Vector.create([0,0,1]);
var LL = [0,1,0];
var UR = [1,0,0];
var UL = [0,0,0];
var LR = [1,1,0];
var sphJson = String.null;
var lgtJson = String.null;

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

//read lights from file lights.json
function getInputLights(){
	const INPUT_LIGHTS_URL = 
		"https://prashant1212.github.io/InputFiles/lights.json";

	// load the spheres file
    var httpReq = new XMLHttpRequest(); // a new http request
    httpReq.open("GET",INPUT_LIGHTS_URL,false); // init the request
    httpReq.send(null); // send the request
    var startTime = Date.now();
    while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
        if ((Date.now()-startTime) > 3000)
            break;
    } // until its loaded or we time out after three seconds
    if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE)) {
        console.log*("Unable to open input spheres file!");
        lgtJson = String.null;
    } else
        lgtJson = JSON.parse(httpReq.response); 
} // end get input lights

//read spheres from the file
// get the input spheres from the standard class URL
function getInputSpheres() {
    const INPUT_SPHERES_URL = 
        "https://prashant1212.github.io/InputFiles/spheres.json";
        
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
	var colR = 0;
	var colG = 0;
	var colB = 0;
	
	var Ka = [sphJson[sno].ambient[0], sphJson[sno].ambient[1], sphJson[sno].ambient[2]]; //Ka ambient for sphere[sno] in the order RGB
	var Kd = [sphJson[sno].diffuse[0], sphJson[sno].diffuse[1], sphJson[sno].diffuse[2]];
	var Ks = [sphJson[sno].specular[0], sphJson[sno].specular[1], sphJson[sno].specular[2]];

	//normal vector
	var c = [sphJson[sno].x, sphJson[sno].y, sphJson[sno].z];
	var N = [poi[0]-c[0], poi[1]-c[1], poi[2]-c[2]];
	var normalise = Math.sqrt(N[0]*N[0] + N[1]*N[1] + N[2]*N[2]);
	N = [N[0]/normalise, N[1]/normalise, N[2]/normalise];
	
	for(var l=0;l<lgtJson.length;l++){
		
		var light = [lgtJson[l].x, lgtJson[l].y, lgtJson[l].z];
		//returns if this point of intersection is shadowed
		var isShadowed = isPointShadowed(poi, sno, light);

		var La= lgtJson[l].ambient; var Ld=lgtJson[l].diffuse; var Ls=lgtJson[l].specular;
		//L vector from surface to light
		var L = [light[0]-poi[0], light[1]-poi[1], light[2]-poi[2]];
		normalise = Math.sqrt(L[0]*L[0] + L[1]*L[1] + L[2]*L[2]);
		L = [L[0]/normalise, L[1]/normalise, L[2]/normalise];
		//console.log(L);

		//ambient color
		var amb = [Ka[0]*La[0], Ka[1]*La[1], Ka[2]*La[2]];

		//diffused color
		var diff = [0,0,0];
		if(!isShadowed){
			var NdotL = N[0]*L[0] + N[1]*L[1] + N[2]*L[2];
			NdotL = Math.max(0,NdotL);
			diff = [(Kd[0]*Ld[0]*NdotL), (Kd[1]*Ld[1]*NdotL), (Kd[2]*Ld[2]*NdotL)];
		}

		//calculate specular light Ls.Ks.(N.H)^n --- H=L+V/2
	    //specular color
	    var spec = [0,0,0];
	    if(!isShadowed){
	    	var V = [eye[0]-poi[0], eye[1]-poi[1], eye[2]-poi[2]]; //vector from pixel to eye
	    	//length of L+V
	    	var normLV = Math.sqrt((L[0]+V[0])*(L[0]+V[0]) + (L[1]+V[1])*(L[1]+V[1]) + (L[2]+V[2])*(L[2]+V[2]))
	    	var H = [(L[0]+V[0])/normLV, (L[1]+V[1])/normLV, (L[2]+V[2])/normLV];
	    	var sdt = Math.pow(N[0]*H[0] + N[1]*H[1] + N[2]*H[2],10); //exponent of n
	    	//specular color
	    	spec = [(Ks[0]*Ls[0]*sdt), (Ks[1]*Ls[1]*sdt), (Ks[2]*Ls[2]*sdt)];
		}

		//Adding A+D+S
		colR += amb[0]+diff[0]+spec[0];
		colG += amb[1]+diff[1]+spec[1];
		colB += amb[2]+diff[2]+spec[2];
	}
	//console.log("R:"+colR*255+" G:"+colG*255+" B:"+colB*255);
	var col = new Color(Math.min(colR,1)*255, Math.min(colG,1)*255, Math.min(colB,1)*255,255);
	
	return col;
}

//draw pixels on the window
function loopOverPixels(context){
	var imagedata = context.createImageData(w,h);
	var leftPixel = new Array(3);
	var rightPixel = new Array(3);
	var pixel = new Array(3);
	var col;
	for(var t=0;t<=1;t=t+0.001){
		//leftPixel[0] = LL[0]+t*(UL[0]-LL[0]); leftPixel[1] = LL[1]+t*(UL[1]-LL[1]); leftPixel[2] = LL[2]+t*(UL[2]-LL[2]);
		leftPixel[0] = UL[0]+t*(LL[0]-UL[0]); leftPixel[1] = UL[1]+t*(LL[1]-UL[1]); leftPixel[2] = UL[2]+t*(LL[2]-UL[2]);
		//rightPixel[0] = LR[0]+t*(UR[0]-LR[0]); rightPixel[1] = LR[1]+t*(UR[1]-LR[1]); rightPixel[2] = LR[2]+t*(UR[2]-LR[2]);
		rightPixel[0] = UR[0]+t*(LR[0]-UR[0]); rightPixel[1] = UR[1]+t*(LR[1]-UR[1]); rightPixel[2] = UR[2]+t*(LR[2]-UR[2]);
		for(var s=0;s<=1;s=s+0.001){
			pixel[0] = leftPixel[0]+s*(rightPixel[0]-leftPixel[0]);
			pixel[1] = leftPixel[1]+s*(rightPixel[1]-leftPixel[1]);
			pixel[2] = leftPixel[2]+s*(rightPixel[2]-leftPixel[2]);
			//console.log(pixel);
			//now for each pixel, iterate over each sphere to find the intersection
			var poinSph = findIntersection(pixel);  //console.log(poinSph); 
			if(poinSph != undefined && poinSph != String.null){
				var poi = poinSph[0];
				var sno = poinSph[1];

				col = getColorForPoi(poi,sno,pixel);
				//col= new Color(255,255,255,255);
            }
            else{
            	col = new Color(0,0,0,255); 
            }
            			//drawing the pixel	
            drawPixel(imagedata, Math.floor(pixel[1]*w), Math.floor(pixel[0]*h),col);	
          	/*var pixelindex = ((Math.floor(pixel[1]*600))*600 + (Math.floor(pixel[0]*600))) * 4;
            imagedata.data[pixelindex] = col.r;
            imagedata.data[pixelindex+1] = col.g;
            imagedata.data[pixelindex+2] = col.b;
            imagedata.data[pixelindex+3] = 255;*/
		}
	}
	context.putImageData(imagedata,0,0);	
}

function isPointShadowed(poi, sno, light){
	//loop over all the spheres and check if the ray to light intersects any of these spheres
	var flag = false;
	for(var s=0;s<sphJson.length;s++){
		var centre = [sphJson[s].x,sphJson[s].y,sphJson[s].z];
		var D = Vector.create([light[0]-poi[0], light[1]-poi[1], light[2]-poi[2]]); //D=L-P
		var PC = Vector.create([poi[0]-centre[0], poi[1]-centre[1], poi[2]-centre[2]]);
		var a = D.dot(D);	
		var b = 2*(D.dot(PC));
		var c = PC.dot(PC)-(Math.pow(sphJson[s].r,2));
		var det = b*b - 4*a*c;
		if(det >= 0){
			var t1 = (-b+Math.sqrt(det))/(2*a);
        	var t2 = (-b-Math.sqrt(det))/(2*a);
        	if((t1 > 0 && t1<1) && (t2>0 && t2<1))
				flag = true;
		}
	}
	return flag;
}

//setting canvas size
function setCanvasSize(){
	if(document.getElementById('canvasW').text != ''){
		w = parseInt(document.getElementById('canvasW').value);
		document.getElementById('viewport').width=w;
	}
	else
		w=600;
	if(document.getElementById('canvasH').text != ''){
		h = parseInt(document.getElementById('canvasH').value);
		document.getElementById('viewport').height=h;
	}
	else
		h=600;
}

//main method
function main(){
	var canvas = document.getElementById("viewport");
	var context = canvas.getContext("2d");
	setCanvasSize();
	//getTheSpheres
	getInputSpheres();
	getInputLights();
	loopOverPixels(context)
}
