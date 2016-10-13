$(document).ready(function () {






    function styleInfoWindow(infowindow) {

        google.maps.event.addListener(infowindow, 'domready', function () {

            // Reference to the DIV that wraps the bottom of infowindow
            var iwOuter = $('.gm-style-iw');

            /* Since this div is in a position prior to .gm-div style-iw.
             * We use jQuery and create a iwBackground variable,
             * and took advantage of the existing reference .gm-style-iw for the previous div with .prev().
             */
            var iwBackground = iwOuter.prev();

            // Removes background shadow DIV
            iwBackground.children(':nth-child(2)').css({
                'display': 'none'
            });

            // Removes white background DIV
            iwBackground.children(':nth-child(4)').css({
                'display': 'none'
            });

            // Moves the infowindow 115px to the right.
            iwOuter.parent().parent().css({
                left: '115px'
            });

            // Moves the shadow of the arrow 76px to the left margin.
            iwBackground.children(':nth-child(1)').attr('style', function (i, s) {
                return s + 'left: 76px !important;'
            });

            // Moves the arrow 76px to the left margin.
            iwBackground.children(':nth-child(3)').attr('style', function (i, s) {
                return s + 'left: 76px !important;'
            });

            // Changes the desired tail shadow color.
            iwBackground.children(':nth-child(3)').find('div').children().css({
                'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px',
                'z-index': '1'
            });

            // Reference to the div that groups the close button elements.
            var iwCloseBtn = iwOuter.next();

            // Apply the desired effect to the close button
            iwCloseBtn.css({
                opacity: '1',
                right: '38px',
                top: '3px',
             /*   border: '7px solid #48b5e9',*/
                'border-radius': '13px',
                'box-shadow': '0 0 5px #3990B9'
            });

            // If the content of infowindow not exceed the set maximum height, then the gradient is removed.
            if ($('.iw-content').height() < 140) {
                $('.iw-bottom-gradient').css({
                    display: 'none'
                });
            }

            // The API automatically applies 0.7 opacity to the button after the mouseout event. This function reverses this event to the desired value.
            iwCloseBtn.mouseout(function () {
                $(this).css({
                    opacity: '1'
                });
            });
        });
    }


    var data = []
    var markers = [];
    var center = new google.maps.LatLng(37.75695869677305, -122.45282226562499);
    var options = {
        'zoom': 12,
        'center': center,
        styles: [
            {
                stylers: [{
                    visibility: 'simplified'
                }]
            },
            {
                elementType: 'labels',
                stylers: [{
                    visibility: 'off'
                }]
            }
		],
        'mapTypeId': google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("map"), options);


    map.addListener('center_changed', function () {
        // 3 seconds after the center of the map has changed, pan back to the
        // marker.
        console.log(map)
    });

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": app_config.backendurl+"/dashboard",
        "method": "GET"
    }



    $.ajax(settings).done(function (response) {

        var truckType = _.remove(_.map(_.uniqBy(response, 'FacilityType'), "FacilityType"), function (n) {
            return n != "";
        });
        for (i = 0; i < truckType.length; i++) {
            $("#trucktype").append("<option value=" + truckType[i] + ">" + truckType[i] + "</option>")

        }
        console.log(truckType)




        for (var i = 0; i < response.length; i++) {
            var latLng = new google.maps.LatLng(response[i].Latitude,
                response[i].Longitude);
            var marker = new Marker({
                'position': latLng,
                'data': response[i],
                truckType: response[i].FacilityType,
                icon: {
                    path: MAP_PIN,
                    fillColor: '#6331AE',
                    fillOpacity: 1,
                    strokeColor: '',
                    strokeWeight: 0
                },
                map_icon_label: '<span class="map-icon map-icon-moving-company"></span>'
            });




            marker.addListener('click', function () {

                var contentString = '<div id="iw-container">' +
                    '<div class="iw-title">' + this.data.Applicant + '</div>' +
                    '<div class="iw-content">' +
                    '<div class="iw-subTitle">Food Item</div>' +
                    '<p>' + this.data.FoodItems + '</p>' +
                    '<div class="iw-subTitle">Facility Type</div>' +
                    '<p>' + this.data.FacilityType + '</p>' +
                     '<div class="iw-subTitle">Location</div>' +
                    '<p>' + this.data.LocationDescription + '</p>' +
                    '</div>' +
                    '<div class="iw-bottom-gradient"></div>' +
                    '</div>';

                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                infowindow.open(map, this);
                styleInfoWindow(infowindow)
            });



            // *



            markers.push(marker);
        }
        var markerCluster = new MarkerClusterer(map, markers, {
            imagePath: 'app/img/m'
        });


        var input = document.getElementById('pac-input');
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);

        autocomplete.addListener('place_changed', function () {

            marker.setVisible(false);
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                // window.alert("Autocomplete's returned place contains no geometry");
                return;
            }

            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17); // Why 17? Because it looks good.
            }


            var address = '';
            if (place.address_components) {
                address = [
                    (place.address_components[0] && place.address_components[0].short_name || ''),
                    (place.address_components[1] && place.address_components[1].short_name || ''),
                    (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
            }

        });



    });







})