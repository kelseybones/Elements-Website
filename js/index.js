let categoryColours = {
  'Other Nonmetals': '#503dc5',
  'Noble Gases': '#5ba9eb',
  'Alkali Metals': '#87d64c',
  'Alkaline Earth Metals': '#21fa73',
  'Metalliods': '#fde74c',
  'Halogens': '#fa7921',
  'Post-Transition Metals': '#e55934',
  'Transition Metals': '#e55934',
  '': '#db0000',
  'Lanthanoids': '#e53483',
  'Actinoids': '#985beb'
};

function randomNumberBetween(min, max) {
    return Math.random()*(max-min+1)+min;
}

function toScreenPosition(obj, camera, renderer) {
    var vector = new THREE.Vector3();

    var widthHalf = 0.5 * renderer.getSize().width;
    var heightHalf = 0.5 * renderer.getSize().height;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;

    return {
        x: vector.x,
        y: vector.y
    };
};

class PeriodicTableScene {
  constructor(table, lanthanoids, actinoids, elementTemplate, container, window, document) {
    this.container = container;
    this.camera = this.createCamera();
    this.renderer = this.createRenderer(container, window);
    this.scene = this.createScene(table, lanthanoids, actinoids, elementTemplate);
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
      this.theta += 0.0;
      let thetaInRadians = THREE.Math.degToRad(this.theta);
      this.camera.position.x = radius * Math.sin(thetaInRadians);
      this.camera.position.y = radius * Math.sin(thetaInRadians);
      this.camera.position.z = radius * Math.cos(thetaInRadians);
      this.camera.lookAt(this.scene.position);
      this.camera.updateMatrixWorld();
      this.renderer.render(this.scene, this.camera);
    }

    // requestAnimationFrame(this.animate.bind(this));
    render.call(this);
  }

  createCamera() {
    let viewAngle = 70;
    let aspectRatio = window.innerWidth / window.innerHeight;
    let near = 1;
    let far = 1000;
    let camera = new THREE.PerspectiveCamera(viewAngle, aspectRatio, near, far);
    camera.position.z = 400;
    return camera;
  }

  createScene(table, lanthanoids, actinoids, template) {
    var scene = new THREE.Scene();
    Mustache.parse(template);

    let particle = new THREE.CSS3DObject($('<div class="element" style="background-color:red;">Test</div>')[0]);
    particle.position.x = -(window.innerWidth / 2)
    particle.position.y = 0;
    particle.position.z = 0;//Math.random() * 800 - 400;
    particle.scale.x = particle.scale.y = 1;//Math.random() * 20 + 20;
    scene.add(particle);

    let particle2 = new THREE.CSS3DObject($('<div class="element" style="background-color:red;">Test</div>')[0]);
    particle2.position.x = (window.innerWidth / 2)
    particle2.position.y = 0;
    particle2.position.z = 0;//Math.random() * 800 - 400;
    particle2.scale.x = particle2.scale.y = 1;//Math.random() * 20 + 20;
    scene.add(particle2);

    console.log(toScreenPosition(particle, this.camera, this.renderer));


    function addElementToScene(element) {
      // let renderedElement = $(Mustache.render(template, element));
      // renderedElement.css('background-color', categoryColours[element.category]);
      //
      // if (element.category === undefined) {
      //   console.log(element);
      // }
      //
      // let particle = new THREE.CSS3DObject(renderedElement[0]);
      // particle.position.x = randomNumberBetween(-(window.innerWidth / 2), window.innerWidth / 2);
      // particle.position.y = randomNumberBetween(-(window.innerHeight / 2), window.innerHeight / 2);
      // particle.position.z = 0;//Math.random() * 800 - 400;
      // particle.scale.x = particle.scale.y = 1;//Math.random() * 20 + 20;
      // scene.add(particle);
    }

    for (let row of table) {
      for (let element of row.elements) {
        addElementToScene(element);
      }
    }

    for (let element of lanthanoids) {
      addElementToScene(element);
    }

    for (let element of actinoids) {
      addElementToScene(element);
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
jQuery(document).ready(function($){
  $.getJSON("js/elements.json", function(json) {
    let table = json.table;
    let lanthanoids = json.lanthanoids;
    let actinoids = json.actinoids;
    let elementTemplate = $('#element-template').html();
    periodicTableScene = new PeriodicTableScene(table, lanthanoids, actinoids, elementTemplate, $('.main-container')[0], window, document);
  	periodicTableScene.animate();
  });

	//open popup
	$('.main-container').on('click', '.element', function(event) {
		event.preventDefault();
    let rect = this.getBoundingClientRect();
    let popoverDiv = $('.element-popover');
    popoverDiv.offset({ top: rect.top, left: rect.left });
    popoverDiv.width(rect.width);
    popoverDiv.height(rect.height);
    popoverDiv.css('background-color', $(this).css('background-color'));
    // Show the popover as a circle that turns into a square over the clicked element
    popoverDiv.toggleClass('open');

    let widthOfOpenPopover = 300;
    let heightOfOpenPopover = 200;

    // Move the popover to the center of the screen
    var top = ($(window).height() - heightOfOpenPopover) / 2;
    var left = ($(window).width() - widthOfOpenPopover) / 2;

    popoverDiv.animate({
      margin:0,
      top: (top > 0 ? top : 0)+'px',
      left: (left > 0 ? left : 0)+'px',
      width: widthOfOpenPopover+'px',
      height: heightOfOpenPopover+'px'
    });
	});
});


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
