let categoryColours = {
  'Other Nonmetals': '#503dc5',
  'Noble Gases': '#56a5e9',
  'Alkali Metals': '#538e28',
  'Alkaline Earth Metals': '#21fa73',
  'Metalliods': '#fde74c',
  'Halogens': '#ff7f02',
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

    if (node == d || node == undefined) return;

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

let margin = {top: 0, right: 0, bottom: 0, left: 0};
let width = window.innerWidth - margin.left - margin.right;
let height = window.innerHeight - margin.top - margin.bottom;

let minRadius = 15;//Todo change so that they always fit inside the window
let maxRadius = 25;
let hoverRadiusMultiplier = 1.2;
let normalOpacity = 0.7;
let hoverOpacity = 1.0;
let padding = 30;
let widthOfOpenPopover = 800;
let heightOfOpenPopover = 500;


// Add an <svg> element to the body
let svg = d3.select("#container")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function drawElements(elements) {
  // Store the radius with on each element
  let radius = d3.scale.linear().range([minRadius, maxRadius]);

  // Use force to attract elements together
  let force = d3.layout.force()
      .nodes(elements)
      .size([width, height])
      .gravity(.02)
      .charge(0)
      .on("tick", tick)
      .start();

  // Associate each svg circle with each element's data
  let Gs = svg.selectAll("g")
      .data(elements)

  Gs.selectAll("*").remove();

  // Add new elements for new data
  // let circle =
  Gs.enter()
    .append("g")
    // .append("circle")
    // .call(force.drag) // Attact them together

  // Remove old elements when there is no data for them
  Gs.exit()
    .transition()
    .ease("quad")
    .style("opacity", 0)
    .remove()

  // Update existing elements on refresh
  Gs
    .call(force.drag) // Attact them together

  let circle = Gs
      .append("circle") // Add new circles if there aren't enough yet
  circle
      .attr("r", function(d) { return d.radius; }) // Set their radius
      .style("fill", function(d) { return categoryColours[d.category]; }) // Set their colour
      .style("opacity", 0)
      .transition()
      .ease("quad")
      .style("opacity", normalOpacity)

  let text = Gs
    .append("text")
    .attr("text-anchor", "middle")
    // .attr("dx", function(d){ return -7; })
    .attr("dy", function(d){ return 3; })
    .text(function(d){ return d.small; })

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
      var templateFile = "elements/ks3.mustache";
      if (d.name === "Neon") {
        templateFile = "elements/ug.mustache";
      }
      d3.text(templateFile, function(error, templateHtml) {
        function showPopover(elementDetails) {
          let backgroundOverlay = $('.background-overlay');
          backgroundOverlay.show();

          let popoverDiv = $('.element-popover');
          //Fill out the template with the element data
          popoverDiv.append(Mustache.render(templateHtml, elementDetails));

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
        }

        if (d.details === null || d.details === undefined || d.details === "") {
          showPopover(d);
        } else {
          d3.json(d.details, function(error, elementDetails) {
            showPopover(elementDetails);
          });
        }
      });
    });

  resize();
  d3.select(window).on("resize", resize);

  function tick(e) {
    // For each step of the animation loop round all circles
    Gs
        .each(cluster(10 * e.alpha * e.alpha, elements)) // Drag the circles together
        .each(collide(.5, elements, padding, radius, 5)) // Stop the cicles from overlapping
        // .attr("cx", function(d) { return d.x; }) // Set the new x
        // .attr("cy", function(d) { return d.y; }); // Set the new y
        .attr("transform", function(d) {
          d.x = Math.max(d.radius, Math.min(width - d.radius, d.x));
          d.y = Math.max(d.radius, Math.min(height - d.radius, d.y));
          return "translate(" + d.x + "," + d.y + ")";
        })
  }

  function resize() {
    // width = window.innerWidth, height = window.innerHeight;
    width = $('#container').width();
    height = $('#container').height();
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
  for (element of elements) {
    element.radius = randomNumberBetween(minRadius, maxRadius);
  }

  drawElements(elements);

  var lastSearch = "";

  $('.search-box').keyup(function() {
    let filter = $(this).val().toLowerCase();
    if (filter === lastSearch) {
      return;
    } else {
      lastSearch = filter;
    }

    if (filter == "") {
      drawElements(elements);
    } else {
      let filteredElements = findElementsByNameOrSymbol(filter, elements);
      drawElements(filteredElements);
    }
  });
});

let backgroundOverlay = $('.background-overlay');
backgroundOverlay.on('click', function() {
  $(this).hide();
  $('.element-popover').removeClass('open');//TODO make nice
  $('.element-popover .content').remove();
});

let closeButton = $('.close-link');
closeButton.on('click', function() {
  backgroundOverlay.hide();
  $('.element-popover').removeClass('open');//TODO make nice
  $('.element-popover .content').remove();
});

function findElementsByNameOrSymbol(name, elements) {
  var foundElements = [];
  // Loop round each element
  for (let element of elements) {
    //Can we find anything that starts with our searched text
    if (element.name.toLowerCase().indexOf(name) === 0 || element.small.toLowerCase().indexOf(name) === 0) {
      foundElements.push(element);
    }
  }
  return foundElements;
}
