var Encounters = {
  markers: [],
  updateLoopAvailable: true,
  requestLoopCancel: false,

  load: function () {
    $.getJSON('data/encounters.json?nocache=' + nocache)
      .done(function (data) {
        Encounters.set(data);
      });
    console.info('%c[Encounters] Loaded!', 'color: #bada55; background: #242424');
  },

  set: function (data) {
    $.each(data, function (_category, _markers) {
      $.each(_markers, function (key, marker) {
        Encounters.markers.push(new Marker(marker.text, marker.x, marker.y, _category, marker.type));
      });
    });

    Encounters.addToMap();
  },

  updateMarkerContent: function (marker) {
    var popupContent = marker.description;

    // TODO: Fix later. :-)
    // var shareText = `<a href="javascript:void(0)" onclick="setClipboardText('https://jeanropke.github.io/RDOMap/?m=${marker.text}')">${Language.get('map.copy_link')}</a>`;
    // var importantItem = ` | <a href="javascript:void(0)" onclick="MapBase.highlightImportantItem('${marker.text || marker.subdata}', '${marker.category}')">${Language.get('map.mark_important')}</a>`;
    // var linksElement = $('<p>').addClass('marker-popup-links').append(shareText).append(importantItem);
    var linksElement = $('<p>');
    var debugDisplayLatLng = $('<small>').text(`Text: ${marker.text} / Latitude: ${marker.lat} / Longitude: ${marker.lng}`);
    var title = Language.get(`map.${marker.category}.name`);

    if (marker.category == 'rescue') {
      title = Language.get(`map.${marker.category}.${marker.subdata}.name`);
    }

    return `<h1>${title}</h1>
        <span class="marker-content-wrapper">
        <p>${Language.get(`map.${marker.category}.desc`)}</p>
        </span>
        ${linksElement.prop('outerHTML')}
        ${Settings.isDebugEnabled ? debugDisplayLatLng.prop('outerHTML') : ''}
        `;
  },

  addToMap: function () {
    if (!Encounters.updateLoopAvailable) {
      Encounters.requestLoopCancel = true;
      setTimeout(function () {
        Encounters.addToMap();
      }, 0);
      return;
    }

    Layers.encountersLayer.clearLayers();

    Encounters.updateLoopAvailable = false;
    MapBase.yieldingLoop(
      Encounters.markers.length,
      25,
      function (i) {
        if (Encounters.requestLoopCancel) return;

        var marker = Encounters.markers[i];

        if (!enabledCategories.includes(marker.category)) return;
        var overlay = '';

        if (marker.category == 'rescue' && marker.subdata == 'mission_giver')
          overlay = `<img class="overlay" src="assets/images/icons/overlay_giver.png" alt="Mission giver">`;

        var shadow = Settings.isShadowsEnabled ? '<img class="shadow" src="./assets/images/markers-shadow.png" alt="Shadow">' : '';
        var tempMarker = L.marker([marker.lat, marker.lng], {
          opacity: Settings.markerOpacity,
          icon: L.divIcon({
            iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
            iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
            popupAnchor: [0 * Settings.markerSize, -28 * Settings.markerSize],
            html: `
              ${overlay}
              <img class="icon" src="./assets/images/icons/${marker.category}.png" alt="Icon">
              <img class="background" src="./assets/images/icons/marker_${Encounters.getIconColor(marker.category)}.png" alt="Background">
              ${shadow}
            `
          })
        });

        tempMarker.bindPopup(Encounters.updateMarkerContent(marker), { minWidth: 300, maxWidth: 400 });
        Layers.encountersLayer.addLayer(tempMarker);
      },
      function () {
        Encounters.updateLoopAvailable = true;
        Encounters.requestLoopCancel = false;
        Layers.encountersLayer.addTo(MapBase.map);
      }
    );
  },
  getIconColor: function (value) {
    switch (value) {
      case "escort":
        return "blue";
      case "defend_campsite":
        return "orange";
      case "ambush":
        return "red";
      case "hogtied_lawman":
      case "rescue":
      case "runaway_wagon":
        return "blue";
      case "animal_attack":
      case "duel":
      case "fame_seeker":
      case "kidnapped":
        return "lightgray";
      case "dog_encounter":
      case "egg_encounter":
      case "grave_robber":
      case "rival_collector":
      case "treasure_hunter":
      case "tree_map":
      case "wounded_animal":
        return "purple";
      case "moonshiner_camp":
      case "moonshiner_destroy":
      case "moonshiner_roadblock":
      case "moonshiner_sabotage":
        return "darkpurple";
      default:
        return "lightred";
    }
  }
};
