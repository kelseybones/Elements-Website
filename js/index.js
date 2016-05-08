let categoryColours = {
  'Other Nonmetals': '#503dc5',
  'Noble Gases': '#5ba9eb',
  'Alkali Metals': '#87d64c',
  'Alkaline Earth Metals': '#21fa73',
  'Metalliods': '#fde74c',
  'Halogens': '#fa7921',
  'Post-Transition Metals': '#e55934',
  'Transition Metals': '#db0000',
  'Lanthanoids': '#e53483',
  'Actinoids': '#985beb'
};

function randomNumberBetween(min, max) {
    return Math.random()*(max-min+1)+min;
}

// Move d to be adjacent to the cluster node.
function cluster(alpha, nodes) {
  var max = {};

  // Find the largest node for each cluster.
  nodes.forEach(function(d) {
    if (!(d.category in max) || (d.radius > max[d.category].radius)) {
      max[d.category] = d;
    }
  });

  return function(d) {
    var node = max[d.category],
        l,
        r,
        x,
        y,
        i = -1;

    if (node == d) return;

    x = d.x - node.x;
    y = d.y - node.y;
    l = Math.sqrt(x * x + y * y);
    r = d.radius + node.radius;
    if (l != r) {
      l = (l - r) / l * alpha;
      d.x -= x *= l;
      d.y -= y *= l;
      node.x += x;
      node.y += y;
    }
  };
}

// Resolves collisions between d and all other circles.
function collide(alpha, nodes, categoryPadding, radius, elementPadding) {
  var quadtree = d3.geom.quadtree(nodes);
  return function(d) {
    var r = d.radius + radius.domain()[1] + categoryPadding,
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + elementPadding + quad.point.radius + (d.category !== quad.point.category) * categoryPadding;
        if (l < r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2
          || x2 < nx1
          || y1 > ny2
          || y2 < ny1;
    });
  };
}

function drawElements(elements) {
  let margin = {top: 0, right: 0, bottom: 0, left: 0}
  let width = window.innerWidth - margin.left - margin.right;
  let height = window.innerHeight - margin.top - margin.bottom;

  let minRadius = 15;//Todo change so that they always fit inside the window
  let maxRadius = 20;
  let hoverRadiusMultiplier = 1.2;
  let normalOpacity = 0.7;
  let hoverOpacity = 1.0;
  let padding = 30;
  let widthOfOpenPopover = 400;
  let heightOfOpenPopover = 350;

  // Store the radius with on each element
  let radius = d3.scale.linear().range([minRadius, maxRadius]);
  for (element of elements) {
    element.radius = randomNumberBetween(minRadius, maxRadius);
  }

  // Use force to attract elements together
  let force = d3.layout.force()
      .nodes(elements)
      .size([width, height])
      .gravity(.02)
      .charge(0)
      .on("tick", tick)
      .start();

  // Add an <svg> element to the body
  let svg = d3.select("body").append("svg")
    .attr("width", "100vw")
    .attr("height", "100vh")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Associate each svg circle with each element's data
  let circle = svg.selectAll("circle")
      .data(elements)
    .enter()
      .append("circle") // Add new circles if there aren't enough yet
      .attr("r", function(d) { return d.radius; }) // Set their radius
      .style("fill", function(d) { return categoryColours[d.category]; }) // Set their colour
      .style("opacity", normalOpacity)
      .call(force.drag); // Attact them together

  circle
    .on("mouseover", function(elementData){
      d3.select(this)
        .transition()
        .attr("r", function(d) { return d.radius * hoverRadiusMultiplier; })
        .style("opacity", hoverOpacity);
    })
    .on("mouseout", function(elementData){
      d3.select(this)
        .transition()
        .attr("r", function(d) { return d.radius; })
        .style("opacity", normalOpacity);
    })
    .on("click", function(d) {
      event.preventDefault();

      // Move the popover over the circle we clicked
      let rect = this.getBoundingClientRect();
      let elementCircleBackgroundColor = d3.select(this).style("fill");

      // Load popover template
      d3.text("elements/ks3.mustache", function(error, template_html) {
        let backgroundOverlay = $('.background-overlay');
        backgroundOverlay.show();

        let popoverDiv = $('.element-popover');
        //Fill out the template with the element data
        popoverDiv.html(Mustache.render(template_html, d));

        // Move the popover exact over the clicked element circle
        popoverDiv.offset({ top: rect.top, left: rect.left });
        // Make the popover the same size
        popoverDiv.width(rect.width);
        popoverDiv.height(rect.height);
        // Make the popover the same colour
        popoverDiv.css('background-color', elementCircleBackgroundColor);
        // Show the popover as a circle that turns into a square over the clicked element
        popoverDiv.addClass('open');

        // Animate the popover to the center of the screen
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

  resize();
  d3.select(window).on("resize", resize);

  function tick(e) {
    // For each step of the animation loop round all circles
    circle
        .each(cluster(10 * e.alpha * e.alpha, elements)) // Drag the circles together
        .each(collide(.5, elements, padding, radius, 5)) // Stop the cicles from overlapping
        .attr("cx", function(d) { return d.x; }) // Set the new x
        .attr("cy", function(d) { return d.y; }); // Set the new y
  }

  function resize() {
    width = window.innerWidth, height = window.innerHeight;
    svg.attr("width", width).attr("height", height);
    force.size([width, height]).resume();
  }
}

function combineTableLanthanoidsActinoids(table, lanthanoids, actinoids) {
  var combined = [];
  for (row of table) { combined = combined.concat(row.elements); }
  combined = combined.concat(lanthanoids);
  combined = combined.concat(actinoids);
  return combined;
}

d3.json("js/elements.json", function(json) {
  let elements = combineTableLanthanoidsActinoids(json.table, json.lanthanoids, json.actinoids);
  drawElements(elements);
});

let backgroundOverlay = $('.background-overlay');
backgroundOverlay.on('click', function() {
  $(this).hide();
  $('.element-popover').removeClass('open');//TODO make nice
});
