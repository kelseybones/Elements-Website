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

class PeriodicTableScene {
  constructor(periodTableRows, elementTemplate, container, window, document) {
    this.container = container;
    this.camera = this.createCamera();
    this.scene = this.createScene(periodTableRows, elementTemplate);
    this.renderer = this.createRenderer(container, window);
    this.mouse = new THREE.Vector2();
    this.theta = 0;

    document.addEventListener('mousemove', function() {
      event.preventDefault();
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }.bind(this), false);

    window.addEventListener('resize', function() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }.bind(this), false);
  }

  animate() {
    let radius = 700;

    function render() {
      // rotate camera
      this.theta += 0.1;
      let thetaInRadians = THREE.Math.degToRad(this.theta);
      this.camera.position.x = radius * Math.sin(thetaInRadians);
      this.camera.position.y = radius * Math.sin(thetaInRadians);
      this.camera.position.z = radius * Math.cos(thetaInRadians);
      this.camera.lookAt(this.scene.position);
      this.camera.updateMatrixWorld();
      this.renderer.render(this.scene, this.camera);
    }

    requestAnimationFrame(this.animate.bind(this));
    render.call(this);
  }

  createCamera() {
    var camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 0, 300, 500 );
    return camera;
  }

  createScene(periodicTableRows, template) {
    var scene = new THREE.Scene();

    Mustache.parse(template);
    for (let row of periodicTableRows) {
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

    return scene;
  }

  createRenderer(container, window) {
    var renderer = new THREE.CSS3DRenderer();
    renderer.setClearColor(0xf0f0f0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    return renderer;
  }
}

var periodicTableScene;
$.getJSON("js/elements.json", function(json) {
  let periodTableRows = json.table;
  let elementTemplate = $('#element-template').html();
  periodicTableScene = new PeriodicTableScene(periodTableRows, elementTemplate, $('body')[0], window, document);
	periodicTableScene.animate();
});

jQuery(document).ready(function($){
	//open popup
	$('.circle-link').on('click', function(event){
		event.preventDefault();
		$('.popup').addClass('is-visible');
	});

//close popup
	$('.popup').on('click', function(event){
		if( $(event.target).is('.close-link') || $(event.target).is('.popup') ) {
			event.preventDefault();
			$(this).removeClass('is-visible');
		}
	});

	//close popup when clicking the esc keyboard button
	$(document).keyup(function(event){
    	if(event.which=='27'){
    		$('.popup').removeClass('is-visible');
	    }
    });
});
