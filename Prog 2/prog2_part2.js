/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const WIN_Z = 0;  // default graphics window z coord in world space
const WIN_LEFT = 0; const WIN_RIGHT = 1;  // default left and right x coords in world space
const WIN_BOTTOM = 0; const WIN_TOP = 1;  // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://prashant1212.github.io/Prog 2/inputFiles/triangles.json"; // triangles file loc
const INPUT_SPHERES_URL = "https://ncsucgclass.github.io/prog2/spheres.json"; // spheres file loc
//var Eye = new vec4.fromValues(0.5,0.5,-0.5,1.0); // default eye position in world space
var eye = new vec3.fromValues(0.5, 0.5, -0.5); // 3d coord of the eye
//var center = new vec3.fromValues(0.5, 0.5, 0); //centre for the lookAt
var lookUp = new vec3.fromValues(0, 1, 0); // lookUp vector for the view matrix;
var lookAt = new vec3.fromValues(0, 0, 1);

/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var vertexBuffer; // this contains vertex coordinates in triples
var triangleBuffer; // this contains indices into vertexBuffer in triples
var colorBuffer;
var triBufferSize = 0; // the number of indices in the triangle buffer
var vertexPositionAttrib; // where to put position for vertex shader
var vertexColorAttrib; // where to put color for the vertex shader
var pMatrix = mat4.create(); //perspective matrix for the shader program
var mvMatrix = mat4.create();
var shaderProgram; // global variable for the shader program
var sphereVertexBuffer;
var sphereVertexNormalBuffer;
var sphereIndexBuffer;
var sphereColorBuffer;
var sphereBufferSize=0;

// ASSIGNMENT HELPER FUNCTIONS



function setMatrixUniforms(){
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input spheres

// set up the webGL environment
function setupWebGL() {

    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it
    
    try {
      if (gl == null) {
        throw "unable to create gl context -- is your browser gl ready?";
      } else {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
        gl.clearDepth(1.0); // use max when we clear the depth buffer
        gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
      }
    } // end try
    
    catch(e) {
      console.log(e);
    } // end catch
 
} // end setupWebGL

// read triangles in, load them into webgl buffers
function loadTriangles() {
    var inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles"); console.log(inputTriangles);

    if (inputTriangles != String.null) { 
        var whichSetVert; // index of vertex in current triangle set
        var whichSetTri; // index of triangle in current triangle set
        var coordArray = []; // 1D array of vertex coords for WebGL
        var indexArray = []; // 1D array of vertex indices for WebGL
        var diffColorArray = []; //1D array of colors for WebGL
        var vtxBufferSize = 0; // the number of vertices in the vertex buffer
        var vtxToAdd = []; // vtx coords to add to the coord array
        var indexOffset = vec3.create(); // the index offset for the current set
        var triToAdd = vec3.create(); // tri indices to add to the index array
        
        for (var whichSet=0; whichSet<inputTriangles.length; whichSet++) {
            vec3.set(indexOffset,vtxBufferSize,vtxBufferSize,vtxBufferSize); // update vertex offset
            console.log("indexOffset:: "+indexOffset);
            var colorToAdd = inputTriangles[whichSet].material.diffuse;
            // set up the vertex coord array
            for (whichSetVert=0; whichSetVert<inputTriangles[whichSet].vertices.length; whichSetVert++) {
                vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert];
                coordArray.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]); 
                diffColorArray.push(colorToAdd[0], colorToAdd[1], colorToAdd[2]);	
            } // end for vertices in set
            //console.log(coordArray);
            // set up the triangle index array, adjusting indices across sets
            for (whichSetTri=0; whichSetTri<inputTriangles[whichSet].triangles.length; whichSetTri++) {
                vec3.add(triToAdd,indexOffset,inputTriangles[whichSet].triangles[whichSetTri]); console.log("triToAdd:: "+triToAdd); 
                indexArray.push(triToAdd[0],triToAdd[1],triToAdd[2]); console.log("indexArray:: "+indexArray);
            } // end for triangles in set
            //console.log(indexArray);
            vtxBufferSize += inputTriangles[whichSet].vertices.length; // total number of vertices
            console.log("vtxBufferSize:: "+vtxBufferSize);
            triBufferSize += inputTriangles[whichSet].triangles.length; // total number of tris
            console.log("triBufferSize:: "+triBufferSize);

            //get diffused colors
        } // end for each triangle set 
        triBufferSize *= 3; // now total number of indices
        console.log("triBufferSize:: "+triBufferSize);
        //console.log('diffColorArray:: '+diffColorArray.length);
        //console.log("coordinates: "+coordArray.length);
        // console.log("numverts: "+vtxBufferSize);
        // console.log("indices: "+indexArray.toString());
        // console.log("numindices: "+triBufferSize);
        
        // send the vertex coords to webGL
        vertexBuffer = gl.createBuffer(); // init empty vertex coord buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(coordArray),gl.STATIC_DRAW); // coords to that buffer
        console.log(coordArray);
        //send the diffuse colors to WebGL
        colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(diffColorArray),gl.STATIC_DRAW);
        
        // send the triangle indices to webGL
        triangleBuffer = gl.createBuffer(); // init empty triangle index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer); // activate that buffer
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indexArray),gl.STATIC_DRAW); // indices to that buffer

        

    } // end if triangles found
} // end load triangles

function loadSpheres(){
	var inputSpheres = getJSONFile(INPUT_SPHERES_URL,"spheres");
	if(inputSpheres != String.null){
		var coordArray = [];
		var indexArray = [];
		var vertexNormalArray = [];
		var sphereDiffColorArray = [];
		
		var offset = 0;

		for(var whichSet =0; whichSet<inputSpheres.length;whichSet++){
			var center = [];
			var diffColor = inputSpheres[whichSet].diffuse;
			center.push(inputSpheres[whichSet].x, inputSpheres[whichSet].y, inputSpheres[whichSet].z);
			var radius = inputSpheres[whichSet].r;
			var latitudeBands = 30;
			var longitudeBands = 30;
			var coordCount = 0;
			
			for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
		      var theta = latNumber * Math.PI / latitudeBands;
		      var sinTheta = Math.sin(theta);
		      var cosTheta = Math.cos(theta);

		      for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
		        var phi = longNumber * 2 * Math.PI / longitudeBands;
		        var sinPhi = Math.sin(phi);
		        var cosPhi = Math.cos(phi);

		        var x = cosPhi * sinTheta;
		        var y = cosTheta;
		        var z = sinPhi * sinTheta;
		        
		        coordArray.push(center[0]+radius * x);
		        coordArray.push(center[1]+radius * y);
		        coordArray.push(center[2]+radius * z);

		        //calculate and store the vertex normals in a 1D array
		        var normal = [radius * x, radius * y, radius * z];
		        var normalise = Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1] + normal[2]*normal[2]);
		        normal = [normal[0]/normalise, normal[1]/normalise, normal[2]/normalise];
		        vertexNormalArray.push(normal[0], normal[1], normal[2]);
		        //

		        sphereDiffColorArray.push(diffColor[0], diffColor[1], diffColor[2]);

		        coordCount = coordCount + 1;
		      }
		    }
		    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
		      for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
		        var first = (latNumber * (longitudeBands + 1)) + longNumber;
		        var second = first + longitudeBands + 1;
		        indexArray.push(offset+first);
		        indexArray.push(offset+second);
		        indexArray.push(offset+first + 1);

		        indexArray.push(offset+second);
		        indexArray.push(offset+second + 1);
		        indexArray.push(offset+first + 1);
		     	}
		    }
		    offset = offset + coordCount;
		}
		

	    sphereVertexBuffer = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER,sphereVertexBuffer); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(coordArray),gl.STATIC_DRAW); // coords to that buffer
        console.log(coordArray);

        sphereVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormalArray),gl.STATIC_DRAW);
        sphereVertexNormalBuffer.itemSize=3;
        sphereVertexNormalBuffer.numItems=vertexNormalArray.length;

        sphereColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,sphereColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(sphereDiffColorArray),gl.STATIC_DRAW);

        sphereIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);
        console.log(indexArray);
        sphereBufferSize = indexArray.length;

	}
}

// setup the webGL shaders
function setupShaders() {
    
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
    	precision mediump float;

    	varying vec3 vColor;

        void main(void) {
        	//gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // all fragments are white
            gl_FragColor = vec4(vColor,1.0); // give the fragment that color
        }
    `;
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 vertexPosition;
        attribute vec3 vertexNormal;
        attribute vec3 vertexColor;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform mat3 uNMatrix;

        uniform vec3 uAmbientColor;
        uniform vec3 uLigthingDirection;


        varying vec3 vColor;

        void main(void) {
            gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0); // use the untransformed position
            vColor = vertexColor;
        }
    `;
    
    try {
        // console.log("fragment shader: "+fShaderCode);
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        // console.log("vertex shader: "+vShaderCode);
        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution

        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                vertexPositionAttrib = gl.getAttribLocation(shaderProgram, "vertexPosition"); // get pointer to vertex shader input
                gl.enableVertexAttribArray(vertexPositionAttrib); // input to shader from array
                console.log('before enable');
                vertexColorAttrib = gl.getAttribLocation(shaderProgram, "vertexColor");
                gl.enableVertexAttribArray(vertexColorAttrib);
                shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
                shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
                //mat4.perspective(pMatrix, 90*(3.14/180), 600/600, 0.5, 1.5);
                mat4.lookAt(mvMatrix, eye, lookAt, lookUp);
                //mat4.frustum(pMatrix, WIN_LEFT, WIN_RIGHT, WIN_BOTTOM, WIN_TOP, 0.0, 1.0);
                
                mat4.identity(mvMatrix);
                var translation = vec3.create();
                vec3.set(translation, -0.5, -0.5, 0);
                mat4.translate(mvMatrix, mvMatrix, translation);
				               

        		setMatrixUniforms();
        		console.log('here');
        		//console.log("pMatrix::: "+pMatrix);
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

// render the loaded model
function renderTriangles() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    
    // vertex buffer: activate and feed into vertex shader
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); // activate
    gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed

    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
    gl.vertexAttribPointer(vertexColorAttrib,3,gl.FLOAT,false,0,0);

    // triangle buffer: activate and render
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffer); // activate
    gl.drawElements(gl.TRIANGLES,triBufferSize,gl.UNSIGNED_SHORT,0); // render
} // end render triangles

//render spheres
function renderSpheres(){
	//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuffer);
	gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0);

	gl.bindBuffer(gl.ARRAY_BUFFER,sphereColorBuffer);
    gl.vertexAttribPointer(vertexColorAttrib,3,gl.FLOAT,false,0,0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,sphereIndexBuffer);
	gl.drawElements(gl.TRIANGLES,sphereBufferSize,gl.UNSIGNED_SHORT,0);
}


/* MAIN -- HERE is where execution begins after window load */

function main() {
  
  setupWebGL(); // set up the webGL environment
  setupShaders();
  loadTriangles(); // load in the triangles from tri file
  
   // setup the webGL shaders
  renderTriangles(); // draw the triangles using webGL
  loadSpheres();
  
  renderSpheres();
  
} // end main