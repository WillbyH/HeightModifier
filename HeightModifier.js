// HeightModifier.js By Willby an OpenRCT2 Plugin

var showing = true;
var filter = 0;
var remove = false;

var downCoord = void 0;
var currentCoord = void 0;

var left, right, top, bottom;

var computer_close = false;
var area_selected = false;
var getting_selection = false;

function selectTheMap() { // Display Selection
    var left = Math.min(downCoord.x, currentCoord.x);
    var right = Math.max(downCoord.x, currentCoord.x);
    var top = Math.min(downCoord.y, currentCoord.y);
    var bottom = Math.max(downCoord.y, currentCoord.y);
    ui.tileSelection.range = {
        leftTop: { x: left, y: top },
        rightBottom: { x: right, y: bottom }
    };
}

function finishSelection() { // Safe the final section area
  left = Math.floor(Math.min(downCoord.x, currentCoord.x) / 32);
  right = Math.floor(Math.max(downCoord.x, currentCoord.x) / 32);
  top = Math.floor(Math.min(downCoord.y, currentCoord.y) / 32);
  bottom = Math.floor(Math.max(downCoord.y, currentCoord.y) / 32);
  area_selected = true;
}

function affect_selection(moveUp) {
  for (var x = left; x <= right; x++) {
    for (var y = top; y <= bottom; y++) {
      var tile = map.getTile(x, y);

      for (var i = 0; i < tile.numElements; i++) {
        var element = tile.getElement(i);
        if (filters[filter]=="all"&&element.type!="surface") {
          if (moveUp) {
            element.baseHeight++;
          } else {
            element.baseHeight--;
          }
        } else {
          if (element.type==filters[filter]) {
            if (moveUp) {
              element.baseHeight++;
            } else {
              element.baseHeight--;
            }
          }
        }
      }
    }
  }
}

var filters = ["all","footpath","small_scenery","large_scenery","wall","track","surface"];

function hm_window() {
  widgets = []
  var height = 0;
  if (area_selected) {
    widgets.push({
        type: 'label',
        name: 'label-description',
        x: 3,
        y: 20,
        width: 300,
        height: 60,
        text: "Select an option below to affect"
    });
    widgets.push({
        type: 'label',
        name: 'label-description',
        x: 3,
        y: 30,
        width: 300,
        height: 60,
        text: "the selected area."
    });
    widgets.push({
        type: 'button',
        name: "select-area-button",
        x: 10,
        y: 65,
        width: 90,
        height: 15,
        text: "Move Up",
        onClick: function onClick() {
          affect_selection(true);
        }
    });
    widgets.push({
        type: 'button',
        name: "select-area-button",
        x: 120,
        y: 65,
        width: 90,
        height: 15,
        text: "Move Down",
        onClick: function onClick() {
          affect_selection(false);
        }
    });
    height = 90;
  } else {
    widgets.push({
        type: 'label',
        name: 'label-description',
        x: 3,
        y: 20,
        width: 300,
        height: 60,
        text: "Drag area to be selected."
    });
    height = 70;
  }
  widgets.push({
      type: "dropdown",
      x: 5,
      y: 45,
      width: 210,
      height: 15,
      name: "filter_dropdown",
      text: "",
      items: ["All", "Paths", "Small Scenery", "Large Scenery", "Wall", "Tracks", "Surface"],
      selectedIndex: filter,
      onChange: function onChange(e) {
          filter = e;
      }
  })
  window = ui.openWindow({
      classification: 'park',
      title: "Height Modifier",
      width: 220,
      height: height,
      x: 20,
      y: 50,
      colours: [22,22],
      widgets: widgets,
      onClose: function onClose() { // Stop selection tool when the window closes
        window = null;
        if (ui.tool && ui.tool.id == "height-modifier-tool" && computer_close == false) {
          area_selected = false;
          ui.tool.cancel();
        }
        computer_close = false;
      }
  });
}


function main() {
  ui.registerMenuItem("Height Modifier", function() {
    hm_window()
    getting_selection = true;
    ui.activateTool({ // Create tool for selecting area
        id: "height-modifier-tool",
        cursor: "cross_hair",
        onStart: function onStart(e) {
          ui.mainViewport.visibilityFlags |= 1 << 7;
        },
        onDown: function onDown(e) {
          if (e.mapCoords.x === 0 && e.mapCoords.y === 0) {
            return;
          }
          getting_selection = true;
          downCoord = e.mapCoords;
          currentCoord = e.mapCoords;
        },
        onMove: function onMove(e) {
          if (e.mapCoords.x === 0 && e.mapCoords.y === 0) {
            return;
          }
          if (e.isDown) {
            if (getting_selection) {
              currentCoord = e.mapCoords;
            }
            selectTheMap();
          } else {
            if (getting_selection) {
              downCoord = e.mapCoords;
              currentCoord = e.mapCoords;
            }
            selectTheMap();
          }
        },
        onUp: function onUp(e) {
          getting_selection = false;
          finishSelection();
          computer_close = true;
          window.close();
          hm_window()
        },
        onFinish: function onFinish() {
          ui.mainViewport.visibilityFlags &= ~(1 << 7);
          if (window != null) window.close();
        }
    });

  });
}

registerPlugin({
    name: 'Height Modifier',
    version: '1.0.1',
    licence: 'MIT',
    authors: ['Willby'],
    type: 'local',
    main: main
});
