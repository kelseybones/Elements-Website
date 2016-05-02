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

populateCanvas();
