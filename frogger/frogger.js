//code begins

var scene, camera, renderer, keyboard;
var frogMesh;
var row1cars = [];
var row2cars = [];
var row3cars = [];
var row4cars = [];

var row1logs = [];
var row2logs = [];
var row3logs = [];
var row4logs = [];
var row5logs = [];
var row6logs = [];
//var geometry, material, mesh;

var winText; var winCount=0;
var lossText; var lossCount=0;


function init() {

    scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera(-window.innerWidth/2, window.innerWidth/2, -window.innerHeight/2, window.innerHeight/2, -10, 10000);
    camera.position.z = -10;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    //var logTexture = new THREE.ImageUtils.loadTexture("log.jpg");

    document.body.appendChild( renderer.domElement );
    document.addEventListener("keydown", onDocumentKeyDown, false);

    winText = document.getElementById('winCount').innerText;
    lossText = document.getElementById('lossCount').innerText;

}

//moveFrog
function onDocumentKeyDown(event){
	var keyCode = event.which;
	//var isCorrectMove = true;
	///////////////////////////////////put limits on frog movements
	if( keyCode == 38 ){//Up
		if(frogMesh.position.y > -180)
			frogMesh.position.y -= 40;
	}
	else if( keyCode == 40 ){//Down
		if(frogMesh.position.y < 300)
			frogMesh.position.y += 40;
	}
	else if( keyCode == 37 ){//Left
		if(frogMesh.position.x > ((-window.innerWidth/2) + 15))
			frogMesh.position.x -= 40;
	}
	else if( keyCode == 39 ){//Right
		if(frogMesh.position.x < ((window.innerWidth/2) - 15))
		frogMesh.position.x += 40;
	}

}

function checkCorrectMove(){
	var isOnBanks = isFrogOnBanks();
	if(isOnBanks)
		return 1;

	var frogYpos = frogMesh.position.y;
	var frogXpos = frogMesh.position.x;
	var onRoad;
	var inRiver;
	var whichCarRow = null;
	var whichLogRow = null;
	var logSpeed = 0;

	if(frogYpos == 260)
		whichCarRow = row1cars;
	else if(frogYpos == 220)
		whichCarRow = row2cars;
	else if(frogYpos == 180)
		whichCarRow = row3cars;
	else if(frogYpos == 140)
		whichCarRow = row4cars;
	//frog is in the river
	else if(frogYpos == 60){
		whichLogRow = row1logs;
		logSpeed = 3;
	}
	else if(frogYpos == 20){
		whichLogRow = row2logs;
		logSpeed = 2.5;
	}
	else if(frogYpos == -20){
		whichLogRow = row3logs;
		logSpeed = 4;
	}
	else if(frogYpos == -60){
		whichLogRow = row4logs;
		logSpeed = 2;
	}
	else if(frogYpos == -100){
		whichLogRow = row5logs;
		logSpeed = 3.5;
	}
	else if(frogYpos == -140){
		whichLogRow = row6logs;
		logSpeed = 5;
	}


	if(whichCarRow != null){
		for(var i=0; i<whichCarRow.length; i++){
			var carXpos = whichCarRow[i].position.x;
			var carLength = whichCarRow[i].geometry.parameters.width;

			//console.log((Math.abs(carXpos - frogXpos)));
			//console.log((15 + carLength/2));
			if((Math.abs(carXpos - frogXpos)) < (15 + carLength/2))
				return 0;
		}
	}
	else if(whichLogRow != null){
		if(frogMesh.position.x < ((window.innerWidth/2) - 15))
			frogMesh.position.x += logSpeed;
		for(var i=0; i<whichLogRow.length; i++){
			var logXpos = whichLogRow[i].position.x;
			var logLength = whichLogRow[i].geometry.parameters.width;

			if((Math.abs(frogXpos - logXpos)) < Math.abs(logLength/2  - 15))
				return 1;
		}
		return 0;
	}
	else{//frog reached destination
		return 2;
	} 
	return 1; 
}

function isFrogOnBanks(){
	var frogPos = frogMesh.position.y;

	if(frogPos == 300 || frogPos == 100)
		return true;
}

function drawField(){
	var roadBorder = new THREE.BoxGeometry( window.innerWidth, 30, 2 );
    var material = new THREE.MeshBasicMaterial( { color: 0xCCCCCC, side: THREE.FrontSide } );

    var roadBorderMesh1 = new THREE.Mesh( roadBorder, material );
    roadBorderMesh1.position.y = 300;
    scene.add( roadBorderMesh1 );
    
    var roadBorderMesh2 = new THREE.Mesh( roadBorder, material );
    roadBorderMesh2.position.y = 100;
    scene.add(roadBorderMesh2 );

    var road = new THREE.BoxGeometry(window.innerWidth, 170, 2);
    var roadMaterial = new THREE.MeshBasicMaterial( { color: 0x404040, side: THREE.FrontSide } );
    var roadMesh = new THREE.Mesh( road, roadMaterial );
    roadMesh.position.y = 200;
    scene.add( roadMesh );

//    var riverBank1 = new THREE.BoxGeometry( window.innerWidth, 30, 2 );
    var riverBankMaterial = new THREE.MeshBasicMaterial( { color: 0x641E16, side: THREE.FrontSide } );
/*    var riverBankMesh1 = new THREE.Mesh(riverBank1, riverBankMaterial);
    riverBankMesh1.position.y = 70;
    scene.add(riverBankMesh1);
*/
    var river = new THREE.BoxGeometry(window.innerWidth, 250, 2);
    var riverMaterial = new THREE.MeshBasicMaterial( { color: 0x0000FF, side: THREE.FrontSide } );
    var riverMesh = new THREE.Mesh( river, riverMaterial );
    riverMesh.position.y = -40;
    scene.add( riverMesh ); 

    var riverBank2 = new THREE.BoxGeometry( window.innerWidth, 30, 2 );
    var riverBankMesh2 = new THREE.Mesh(riverBank2, riverBankMaterial);
    riverBankMesh2.position.y = -180;
    scene.add(riverBankMesh2); 
}

function drawFrog(){
	var frog  = new THREE.BoxGeometry(30, 30, 2);
	var frogMaterial = new THREE.MeshBasicMaterial({ color :0x04FE06, side: THREE.FrontSide});
	frogMesh = new THREE.Mesh(frog, frogMaterial);
	frogMesh.position.y = 300;
	scene.add(frogMesh);
}


function modelCar(){
	var baseMesh = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 10), new THREE.MeshBasicMaterial({ color: 0xF4D03F, side: THREE.FrontSide}));
	var topMesh = new THREE.Mesh(new THREE.BoxGeometry(50, 30, 10), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide}));
	var car = new THREE.Object3D();
	car.add(baseMesh);
	car.add(topMesh);
	return car;
}

 
function drawCars(){
	//row 1 vehicles 
	var car = new THREE.BoxGeometry(200, 30, 2);
	var carMaterial = new THREE.MeshBasicMaterial({ color: 0xF4D03F, side: THREE.FrontSide });
	var carMesh;

	var carMesh1 = new THREE.Mesh(car, carMaterial);
	carMesh1.position.x = window.innerWidth/2;
	carMesh1.position.y = 260;
	row1cars.push(carMesh1);
	scene.add(carMesh1); 

	var carMesh2 = new THREE.Mesh(new THREE.BoxGeometry(50, 30, 2), new THREE.MeshBasicMaterial({ color: 0xF4D03F, side: THREE.FrontSide }));
	carMesh2.position.x = window.innerWidth/2 - 300;
	carMesh2.position.y = 260;
	row1cars.push(carMesh2);
	scene.add(carMesh2);

	var carMesh3 = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 2), new THREE.MeshBasicMaterial({ color: 0xF4D03F, side: THREE.FrontSide }));
	carMesh3.position.x = window.innerWidth/2 - 700;
	carMesh3.position.y = 260;
	row1cars.push(carMesh3);
	scene.add(carMesh3);

	//row 2 vehicles
	var carMesh21 = new THREE.Mesh(new THREE.BoxGeometry(40, 30, 2), new THREE.MeshBasicMaterial({ color: 0xF4D03F, side: THREE.FrontSide }));
	carMesh21.position.x = -window.innerWidth/2;
	carMesh21.position.y = 220;
	row2cars.push(carMesh21);
	scene.add(carMesh21);

	var carMesh22 = new THREE.Mesh(new THREE.BoxGeometry(70, 30, 2), new THREE.MeshBasicMaterial({ color: 0xF4D03F, side: THREE.FrontSide }));
	carMesh22.position.x = -window.innerWidth/2 + 300;
	carMesh22.position.y = 220;
	row2cars.push(carMesh22);
	scene.add(carMesh22);

	var carMesh23 = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 2), new THREE.MeshBasicMaterial({ color: 0xF4D03F, side: THREE.FrontSide }));
	carMesh23.position.x = -window.innerWidth/2 + 700;
	carMesh23.position.y = 220;
	row2cars.push(carMesh23);
	scene.add(carMesh23);

	var carMesh24 = new THREE.Mesh(new THREE.BoxGeometry(70, 30, 2), new THREE.MeshBasicMaterial({ color: 0xF4D03F, side: THREE.FrontSide }));
	carMesh24.position.x = -window.innerWidth/2 + 1000;
	carMesh24.position.y = 220;
	row2cars.push(carMesh24);
	scene.add(carMesh24);

	//row 3 vehicles
	var carMesh31 = new THREE.Mesh(new THREE.BoxGeometry(40, 30, 2), new THREE.MeshBasicMaterial({ color: 0xF4D03F, side: THREE.FrontSide }));
	carMesh31.position.x = window.innerWidth/2;
	carMesh31.position.y = 180;
	row3cars.push(carMesh31);
	scene.add(carMesh31);

	var carMesh32 = new THREE.Mesh(new THREE.BoxGeometry(70, 30, 2), new THREE.MeshBasicMaterial({ color: 0xF4D03F, side: THREE.FrontSide }));
	carMesh32.position.x = window.innerWidth/2 + 300;
	carMesh32.position.y = 180;
	row3cars.push(carMesh32);
	scene.add(carMesh32);

	var carMesh33 = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 2), new THREE.MeshBasicMaterial({ color: 0xF4D03F, side: THREE.FrontSide }));
	carMesh33.position.x = window.innerWidth/2 + 700;
	carMesh33.position.y = 180;
	row3cars.push(carMesh33);
	scene.add(carMesh33);

	var carMesh34 = new THREE.Mesh(new THREE.BoxGeometry(70, 30, 2), new THREE.MeshBasicMaterial({ color: 0xF4D03F, side: THREE.FrontSide }));
	carMesh34.position.x = window.innerWidth/2 + 1000;
	carMesh34.position.y = 180;
	row3cars.push(carMesh34);
	scene.add(carMesh34);

	//row 4 vehicles
	var carMesh41 = new THREE.Mesh(new THREE.BoxGeometry(40, 30, 2), new THREE.MeshBasicMaterial({ color: 0xF4D03F, side: THREE.FrontSide }));
	carMesh41.position.x = -window.innerWidth/2;
	carMesh41.position.y = 140;
	row4cars.push(carMesh41);
	scene.add(carMesh41);

	var carMesh42 = new THREE.Mesh(new THREE.BoxGeometry(70, 30, 2), new THREE.MeshBasicMaterial({ color: 0xF4D03F, side: THREE.FrontSide }));
	carMesh42.position.x = -window.innerWidth/2 + 300;
	carMesh42.position.y = 140;
	row4cars.push(carMesh42);
	scene.add(carMesh42);

	var carMesh43 = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 2), new THREE.MeshBasicMaterial({ color: 0xF4D03F, side: THREE.FrontSide }));
	carMesh43.position.x = -window.innerWidth/2 + 700;
	carMesh43.position.y = 140;
	row4cars.push(carMesh43);
	scene.add(carMesh43);

	var carMesh44 = new THREE.Mesh(new THREE.BoxGeometry(70, 30, 2), new THREE.MeshBasicMaterial({ color: 0xF4D03F, side: THREE.FrontSide }));
	carMesh44.position.x = -window.innerWidth/2 + 1000;
	carMesh44.position.y = 140;
	row4cars.push(carMesh44);
	scene.add(carMesh44);
}

function drawLogs(){
	//row 1 logs
	var logMesh11 = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh11.position.x = -window.innerWidth/2;
	logMesh11.position.y = 60;
	row1logs.push(logMesh11);
	scene.add(logMesh11);

	var logMesh12 = new THREE.Mesh(new THREE.BoxGeometry(150, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh12.position.x = -window.innerWidth/2 + 400;
	logMesh12.position.y = 60;
	row1logs.push(logMesh12);
	scene.add(logMesh12);

	var logMesh13 = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh13.position.x = -window.innerWidth/2 + 800;
	logMesh13.position.y = 60;
	row1logs.push(logMesh13);
	scene.add(logMesh13);

	var logMesh14 = new THREE.Mesh(new THREE.BoxGeometry(200, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh14.position.x = -window.innerWidth/2 + 1100;
	logMesh14.position.y = 60;
	row1logs.push(logMesh14);
	scene.add(logMesh14);

	//row 2 logs
	var logMesh21 = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh21.position.x = -window.innerWidth/2;
	logMesh21.position.y = 20;
	row2logs.push(logMesh21);
	scene.add(logMesh21);

	var logMesh22 = new THREE.Mesh(new THREE.BoxGeometry(150, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh22.position.x = -window.innerWidth/2 + 400;
	logMesh22.position.y = 20;
	row2logs.push(logMesh22);
	scene.add(logMesh22);

	var logMesh23 = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh23.position.x = -window.innerWidth/2 + 800;
	logMesh23.position.y = 20;
	row2logs.push(logMesh23);
	scene.add(logMesh23);

	var logMesh24 = new THREE.Mesh(new THREE.BoxGeometry(200, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh24.position.x = -window.innerWidth/2 + 1100;
	logMesh24.position.y = 20;
	row2logs.push(logMesh24);
	scene.add(logMesh24);

	//row 3 logs
	var logMesh31 = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh31.position.x = -window.innerWidth/2;
	logMesh31.position.y = -20;
	row3logs.push(logMesh31);
	scene.add(logMesh31);

	var logMesh32 = new THREE.Mesh(new THREE.BoxGeometry(150, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh32.position.x = -window.innerWidth/2 + 400;
	logMesh32.position.y = -20;
	row3logs.push(logMesh32);
	scene.add(logMesh32);

	var logMesh33 = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh33.position.x = -window.innerWidth/2 + 800;
	logMesh33.position.y = -20;
	row3logs.push(logMesh33);
	scene.add(logMesh33);

	var logMesh34 = new THREE.Mesh(new THREE.BoxGeometry(200, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh34.position.x = -window.innerWidth/2 + 1100;
	logMesh34.position.y = -20;
	row3logs.push(logMesh34);
	scene.add(logMesh34);

	//row 4 logs
	var logMesh41 = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh41.position.x = -window.innerWidth/2;
	logMesh41.position.y = -60;
	row4logs.push(logMesh41);
	scene.add(logMesh41);

	var logMesh42 = new THREE.Mesh(new THREE.BoxGeometry(150, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh42.position.x = -window.innerWidth/2 + 400;
	logMesh42.position.y = -60;
	row4logs.push(logMesh42);
	scene.add(logMesh42);

	var logMesh43 = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh43.position.x = -window.innerWidth/2 + 800;
	logMesh43.position.y = -60;
	row4logs.push(logMesh43);
	scene.add(logMesh43);

	var logMesh44 = new THREE.Mesh(new THREE.BoxGeometry(200, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh44.position.x = -window.innerWidth/2 + 1100;
	logMesh44.position.y = -60;
	row4logs.push(logMesh44);
	scene.add(logMesh44);

	//row 5 logs
	var logMesh51 = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh51.position.x = -window.innerWidth/2;
	logMesh51.position.y = -100;
	row5logs.push(logMesh51);
	scene.add(logMesh51);

	var logMesh52 = new THREE.Mesh(new THREE.BoxGeometry(150, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh52.position.x = -window.innerWidth/2 + 400;
	logMesh52.position.y = -100;
	row5logs.push(logMesh52);
	scene.add(logMesh52);

	var logMesh53 = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh53.position.x = -window.innerWidth/2 + 800;
	logMesh53.position.y = -100;
	row5logs.push(logMesh53);
	scene.add(logMesh53);

	var logMesh54 = new THREE.Mesh(new THREE.BoxGeometry(200, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh54.position.x = -window.innerWidth/2 + 1100;
	logMesh54.position.y = -100;
	row5logs.push(logMesh54);
	scene.add(logMesh54);

	//row 6 logs
	var logMesh61 = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh61.position.x = -window.innerWidth/2;
	logMesh61.position.y = -140;
	row6logs.push(logMesh61);
	scene.add(logMesh61);

	var logMesh62 = new THREE.Mesh(new THREE.BoxGeometry(150, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh62.position.x = -window.innerWidth/2 + 400;
	logMesh62.position.y = -140;
	row6logs.push(logMesh62);
	scene.add(logMesh62);

	var logMesh63 = new THREE.Mesh(new THREE.BoxGeometry(100, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh63.position.x = -window.innerWidth/2 + 800;
	logMesh63.position.y = -140;
	row6logs.push(logMesh63);
	scene.add(logMesh63);

	var logMesh64 = new THREE.Mesh(new THREE.BoxGeometry(200, 30, 2), new THREE.MeshBasicMaterial({ color: 0x943126, side: THREE.FrontSide }));
	logMesh64.position.x = -window.innerWidth/2 + 1100;
	logMesh64.position.y = -140;
	row6logs.push(logMesh64);
	scene.add(logMesh64);
}

function moveCars(){
	var car = row1cars[0];
    car.position.x -= 2;
    if(car.position.x < - window.innerWidth/2)
    	car.position.x = window.innerWidth/2;
    
    row1cars[1].position.x -= 2;
    if(row1cars[1].position.x < - window.innerWidth/2)
    	row1cars[1].position.x = window.innerWidth/2;

    row1cars[2].position.x -= 2;
    if(row1cars[2].position.x < - window.innerWidth/2)
    	row1cars[2].position.x = window.innerWidth/2;

    //row2
	row2cars[0].position.x += 3;
    if(row2cars[0].position.x >  window.innerWidth/2)
    	row2cars[0].position.x = -window.innerWidth/2;

    row2cars[1].position.x += 3;
    if(row2cars[1].position.x >  window.innerWidth/2)
    	row2cars[1].position.x = -window.innerWidth/2;

    row2cars[2].position.x += 3;
    if(row2cars[2].position.x >  window.innerWidth/2)
    	row2cars[2].position.x = -window.innerWidth/2;

    row2cars[3].position.x += 3;
    if(row2cars[3].position.x >  window.innerWidth/2)
    	row2cars[3].position.x = -window.innerWidth/2;

    //row3
    row3cars[0].position.x -= 3;
    if(row3cars[0].position.x < - window.innerWidth/2)
    	row3cars[0].position.x = window.innerWidth/2;

    row3cars[1].position.x -= 3;
    if(row3cars[1].position.x <  -window.innerWidth/2)
    	row3cars[1].position.x = window.innerWidth/2;

    row3cars[2].position.x -= 3;
    if(row3cars[2].position.x <  -window.innerWidth/2)
    	row3cars[2].position.x = window.innerWidth/2;

    row3cars[3].position.x -= 3;
    if(row3cars[3].position.x <  -window.innerWidth/2)
    	row3cars[3].position.x = window.innerWidth/2;

    //row4
    row4cars[0].position.x += 4;
    if(row4cars[0].position.x >  window.innerWidth/2)
    	row4cars[0].position.x = -window.innerWidth/2;

    row4cars[1].position.x += 4;
    if(row4cars[1].position.x >  window.innerWidth/2)
    	row4cars[1].position.x = -window.innerWidth/2;

    row4cars[2].position.x += 4;
    if(row4cars[2].position.x >  window.innerWidth/2)
    	row4cars[2].position.x = -window.innerWidth/2;

    row4cars[3].position.x += 4;
    if(row4cars[3].position.x >  window.innerWidth/2)
    	row4cars[3].position.x = -window.innerWidth/2;
}

function moveLogs(){
	//row1
	row1logs[0].position.x += 3;
    if(row1logs[0].position.x >  window.innerWidth/2)
    	row1logs[0].position.x = -window.innerWidth/2;

    row1logs[1].position.x += 3;
    if(row1logs[1].position.x >  window.innerWidth/2)
    	row1logs[1].position.x = -window.innerWidth/2;

    row1logs[2].position.x += 3;
    if(row1logs[2].position.x >  window.innerWidth/2)
    	row1logs[2].position.x = -window.innerWidth/2;

    row1logs[3].position.x += 3;
    if(row1logs[3].position.x >  window.innerWidth/2)
    	row1logs[3].position.x = -window.innerWidth/2;	

    //row2
	row2logs[0].position.x += 2.5;
    if(row2logs[0].position.x >  window.innerWidth/2)
    	row2logs[0].position.x = -window.innerWidth/2;

    row2logs[1].position.x += 2.5;
    if(row2logs[1].position.x >  window.innerWidth/2)
    	row2logs[1].position.x = -window.innerWidth/2;

    row2logs[2].position.x += 2.5;
    if(row2logs[2].position.x >  window.innerWidth/2)
    	row2logs[2].position.x = -window.innerWidth/2;

    row2logs[3].position.x += 2.5;
    if(row2logs[3].position.x >  window.innerWidth/2)
    	row2logs[3].position.x = -window.innerWidth/2;	

    //row3
	row3logs[0].position.x += 4;
    if(row3logs[0].position.x >  window.innerWidth/2)
    	row3logs[0].position.x = -window.innerWidth/2;

    row3logs[1].position.x += 4;
    if(row3logs[1].position.x >  window.innerWidth/2)
    	row3logs[1].position.x = -window.innerWidth/2;

    row3logs[2].position.x += 4;
    if(row3logs[2].position.x >  window.innerWidth/2)
    	row3logs[2].position.x = -window.innerWidth/2;

    row3logs[3].position.x += 4;
    if(row3logs[3].position.x >  window.innerWidth/2)
    	row3logs[3].position.x = -window.innerWidth/2;

	//row4
	row4logs[0].position.x += 2;
    if(row4logs[0].position.x >  window.innerWidth/2)
    	row4logs[0].position.x = -window.innerWidth/2;

    row4logs[1].position.x += 2;
    if(row4logs[1].position.x >  window.innerWidth/2)
    	row4logs[1].position.x = -window.innerWidth/2;

    row4logs[2].position.x += 2;
    if(row4logs[2].position.x >  window.innerWidth/2)
    	row4logs[2].position.x = -window.innerWidth/2;

    row4logs[3].position.x += 2;
    if(row4logs[3].position.x >  window.innerWidth/2)
    	row4logs[3].position.x = -window.innerWidth/2;

    //row5
	row5logs[0].position.x += 3.5;
    if(row5logs[0].position.x >  window.innerWidth/2)
    	row5logs[0].position.x = -window.innerWidth/2;

    row5logs[1].position.x += 3.5;
    if(row5logs[1].position.x >  window.innerWidth/2)
    	row5logs[1].position.x = -window.innerWidth/2;

    row5logs[2].position.x += 3.5;
    if(row5logs[2].position.x >  window.innerWidth/2)
    	row5logs[2].position.x = -window.innerWidth/2;

    row5logs[3].position.x += 3.5;
    if(row5logs[3].position.x >  window.innerWidth/2)
    	row5logs[3].position.x = -window.innerWidth/2;    

    //row6
	row6logs[0].position.x += 5;
    if(row6logs[0].position.x >  window.innerWidth/2)
    	row6logs[0].position.x = -window.innerWidth/2;

    row6logs[1].position.x += 5;
    if(row6logs[1].position.x >  window.innerWidth/2)
    	row6logs[1].position.x = -window.innerWidth/2;

    row6logs[2].position.x += 5;
    if(row6logs[2].position.x >  window.innerWidth/2)
    	row6logs[2].position.x = -window.innerWidth/2;

    row6logs[3].position.x += 5;
    if(row6logs[3].position.x >  window.innerWidth/2)
    	row6logs[3].position.x = -window.innerWidth/2;    
}

function animate() {

    requestAnimationFrame( animate );
    moveCars();
    moveLogs();
	renderer.render( scene, camera );

	var isCorrectMove = checkCorrectMove();
	if(isCorrectMove == 0){
		frogMesh.position.y = 300;
		frogMesh.position.x = 0;
		lossCount++;
		document.getElementById('lossCount').innerText = "LOSSES: "+lossCount;
	}
	else if(isCorrectMove == 2){
		frogMesh.position.y = 300;
		frogMesh.position.x = 0;
		winCount++;
		document.getElementById('winCount').innerText = "WINS: "+winCount;
	}
}

function main(){
	init();
	drawField();
	//modelCar();
	drawCars();
	drawLogs();	
	
	drawFrog();
	animate();

	
}

//code ends