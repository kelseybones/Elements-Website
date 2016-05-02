function findElementsByName(name, tableRows) {
  var foundElements = [];
  // Loop round each row in the table
  for (let row of tableRows) {
    // Loop round each element in the row
    for (let element of row.elements) {
      if (element.name.indexOf(name) > -1) {
        foundElements.push(element);
      }
    }
  }

  return foundElements;
}


function populateCanvas() {
  $.getJSON("js/elements.json", function(json) {
    let periodTableRows = json.table;

    let template = $('#element-template').html();
    Mustache.parse(template);

    for (let row of periodTableRows) {
      for (let element of row.elements) {
        let rendered = Mustache.render(template, element);
        $('.main-container').append(rendered);
      }
    }
  });
}

// populateCanvas();




var container, stats;
			var camera, scene, renderer;
			var raycaster;
			var mouse;
			var PI2 = Math.PI * 2;
			var programFill = function ( context ) {
				context.beginPath();
				context.arc( 0, 0, 0.5, 0, PI2, true );
				context.fill();
			};
			var programStroke = function ( context ) {
				context.lineWidth = 0.025;
				context.beginPath();
				context.arc( 0, 0, 0.5, 0, PI2, true );
				context.stroke();
			};
			var INTERSECTED;

$.getJSON("js/elements.json", function(json) {
  let periodTableRows = json.table;
	init(periodTableRows);
	animate();
});

			function init(periodTableRows) {
				container = document.createElement( 'div' );
				document.body.appendChild( container );
				camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
				camera.position.set( 0, 300, 500 );
				scene = new THREE.Scene();

        let template = $('#element-template').html();
        Mustache.parse(template);

        for (let row of periodTableRows) {
          for (let element of row.elements) {
            let rendered = Mustache.render(template, element);

            var particle = new THREE.CSS3DObject( $(rendered)[0] );
            particle.position.x = Math.random() * 800 - 400;
  					particle.position.y = Math.random() * 800 - 400;
  					particle.position.z = Math.random() * 800 - 400;
  					particle.scale.x = particle.scale.y = 0.5;//Math.random() * 20 + 20;
            scene.add( particle );
          }
        }

				raycaster = new THREE.Raycaster();
				mouse = new THREE.Vector2();
				renderer = new THREE.CSS3DRenderer();
				renderer.setClearColor( 0xf0f0f0 );
				// renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );
				// stats = new Stats();
				// container.appendChild( stats.dom );
				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				//
				window.addEventListener( 'resize', onWindowResize, false );
			}
			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
			}
			function onDocumentMouseMove( event ) {
				event.preventDefault();
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
			}
			//
			function animate() {
				requestAnimationFrame( animate );
				render();
			}
			var radius = 700;
			var theta = 0;
			function render() {
				// rotate camera
				// theta += 0.1;
				camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
				camera.position.y = radius * Math.sin( THREE.Math.degToRad( theta ) );
				camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );
				camera.lookAt( scene.position );
				camera.updateMatrixWorld();
				// find intersections
				// raycaster.setFromCamera( mouse, camera );
				// var intersects = raycaster.intersectObjects( scene.children );
				// if ( intersects.length > 0 ) {
				// 	if ( INTERSECTED != intersects[ 0 ].object ) {
				// 		if ( INTERSECTED ) INTERSECTED.material.program = programStroke;
				// 		INTERSECTED = intersects[ 0 ].object;
				// 		INTERSECTED.material.program = programFill;
				// 	}
				// } else {
				// 	if ( INTERSECTED ) INTERSECTED.material.program = programStroke;
				// 	INTERSECTED = null;
				// }
				renderer.render( scene, camera );
			}
