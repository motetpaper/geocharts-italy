// it.js
// (prototype)
// job    : generates and downloads geocharts as PNG files
// git    : https://github.com/motetpaper/geocharts-italy
// lic    : Apache 2.0

// modified the example code on Google Charts to
// create an automation tool; it generates the charts
// then saves them to PNG images as downloads

// you can run this is on a local test HTTP server
// then start the automated process by calling region 1:
// http://localhost/#1

let dataset = null;

// todo: check if browser is online
// todo: create better UI to start generator

google.charts.load('current', {
  'packages': ['geochart'],
});

google.charts.setOnLoadCallback(drawRegionsMap);

// NOTE
// For reference, please visit:
// https://en.wikipedia.org/wiki/ISO_3166-2:IT
(async function() {
  // this is the dataset from the datafile
  const datafile = 'iso-3166-2-it.txt';
  const txt = await fetch(datafile).then(r=>r.text());

  // only use the top-level provinces in italy
  dataset=txt.trim().split('\n')
    .map(a=>a.split(','))
    .filter(a=>!!a[0].match(/IT-(\d+)/));
  dataset.unshift(['code','col2','col3','col4']);
  console.log('[it.js] dataset loaded.');
})();

async function drawRegionsMap() {

  // this is the array used by google chart
  const arr = dataset.slice(1).map(a=>[a[0],100]);
  arr.unshift(['state','value']);

  // the current selected image from the URL
  const selected = window.location.hash.replace(/\D/,'') || '1';
  const outfile = `it-region-${selected.padStart(2,'0')}.png`;
  var data = google.visualization.arrayToDataTable(arr);
  data.setCell((+selected-1),1,900);

  const options = {

    // country code works best
    region: 'IT',

    // state-level, including FCT
    resolution: 'provinces',

    tooltip: { trigger: 'none' }, // not needed
    legend: 'none', // not needed

    // when data value is '100'
    defaultColor: '#ff0000',
    datalessRegionColor: '#ffffff',
  };

  const div = document.getElementById('regions_div');
  const chart = new google.visualization.GeoChart(div);

  // immediately add event listener to chart
  google.visualization.events.addListener(chart, 'ready', () => {

    const a = document.createElement('a');
    a.href = chart.getImageURI();
    a.download = outfile
    a.click();
    console.log(`[it.js] downloading ${outfile}`)

    // wait 8 seconds to iterate
    let printer = setTimeout(() => {
      if(+selected < arr.length - 1) {
        window.location.hash = `#${+selected+1}`;
      } else {
        printer = null;
        console.log('[it.js] done.');
      }
    },5000);
  });

  chart.draw(data, options);
}

window.onhashchange = drawRegionsMap;
