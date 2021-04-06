
window.wsstatus = 0;

function init() {
    openWebSocket();
    incarca_grupuri();
}

function openWebSocket() {
    var wsUri = "ws://localhost:1337";
    websocket = new WebSocket(wsUri);
    websocket.onopen = function(evt) {
        onOpen(evt)

    };
    websocket.onerror = function(evt) {
        onError(evt)
    };
}

function onError(evt) {
    document.getElementById('outcontent').innerHTML = "<div class='wserr'>WebSocket: EROARE</div>";
    var elems = document.getElementsByClassName("blaunch");
    for (var i = 0; i < elems.length; i++) {
        elems[i].disabled = true;
    }
}

function onOpen(evt) {
    document.getElementById('outcontent').innerHTML = "<div class='wsok'>WebSocket: Conectat</div>";
    window.wsstatus = 1;
}

window.addEventListener("load", init, false);

function citeste_taguri(taggroup) {
    reset_interface();
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
            if (xmlhttp.status == 200) {
                var tags = JSON.parse(xmlhttp.responseText);
                if (window.wsstatus == 1) {
                    //butoanele devin inactive dupa lansare

                    var cbtn = document.getElementById('tg-'+taggroup);
                    cbtn.style.backgroundColor="#6cf5d6";
                    var elems = document.getElementsByClassName("blaunch");
                    for (var i = 0; i < elems.length; i++) {
                        elems[i].disabled = true;
                    }
                    //adaugam butonul de reload
                    var resetbtn = '<button class="resetbtn" type="button" onClick="location.reload();">Resetează interfața</button>';
                    document.getElementById('twbuttons').insertAdjacentHTML('beforeend',resetbtn);
                    //facem vizibil butonul de stop
                    let rb = document.getElementById('resetcollection')
                    rb.style.display = "block";
                    porneste_citirea_ws(tags);
                } else {
                    document.getElementById('treeMap').innerHTML = '<span class="wserror">WebSocket-ul nu este conectat, nu se poate citi stream-ul twitter</span>';
                }
            }
            else if (xmlhttp.status == 400) {
                var errorText = '<span class="cmerror">Eroare de comunicație cu baza de date</span>';


                document.getElementById('treeMap').insertAdjacentHTML('beforeend',errortext);
            }
            else {
                var errorText = '<span class="cmerror">Eroare de comunicație cu baza de date</span>';
                document.getElementById('treeMap').insertAdjacentHTML('beforeend',errortext);
            }
        }
    };

    xmlhttp.open("GET", "php/getTags.php?nume="+taggroup, true);
    xmlhttp.send();
}


function porneste_citirea_ws(tagsarray) {
    var init_treedata = [];
    var readcount = 0;
    tagsarray.forEach(function (tag) {
//        init_treedata.push({name: tag, value: 1});
        init_treedata.push({x: tag, y: 1});

    });
    //init map
    document.getElementById('treeMap').innerHTML = '';
    var charttype = 'apex';
    initChart(charttype, init_treedata);
    websocket.send(JSON.stringify({command: 'startCollection', tagsarray: tagsarray}));
    websocket.onmessage = function (message) {
        var received = JSON.parse(message.data);

        if (received.dt == 'data') {
            var twdata = received.data;
            var langs = received.langs;
            var twcount = received.twcount;
            var intervalcount = received.intervalcount;
            document.getElementById('outcontent').insertAdjacentHTML('beforeend', '<div>tweet-uri cu taguri... '+ intervalcount + '</div>');
            document.getElementById('outcontent').scrollIntoView(false);
            var sortablelangs = [];
            for (var lang in langs) {
                sortablelangs.push([lang, langs[lang]]);
            }
            sortablelangs.sort(function(a, b) {
                return b[1] - a[1];
            });
            document.getElementById('langs').innerHTML = '';

            var index = 0;
            var pallette = colorpalette(1);
            sortablelangs.forEach(function (lang) {
                colorindex = index % pallette.length;
                ccolor = pallette[colorindex];
                document.getElementById('langs').insertAdjacentHTML('beforeend','<div style="background-color: '+ccolor+';" class="langdisplay"><b>'+lang[0]+': </b>' + lang[1]+ '</div>');
                index++;
            });

            readcount++;
            var tagwords = [];
            var treedata = [];
            tagsarray.forEach(function (tag) {
                tagwords.push({word: tag, weight: twdata[tag]});
            });
            //sa vedem daca updatam harta
            var nonzcount = 0;
            var total = 0;
            tagsarray.forEach(function (tag) {
                if (twdata[tag] > 0) {
                    nonzcount++
                }
                total += twdata[tag];
                if (twdata[tag] > 0) {
                    treedata.push({x: tag + ' (' + twdata[tag] + ')', y: twdata[tag]});
                }
            });

            document.getElementById('status').innerHTML = '<b>Tweets: </b>' + twcount + '</br>'+ '<b>Numar citiri: </b>' + readcount + '</br>' + '<b>Total mentiuni: </b>' + total + '</br>' + '<b>Taguri mentionate: </b>' + nonzcount;
            if (nonzcount > 3) {
                updateChart(charttype, treedata);
            }


        } else if (received.dt == 'msg') {
            document.getElementById('outcontent').insertAdjacentHTML('beforeend', '<div>'+received.message+'</div>');
            document.getElementById('outcontent').scrollIntoView(false);
        }
    };
}

function incarca_grupuri() {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
            if (xmlhttp.status == 200) {
                var groups = JSON.parse(xmlhttp.responseText);
                for (i=0; i<groups.length; i++) {
                    var button = '<button id="tg-' + groups[i] + '" class="blaunch" type="button" onClick="citeste_taguri(\'' + groups[i] + '\');">' + groups[i] + '</button><br>';
                    document.getElementById('twbuttons').insertAdjacentHTML('beforeend',button);
                }
            }
            else if (xmlhttp.status == 400) {
                var errorText = '<span class="cmerror">Eroare de comunicație cu baza de date</span>';
                document.getElementById('treeMap').insertAdjacentHTML('beforeend',button);
            }
            else {
                var errorText = '<span class="cmerror">Eroare de comunicație cu baza de date</span>';
                document.getElementById('treeMap').insertAdjacentHTML('beforeend',button);
            }
        }
    };

    xmlhttp.open("GET", "php/getTagGroup.php", true);
    xmlhttp.send();
}

function colorpalette (index = 3) {
    var colors = [];
    colors[1] = ['#FFEC94','#cbe4f9','#FFAEAE','#D8E2DC','#cdf5f6','#eff9da','#f9ebdf','#f9d8d6','#d6cdea','#FFE5D9','#ACC1FF','#FBFAF0','#FFE9EE','#FFDDE4','#B0E57C'];
    colors[2] = ['#3B93A5','#F7B844','#ADD8C7', '#EC3C65','#CDD7B6','#C1F666','#D43F97','#1E5D8C','#421243','#7F94B0','#EF6537','#C0ADDB'];
    colors[3] = ["#F3C300","#e5d993","#F38400","#E68FAC","#ff6d93","#C2B280","#9dc8a4","#80fdd0","#A1CAF1","#0067A5","#F99379","#604E97","#F6A600","#B3446C","#faf123","#882D17","#8DB600","#654522","#E25822","#efa7df","#F2F3F4","#222222"];
    return colors[index];
}

function opreste_citirea_ws() {
    websocket.send(JSON.stringify({command: 'stopCollection'}));

}

function reset_interface() {
    document.getElementById('status').innerHTML = '';
    document.getElementById('outcontent').innerHTML = '';
    document.getElementById('langs').innerHTML = '';
}

function initChart(type, init_treedata) {
    if (type == 'apex') {
        var options = {
            series: [
                {
                    data: init_treedata
                }
            ],
            legend: {
                show: false
            },
            stroke: {
                show: true,
                width: 4,
                colors: ['#333']
            },
            dataLabels: {
                style: {
                    fontSize: 26,
                    fontWeight: 600,
                    colors: ['#333']
                }
            },
            chart: {
                height: 650,
                type: 'treemap'
            },
            foreColor: '#373d3f',
            fontFamily: 'Helvetica, Arial, sans-serif',
            colors: colorpalette(),
            plotOptions: {
                treemap: {
                    distributed: true,
                    enableShades: false
                }
            }
        };

        console.log(options);

        window.chart = new ApexCharts(document.querySelector("#treeMap"), options);
        window.chart.render();

    } else if (type == 'am') {

        am4core.useTheme(am4themes_sorin);
        am4core.useTheme(am4themes_animated);
        window.chart = am4core.create("treeMap", am4charts.TreeMap);
        window.chart.data = init_treedata;
        chart.dataFields.value = "y";
        window.chart.dataFields.name = "x";
        /* Configure top-level series */
        var level1 = chart.seriesTemplates.create("0");
        var level1_column = level1.columns.template;
        level1_column.column.cornerRadius(10, 10, 10, 10);
        level1_column.fillOpacity = 0.8;
        level1_column.stroke = am4core.color("#1D2528");
        level1_column.strokeWidth = 5;
        level1_column.strokeOpacity = 1;

        level1.defaultState.transitionDuration = 5000;
        level1.hiddenState.transitionDuration = 5000;

        /* Add bullet labels */
        var level1_bullet = level1.bullets.push(new am4charts.LabelBullet());
        level1_bullet.locationY = 0.5;
        level1_bullet.locationX = 0.5;
        level1_bullet.label.text = "{name}";
        level1_bullet.label.fill = am4core.color("#1D2528");
    }
}

function updateChart(type, treedata) {
    if (type == 'apex') {
            var ns = {data:treedata};
            window.chart.updateSeries([ns]);
        } else if (type == 'am') {
            window.chart.data = treedata;
    }
}