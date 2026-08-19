const map = new maplibregl.Map({
    container: 'map',
    style:
        'https://api.maptiler.com/maps/470d6019-657f-4f7d-a018-6ec6ae0d0093/style.json?key=4xF6FrxAyNgBUQ4n4bUN',
    center: [-75.71437697181956,45.42175454734248],
    zoom: 13
  });


//Ottawa Sites Layer
  {
  map.on('load', () => {
    // Vacant Sites Marker Icon
    map.loadImage(
        'https://img.icons8.com/?size=100&id=7880&format=png&color=000000',
        (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker', image);
       
            //Adding Gatineau AR Sites
            map.addSource('o_sites', {
                'type': 'geojson',
                'data': {
                    "type": "FeatureCollection",
                    "features": [
                   {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.6910901051176,45.4345409376835 ]
                     },
                     "properties": {
                     "Project":"Fire Station No.5",
                     "Address":"241 Bruyere St",
                     "Year_of_Construction":1937,
                     "Construction_Team": "W.E. Nofke",
                     "Year_of_Adaptive_Reuse": "Unknown",
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "Yes",
                     "Designation": "Recognized Federal Heritage Building",
                     "Original_Typology":"Institutional",
                     "New_Typology":"Residential",
                     "Construction_System": "Brick & Block",
                     "Occupancy": "Occupied",
                     "Ownership":"Public",
                    }
                    },


                 ]
                 }
            });
         
            // Add a symbol layer for Ottawa AR Sites
            map.addLayer({
                'id': 'o_sites',
                'type': 'symbol',
                'source': 'o_sites',
                'layout': {
                    'icon-image': 'custom-marker',
                    'icon-size': 0.2
                }
            });
        }
    )
  });


  };


//Gatineau Sites Layer
  {
  map.on('load', () => {
    // Vacant Sites Marker Icon
    map.loadImage(
        'https://img.icons8.com/?size=100&id=7880&format=png&color=000000',
        (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker', image);
       
            //Adding Gatineau AR Sites
            map.addSource('g_sites', {
                'type': 'geojson',
                'data': {
                    "type": "FeatureCollection",
                    "features": [
                   {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.7450480942838,45.420219035158645 ]
                     },
                     "properties": {
                     "Project":"Votre Le Marché Local",
                     "Address":"50 Rue Bégin",
                     "Year_of_Construction":1960,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": "Unknown",
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "No",
                     "Designation": "None",
                     "Original_Typology":"Residential",
                     "New_Typology":"Mixed Use",
                     "Construction_System": "Brick & Block",
                     "Occupancy": "Occupied",
                     "Ownership":"Private",
                    }
                    },


                   {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.74541504345939,45.419639397141054 ]
                      },
                     "properties": {
                     "Project":"Ecole Duhaut A.D 1914",
                     "Address":"43 Rue Bégin",
                     "Year_of_Construction":1914,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": "Unknown",
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "Yes",
                     "Designation": "Recognized by répertoire du patrimoine culturel du Québec",
                     "Original_Typology":"Institutional",
                     "New_Typology":"Mixed Use",
                     "Construction_System": "Brick & Block",
                     "Occupancy": "Occupied",
                     "Ownership":"Public",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.74743519449689,45.42117387535778 ]
                      },
                     "properties": {
                     "Project":"UNDOM",
                     "Address":"417 Alexandre-Taché Blvd",
                     "Year_of_Construction": "Unknown",
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": "Unknown",
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "No",
                     "Designation": "None",
                     "Original_Typology":"Residential",
                     "New_Typology":"Commercial",
                     "Construction_System": "Brick & Block",
                     "Occupancy": "Intermittent Occupancy",
                     "Ownership":"Private",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.74629071556605,45.42144544079564 ]
                      },
                     "properties": {
                     "Project":"Charcuterie IRINA A&F",
                     "Address":"399 Alexandre-Taché Blvd",
                     "Year_of_Construction": 1870,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": "Unknown",
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "No",
                     "Designation": "None",
                     "Original_Typology":"Residential",
                     "New_Typology":"Commercial",
                     "Construction_System": "Wood Frame",
                     "Occupancy": "Intermittent Occupancy",
                     "Ownership":"Private",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.72399666306127,45.42679349790822 ]
                      },
                     "properties": {
                     "Project":"Bronzage Aloha",
                     "Address":"62 Rue Montcalm",
                     "Year_of_Construction": 1920,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": 2009,
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "Yes",
                     "Designation": "Recognized by répertoire du patrimoine culturel du Québec",
                     "Original_Typology":"Residential",
                     "New_Typology":"Commercial",
                     "Construction_System": "Brick & Block",
                     "Occupancy": "Intermittent Occupancy",
                     "Ownership":"Private",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.7231237900286,45.42779453103483 ]
                      },
                     "properties": {
                     "Project":"Garderie les petits aventuriers",
                     "Address":"15 Rue Sainte-Bernadette",
                     "Year_of_Construction": 1965,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": 2021,
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "Yes",
                     "Designation": "Recognized by répertoire du patrimoine culturel du Québec",
                     "Original_Typology":"Commercial",
                     "New_Typology":"Institutional",
                     "Construction_System": "Reinforced Concrete",
                     "Occupancy": "Intermittent Occupancy",
                     "Ownership":"Private",
                     }
                    },
                   
                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.7243502155266,45.428604926085754 ]
                      },
                     "properties": {
                     "Project":"Cours D'Angla",
                     "Address":"2 Morin St",
                     "Year_of_Construction": 1900,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": 2020,
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "No",
                     "Designation": "None",
                     "Original_Typology":"Residential",
                     "New_Typology":"Mixed Use",
                     "Construction_System": "Wood Frame",
                     "Occupancy": "Occupied",
                     "Ownership":"Private",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.72440737035167,45.4294721120819 ]
                      },
                     "properties": {
                     "Project":"Braves Du Coin",
                     "Address":"8 Rue des Braves-du-Coin",
                     "Year_of_Construction": 1945,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": 2020,
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "No",
                     "Designation": "None",
                     "Original_Typology":"Residential",
                     "New_Typology":"Commercial",
                     "Construction_System": "Wood Frame",
                     "Occupancy": "Occupied",
                     "Ownership":"Private",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.71218104753999,45.4305976839486 ]
                      },
                     "properties": {
                     "Project":"Woven Streams Couture",
                     "Address":"163 B Rue Champlain",
                     "Year_of_Construction": 1915,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": 2010,
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "Yes",
                     "Designation": "Recognized by répertoire du patrimoine culturel du Québec",
                     "Original_Typology":"Residential",
                     "New_Typology":"Commercial",
                     "Construction_System": "Brick & Block",
                     "Occupancy": "Occupied",
                     "Ownership":"Private",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.71297010048353,45.42978643014157 ]
                      },
                     "properties": {
                     "Project":"Bernier et Associes Inc.",
                     "Address":"226 Rue Papineau",
                     "Year_of_Construction": 1920,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": "Unknown",
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "No",
                     "Designation": "None",
                     "Original_Typology":"Residential",
                     "New_Typology":"Commercial",
                     "Construction_System": "Brick & Block",
                     "Occupancy": "Intermittent Occupancy",
                     "Ownership":"Private",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.71026014491166,45.43080903062836 ]
                      },
                     "properties": {
                     "Project":"Samson RH|HR",
                     "Address":"77 Laurier St",
                     "Year_of_Construction": 1925,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": 2018,
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "Yes",
                     "Designation": "Recognized by répertoire du patrimoine culturel du Québec",
                     "Original_Typology":"Residential",
                     "New_Typology":"Commercial",
                     "Construction_System": "Wood Frame",
                     "Occupancy": "Intermittent Occupancy",
                     "Ownership":"Private",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.71022654361553,45.43055995967714 ]
                      },
                     "properties": {
                     "Project":"InnovaCom Marketing & Communication",
                     "Address":"73 Laurier St",
                     "Year_of_Construction": 1945,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": "Unknown",
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "Yes",
                     "Designation": "Recognized by répertoire du patrimoine culturel du Québec",
                     "Original_Typology":"Residential",
                     "New_Typology":"Commercial",
                     "Construction_System": "Wood Frame",
                     "Occupancy": "Intermittent Occupancy",
                     "Ownership":"Private",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.71128649631419,45.43008637150814 ]
                      },
                     "properties": {
                     "Project":"Chiro Mouvement - Clinique Chiropratique à Hull",
                     "Address":"137 Rue Notre-Dame-de-l'île",
                     "Year_of_Construction": 1900,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": 2021,
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "No",
                     "Designation": "None",
                     "Original_Typology":"Residential",
                     "New_Typology":"Commercial",
                     "Construction_System": "Brick & Block",
                     "Occupancy": "Occupied",
                     "Ownership":"Private",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.71142464843412,45.43186728598213 ]
                      },
                     "properties": {
                     "Project":"École de ballet Adagio/Service canada",
                     "Address":"210 Rue Champlain",
                     "Year_of_Construction": 1965,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": 2020,
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "No",
                     "Designation": "None",
                     "Original_Typology":"Commercial",
                     "New_Typology":"Institutional",
                     "Construction_System": "Reinforced Concrete",
                     "Occupancy": "Intermittent Occupancy",
                     "Ownership":"Public",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.71234852329935,45.429757302544346 ]
                      },
                     "properties": {
                     "Project":"Services d’avocats",
                     "Address":"141 Rue Champlain",
                     "Year_of_Construction": 1915,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": 2020,
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "Yes",
                     "Designation": "Recognized by répertoire du patrimoine culturel du Québec",
                     "Original_Typology":"Residential",
                     "New_Typology":"Commercial",
                     "Construction_System": "Brick & Block",
                     "Occupancy": "Intermittent Occupancy",
                     "Ownership":"Private",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.71218131083242,45.42881293817752 ]
                      },
                     "properties": {
                     "Project":"CREDDO",
                     "Address":"112 Rue Champlain",
                     "Year_of_Construction": 1880,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": 2019,
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "No",
                     "Designation": "None",
                     "Original_Typology":"Commercial",
                     "New_Typology":"Mixed Use",
                     "Construction_System": "Brick & Block",
                     "Occupancy": "Occupied",
                     "Ownership":"Private",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.71512086114308,45.42694837794041 ]
                      },
                     "properties": {
                     "Project":"L'ancien Hotel Chez Henri",
                     "Address":"179 Prom. du Portage",
                     "Year_of_Construction": 1928,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": 2009,
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "No",
                     "Designation": "None",
                     "Original_Typology":"Commercial",
                     "New_Typology":"Commercial",
                     "Construction_System": "Brick & Block",
                     "Occupancy": "Intermittent Occupancy",
                     "Ownership":"Mixed",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.71583044810941,45.426312432630525 ]
                      },
                     "properties": {
                     "Project":"VOYAGES G TRAVEL",
                     "Address":"163 Prom. du Portage",
                     "Year_of_Construction": 1880,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": "Unknown",
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "No",
                     "Designation": "None",
                     "Original_Typology":"Commercial",
                     "New_Typology":"Commercial",
                     "Construction_System": "Brick & Block",
                     "Occupancy": "Occupied",
                     "Ownership":"Private",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.71649565057872,45.42671444368703 ]
                      },
                     "properties": {
                     "Project":"Hellbound Tattoos & Cigarette Électronique Gatineau",
                     "Address":"35-37 Rue Laval",
                     "Year_of_Construction": 1915,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": 2020,
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "Yes",
                     "Designation": "Recognized by répertoire du patrimoine culturel du Québec",
                     "Original_Typology":"Residential",
                     "New_Typology":"Commercial",
                     "Construction_System": "Brick & Block",
                     "Occupancy": "Intermittent Occupancy",
                     "Ownership":"Private",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.71706968970106,45.42693388472312 ]
                      },
                     "properties": {
                     "Project":"Aide Juridique",
                     "Address":"136 Rue Wright",
                     "Year_of_Construction": "Unknown",
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": "Unknown",
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "Yes",
                     "Designation": "Recognized by répertoire du patrimoine culturel du Québec",
                     "Original_Typology":"Institutional",
                     "New_Typology":"Insitutional",
                     "Construction_System": "Reinforced Concrete",
                     "Occupancy": "Occupied",
                     "Ownership":"Public",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.71735186491225,45.426928733864976 ]
                      },
                     "properties": {
                     "Project":"Aide Juridique",
                     "Address":"132 Rue Wright",
                     "Year_of_Construction": 1928,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": 2023,
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "Yes",
                     "Designation": "Recognized by répertoire du patrimoine culturel du Québec",
                     "Original_Typology":"Residential",
                     "New_Typology":"Commercial",
                     "Construction_System": "Brick & Block",
                     "Occupancy": "Occupied",
                     "Ownership":"Public",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.71873179133276,45.42711292499672 ]
                      },
                     "properties": {
                     "Project":"Accompagnement des femmes immigrantes de l'Outaouais",
                     "Address":"109 Rue Wright",
                     "Year_of_Construction": 1900,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": 1983,
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "Yes",
                     "Designation": "Cataloged as a building of local heritage interest",
                     "Original_Typology":"Institutional",
                     "New_Typology":"Mixed Use",
                     "Construction_System": "Brick & Block",
                     "Occupancy": "Intermittent Occupancy",
                     "Ownership":"Public",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.71803222671919,45.426564756024845 ]
                      },
                     "properties": {
                     "Project":"Épicerie Poukham Traiteur Thai Cuisine",
                     "Address":"34 Rue Leduc",
                     "Year_of_Construction": 1950,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": "Unknown",
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "No",
                     "Designation": "None",
                     "Original_Typology":"Residential",
                     "New_Typology":"Commercial",
                     "Construction_System": "Wood Frame",
                     "Occupancy": "Occupied",
                     "Ownership":"Private",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.71832687050392,45.42607140699818 ]
                      },
                     "properties": {
                     "Project":"Le 138 Restaurant",
                     "Address":"138 Rue Wellington",
                     "Year_of_Construction": 1920,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": 2020,
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "No",
                     "Designation": "None",
                     "Original_Typology":"Commercial",
                     "New_Typology":"Commercial",
                     "Construction_System": "Brick & Block",
                     "Occupancy": "Occupied",
                     "Ownership":"Private",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.718425524384,45.42631902964116 ]
                      },
                     "properties": {
                     "Project":"L'Esthète",
                     "Address":"133 Rue Wellington",
                     "Year_of_Construction": 1915,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": 2024,
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "No",
                     "Designation": "None",
                     "Original_Typology":"Residential",
                     "New_Typology":"Commercial",
                     "Construction_System": "Brick & Block",
                     "Occupancy": "Occupied",
                     "Ownership":"Private",
                     }
                    },


                    {
                     "type": "Feature",
                     "geometry": {
                        "type": "Point",
                        "coordinates":  [ -75.71901314821314,45.426625115648555 ]
                      },
                     "properties": {
                     "Project":"Zeut Concept",
                     "Address":"44 Rue Saint-Jacques",
                     "Year_of_Construction": 1930,
                     "Construction_Team": "Unknown",
                     "Year_of_Adaptive_Reuse": "Unknown",
                     "Adaptive_Reuse_Team": "Unknown",
                     "Notable_Designation": "Yes",
                     "Designation": "Recognized by répertoire du patrimoine culturel du Québec",
                     "Original_Typology":"Residential",
                     "New_Typology":"Commercial",
                     "Construction_System": "Brick & Block",
                     "Occupancy":"Occupied",
                     "Ownership":"Private",
                     }
                    },


                 ]
                 }
            });
         
            // Add a symbol layer for Gatineau AR Sites
            map.addLayer({
                'id': 'g_sites',
                'type': 'symbol',
                'source': 'g_sites',
                'layout': {
                    'icon-image': 'custom-marker',
                    'icon-size': 0.2
                }
            });
        }
    )
  });
  };
 
//Gatineau Sites Pop Ups
  {
  map.on('click', 'g_sites', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const gatineausites = e.features[0];
 
    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180)
      {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
 
        new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
                <h3>${gatineausites.properties.Project}</h3>
                <p><b>Address:</b> ${gatineausites.properties.Address}</p>
                <p><b>Year of Construction:</b> ${gatineausites.properties.Year_of_Construction}</p>
                <p><b>Construction Team:</b> ${gatineausites.properties.Construction_Team}</p>
                <p><b>Year of Adaptive Reuse:</b> ${gatineausites.properties.Year_of_Adaptive_Reuse}</p>
                <p><b>Adaptive Reuse Team:</b> ${gatineausites.properties.Adaptive_Reuse_Team}</p>
                <p><b>Notable Designation:</b> ${gatineausites.properties.Designation}</p>
                <p><b>Original Typology:</b> ${gatineausites.properties.Original_Typology}</p>
                <p><b>New Typology:</b> ${gatineausites.properties.New_Typology}</p>
                <p><b>Construction System:</b> ${gatineausites.properties.Construction_System}</p>
                <p><b>Occupancy:</b> ${gatineausites.properties.Occupancy}</p>
                <p><b>Ownership:</b> ${gatineausites.properties.Ownership}</p>
                `)
            .addTo(map);
    });
  };


//Ottawa Sites Pop Ups
  {
  map.on('click', 'o_sites', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const ottawasites = e.features[0];
 
    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180)
      {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
 
        new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
                <h3>${ottawasites.properties.Project}</h3>
                <p><b>Address:</b> ${ottawasites.properties.Address}</p>
                <p><b>Year of Construction:</b> ${ottawasites.properties.Year_of_Construction}</p>
                <p><b>Construction Team:</b> ${ottawasites.properties.Construction_Team}</p>
                <p><b>Year of Adaptive Reuse:</b> ${ottawasites.properties.Year_of_Adaptive_Reuse}</p>
                <p><b>Adaptive Reuse Team:</b> ${ottawasites.properties.Adaptive_Reuse_Team}</p>
                <p><b>Notable Designation:</b> ${ottawasites.properties.Designation}</p>
                <p><b>Original Typology:</b> ${ottawasites.properties.Original_Typology}</p>
                <p><b>New Typology:</b> ${ottawasites.properties.New_Typology}</p>
                <p><b>Construction System:</b> ${ottawasites.properties.Construction_System}</p>
                <p><b>Occupancy:</b> ${ottawasites.properties.Occupancy}</p>
                <p><b>Ownership:</b> ${ottawasites.properties.Ownership}</p>
                `)
            .addTo(map);
    });
  };
   
//Changing Between Gatineau and Ottawa Layers
   
  //Toggle between the two layers
    // After the last frame rendered before the map enters an "idle" state.
    map.on('idle', () => {
      // If these two layers were not added to the map, abort
        if (!map.getLayer('g_sites')
        || !map.getLayer('o_sites')  
        )
        {
        return;
        }
   
      // Layer IDs
        // Layer IDs and display names
          const toggleableLayers = {
            g_sites: "Gatineau",
            o_sites: "Ottawa"
          };
   
      // Set up the corresponding toggle button for each layer.
        for (const id in toggleableLayers) {
          if (document.getElementById(id)) continue;


          const link = document.createElement("a");
          link.id = id;
          link.href = "#";
          link.textContent = toggleableLayers[id]; // use friendly name
          link.className = "active";
           
       // Show/hide layer on click
        link.onclick = function (e) {
          const clickedLayer = id;
          e.preventDefault();
          e.stopPropagation();


          const visibility = map.getLayoutProperty(clickedLayer, "visibility");


          if (visibility === "visible") {
            map.setLayoutProperty(clickedLayer, "visibility", "none");
            this.className = "";
          } else {
            this.className = "active";
            map.setLayoutProperty(clickedLayer, "visibility", "visible");
          }
        };


        document.getElementById('menu').appendChild(link);




//Filter Bar Functions
  const layers = document.getElementById('menu');
  layers.appendChild(link);
  }
  });


//Filter Toggle Button
  const toggleBtn = document.getElementById('toggle-filters');
    const overlay = document.querySelector('.map-overlay');


    toggleBtn.addEventListener('click', () => {
      overlay.classList.toggle('hidden');
      if (overlay.classList.contains('hidden')) {
        toggleBtn.textContent = '⚙️ Show Filters';
      } else {
        toggleBtn.textContent = '❌ Hide Filters';
      }
    });


//Filter functions


    //Filter Values
        let constructionYear = 2025;
        let reuseYear = 2025;
        let selectedOriginalTypology = "all";
        let selectedNewTypology = "all";
        let selectedOccupancy = "all";
        let selectedNotable = [];
        let selectedOwnership = [];


    //Combined Filter function
        function updateFilters() {
        const filters = ["all"];


    // Timeline sliders (allow "Unknown")
        filters.push([
            "any",
            ["==", ["get", "Year_of_Construction"], "Unknown"],
            ["<=", ["get", "Year_of_Construction"], constructionYear]
          ]);
        filters.push([
            "any",
            ["==", ["get", "Year_of_Adaptive_Reuse"], "Unknown"],
            ["<=", ["get", "Year_of_Adaptive_Reuse"], reuseYear]
          ]);


    // Dropdowns
        if (selectedOriginalTypology !== "all") {
            filters.push(["==", ["get", "Original_Typology"], selectedOriginalTypology]);
        }
        if (selectedNewTypology !== "all") {
            filters.push(["==", ["get", "New_Typology"], selectedNewTypology]);
          }
        if (selectedOccupancy !== "all") {
            filters.push(["==", ["get", "Occupancy"], selectedOccupancy]);
          }


    // Checkboxes (no "Unknown" handling here unless your data has it explicitly)
        if (selectedNotable.length > 0) {
            filters.push(["in", ["get", "Notable_Designation"], ...selectedNotable]);
          }
        if (selectedOwnership.length > 0) {
            filters.push(["in", ["get", "Ownership"], ...selectedOwnership]);
          }


    // Apply combined filter
        map.setFilter("g_sites", filters);
        map.setFilter("o_sites", filters);


    };


    // Slider event listeners
      const constructionSlider = document.getElementById('constructionSlider');
      const reuseSlider = document.getElementById('reuseSlider');
      const constructionValue = document.getElementById('constructionValue');
      const reuseValue = document.getElementById('reuseValue');


      constructionValue.textContent = constructionSlider.value;
      reuseValue.textContent = reuseSlider.value;


      constructionSlider.addEventListener('input', (e) => {
          constructionYear = parseInt(e.target.value);
          constructionValue.textContent = constructionYear;
          updateFilters();
      });


      reuseSlider.addEventListener('input', (e) => {
          reuseYear = parseInt(e.target.value);
          reuseValue.textContent = reuseYear;
          updateFilters();
      });


    // Dropdown event listeners
      document.getElementById('operator-og-typology').addEventListener('change', (e) => {
          selectedOriginalTypology = e.target.value;
          updateFilters();
      });


      document.getElementById('operator-new-typology').addEventListener('change', (e) => {
          selectedNewTypology = e.target.value;
          updateFilters();
      });


      document.getElementById('operator-occupancy').addEventListener('change', (e) => {
          selectedOccupancy = e.target.value;
          updateFilters();
      });


    // Notable Designation checkboxes
      function updateSelectedNotable() {
          const checkboxes = document.querySelectorAll('#filtersNotableDesignation input[type=checkbox]');
          const showAllChecked = document.querySelector('#filtersNotableDesignation input[value="all"]').checked;


          if (showAllChecked) {
              selectedNotable = []; // empty = show all
              checkboxes.forEach(cb => { if(cb.value !== "all") cb.checked = true; });
          } else {
              selectedNotable = Array.from(checkboxes)
                  .filter(cb => cb.checked && cb.value !== "all")
                  .map(cb => cb.value);
          }
      };


      document.querySelectorAll('#filtersNotableDesignation input[type=checkbox]').forEach(cb => {
          cb.addEventListener('change', () => {
              updateSelectedNotable();
              updateFilters();
          });
      });


    // Ownership checkboxes
      function updateSelectedOwnership() {
          const checkboxes = document.querySelectorAll('#filtersOwnership input[type=checkbox]');
          const showAllChecked = document.querySelector('#filtersOwnership input[value="all"]').checked;


          if (showAllChecked) {
              selectedOwnership = [];
              checkboxes.forEach(cb => { if(cb.value !== "all") cb.checked = true; });
          } else {
              selectedOwnership = Array.from(checkboxes)
                  .filter(cb => cb.checked && cb.value !== "all")
                  .map(cb => cb.value);
          }
      }


      document.querySelectorAll('#filtersOwnership input[type=checkbox]').forEach(cb => {
          cb.addEventListener('change', () => {
              updateSelectedOwnership();
              updateFilters();
          });
      });


//Reseting filters button
    const resetBtn = document.getElementById('reset-filters');
    resetBtn.addEventListener('click', () => {
        // Reset sliders
        constructionYear = 2025;
        reuseYear = 2025;
        constructionSlider.value = constructionYear;
        reuseSlider.value = reuseYear;
        constructionValue.textContent = constructionYear;
        reuseValue.textContent = reuseYear;


        // Reset dropdowns
        selectedOriginalTypology = 'all';
        selectedNewTypology = 'all';
        selectedOccupancy = 'all';
        document.getElementById('operator-og-typology').value = 'all';
        document.getElementById('operator-new-typology').value = 'all';
        document.getElementById('operator-occupancy').value = 'all';


        // Reset checkboxes
        selectedNotable = [];
        selectedOwnership = [];


        document.querySelectorAll('#filtersNotableDesignation input[type=checkbox]').forEach(cb => {
            cb.checked = cb.value === 'all';
        });


        document.querySelectorAll('#filtersOwnership input[type=checkbox]').forEach(cb => {
            cb.checked = cb.value === 'all';
        });


        // Reapply filters to both layers
        updateFilters();
        });


// Initialize filters
    updateSelectedNotable();
    updateSelectedOwnership();
    updateFilters();

