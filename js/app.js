/*
*
* THE MODEL
*
* A list of whisky distilleries on the island of Islay.
*
*/
var model = [
  {
    name:"Laphroaig",
    wikiName: "Laphroaig distillery",
    meaning: "Beautiful hollow by the broad bay",
    flavour: "Sweet, spicy and very smoky",
    pos: {lat: 55.630210, lng: -6.153477},
  },
  {
    name:"Lagavulin distillery",
    wikiName: "Lagavulin distillery",
    meaning: "The hollow where the mill is",
    flavour: "Rich, sweet and very smokey",
    pos: {lat: 55.636412, lng: -6.126869},
  },
  {
    name:"Ardbeg",
    wikiName: "Ardbeg distillery",
    meaning: "Small headland",
    flavour: "Peaty, medicinal, salty, dry",
    pos: {lat: 55.640867, lng: -6.108166},
  },
  {
    name:"Bowmore",
    wikiName: "Bowmore distillery",
    meaning: "Great sea reef or sea rock",
    flavour: "Smoky and floral in style",
    pos: {lat: 55.758693, lng: -6.291493},
  },
  {
    name:"Bruichladdich",
    wikiName: "Bruichladdich distillery",
    meaning: "Bank on the shore",
    flavour: "Large spectrum of peated and unpeated whiskies",
    pos: {lat: 55.765647, lng: -6.360844},
  },
  {
    name:"Bunnahabhain",
    wikiName: "Bunnahabhain distillery",
    meaning: "Mouth of the river",
    flavour: "Sweet and lightly fruity and sometimes a whiff of peat smoke",
    pos: {lat: 55.884444, lng: -6.146610},
  },
  {
    name:"Caol Ila",
    wikiName: "Caol Ila distillery",
    meaning: "The straight of Islay",
    flavour: "Smoky, sweet and lightly fruity",
    pos: {lat: 55.854280, lng: -6.109382},
  },
  {
    name:"Kilchoman",
    wikiName: "Kilchoman distillery",
    meaning: "St. Comman's church",
    flavour: "A rich spirit, sweet, fruity and lightly smoky",
    pos: {lat: 55.787041, lng: -6.430006},
  }
];

// Declar the map and infoWindow variables to be used later on
var map;
var infoWindow = new google.maps.InfoWindow({
      content: ''
    });

// The function to create observable distillery objects based on the data from
// the model array
var Distillery = function(data) {

  this.name = ko.observable(data.name);
  this.wikiName = ko.observable(data.wikiName);
  this.meaning = ko.observable(data.meaning);
  this.flavour = ko.observable(data.flavour);
  this.pos = ko.observable(data.pos);

  var marker = new google.maps.Marker({
    position: this.pos(),
    title: this.name(),
    map: map
  });

  this.marker = ko.observable(marker);
};



/*
*
* THE VIEWMODEL
*
*/
var viewModel = function() {
  var self = this;
  // Here is where we will store the distilleries that will be displayed on
  // the page
  this.distilleries = ko.observableArray([]);

  model.forEach(function(distilleryItem) {
    self.distilleries.push(new Distillery(distilleryItem));
  });

  // Initialise the Google Map, centered on the island of Islay (UK)
  this.initializeMap = function() {
    var mapOptions = {
      draggable: false,
      center: {lat: 55.758357, lng: -6.178539},
      disableDefaultUI: false,
      zoom: 10
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
  };

  // Add the markers on the map for each item in the observable distilleries array
  this.addMarkers = function() {
    this.distilleries().forEach(function(item) {
      item.marker(
        new google.maps.Marker({
          position: item.pos(),
          title: item.name(),
          map: map
        })
      );
      // We want to make them drop onto the map when first created
      item.marker().setAnimation(google.maps.Animation.DROP);
    });
  };

  // InfoWindow to appear upon click. This is used when we initialise the map but
  // also after each search to make sure that the pins remain clickable
  this.makeClickable = function() {
    this.distilleries().forEach(function(item) {
      google.maps.event.addListener(item.marker(), 'click', function() {

        var url = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + item.wikiName() + '&format=json&callback=wikiCallback';

        $.ajax({
          url: url,
          dataType: "jsonp",
          success: function (response) {
            var articleList = response[1];
            for (var i = 0; i < articleList.length; i++) {
              var articleStr = articleList[i];
              var url = 'http://en.wikipedia.org/wiki/' + articleStr;
              var content = '<a href="' + url + '">' + articleStr + '</a>';
              infoWindow.setContent(content);
              infoWindow.open(map, item.marker());
              item.marker().setAnimation(google.maps.Animation.BOUNCE);
            }
          }
        });
        setTimeout(function() {
          item.marker().setAnimation(null);
        }, 2100);
      });
    }); // end of forEach()
  }; // end of makeClickable()

  // Our search string, bound to the value of the search box on the page
  this.query = ko.observable('');


  this.search = function(value) {
    // Set map on all markers to 'null' so that they disappear from the map
    self.distilleries().forEach(function(distillery) {
      distillery.marker().setMap(null);
    });

    // Remove all distilleries from the observable array (but not
    // from the initial model array)
    self.distilleries([]);

    // Loop through each place in the initial model array and add the
    // matching ones back into the observable array and
    // add make all markers clickable again
    for(var i = 0; i < model.length; i++) {
      if(model[i].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        self.distilleries.push(new Distillery(model[i]));
      }
    }
    self.makeClickable();
  };


  // Run the search function whenever the value of query changes
  this.query.subscribe(self.search);

  // Initialise the map, the markers and make them clickable
  this.initializeMap();
  this.addMarkers();
  this.makeClickable();

}; // End of viewModel()

// Each time you click on the name of a distillery, make its marker bounce
// Bind this function to the <li> items on the page
function activateMarker(item) {
  var url = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + item.wikiName() + '&format=json&callback=wikiCallback';

  $.ajax({
    url: url,
    dataType: "jsonp",
    success: function (response) {
      var articleList = response[1];
      for (var i = 0; i < articleList.length; i++) {
        var articleStr = articleList[i];
        var url = 'http://en.wikipedia.org/wiki/' + articleStr;
        var content = '<a href="' + url + '">' + articleStr + '</a>';
        infoWindow.setContent(content);
        infoWindow.open(map, item.marker());
        item.marker().setAnimation(google.maps.Animation.BOUNCE);
      }
    }
  });
  setTimeout(function() {
    item.marker().setAnimation(null);
  }, 2100);
}

ko.applyBindings(new viewModel());