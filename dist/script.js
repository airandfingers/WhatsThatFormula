var searchEle = document.querySelector(".input"),
	result = document.querySelector(".results"),
	visual = document.querySelector(".visual"),
	info = document.querySelector(".info");


function doSearch(dataset, fuse) {

	showMore = 9;
	showMoreindices=[0, showMore];


	resultJSON = {}
	visual.innerHTML=""
	resultJSON = searchEle.value ? fuse.search(searchEle.value): dataset.map(item => {
		return { item: item }
	});
	if (resultJSON.length>showMore){
		document.getElementById('ShowMoreButton').style.visibility = 'visible';
	}
	else{
		document.getElementById('ShowMoreButton').style.visibility = 'hidden';
	}
	renderVisual(resultJSON, showMoreindices, showMore);
	info.innerHTML = `Found <strong>${resultJSON.length} equations </strong>`;
	visual.scrollTo(0, 0);
	result.scrollTo(0, 0);
}


function renderVisual(resultJSON, indices, increment) {
	currentidxs = indices

	console.log(currentidxs)
	json_snip = resultJSON.slice(currentidxs[0],currentidxs[1])

	let html = json_snip.reduce((sum, curr) => {
		const {name,latex,href,contributed_by,description} = curr;
		return sum + `
		<div class="item">
			<div class="header columns">
			<div class="column is-two-thirds">
				<h2 class="title has-text-centered-mobile" onclick="showDetails(${curr.item.id})">${curr.item.name} <div class='divider'></div> <i class="rotate fa fa-angle-right" aria-hidden="true"></i></h2>

<span id="msg-${curr.item.id}"></span>
</div>
<div class="column">
<div class="level-right has-text-centered">
      <button class="button" onclick="copyToClipboardMsg(${curr.item.id})">

<span>
    <i class="fa fa-copy" aria-hidden="true"></i>
  </span>
              <span>TeX</span>
</button>
<div class='divider'></div>
</button>

<button class="button" onclick="downloadPNG(${curr.item.id})">
  <span>
    <i class="fa fa-download" aria-hidden="true"></i>
  </span>
              <span>png</span>
</button>
</div>
</div>
			</div>
      <div id = 'formula-${curr.item.id}' ><span class="formula">
 ${curr.item.latex}
</span>
</div>
			<hr>
			<div class="content description columns" id="content-${curr.item.id}"></div>

		</div>
		`
	}, '');
	visual.innerHTML += html;

	MathJax.typeset()
	if (currentidxs[0]!=0){
		firstElem = document.getElementById("formula-"+currentidxs[0])
		firstElem.scrollIntoView()
	}

	showMoreindices = currentidxs.map(function (num, idx) {
		var next = num +increment;
		if (next[1]>resultJSON.length){
			next[1] = resultJSON.length;
		}
		return next;
		});
	if (showMoreindices[0]>resultJSON.length){
		document.getElementById('ShowMoreButton').style.visibility = 'hidden';
	}
}

function showDetails(id) {
	var element = document.getElementById('content-' + id);
	var parent = element.parentElement;
	if(element.innerHTML.trim()) {
		element.innerHTML = "";
		parent.classList.remove('show-card');
	} else {
		var item = dataset.find(x => x.id===id);
		var defineHTML = getdefinitionHTML(item.definition);
		var html = '';
		if(item.definition && item.definition.length !== 0) {
		html = `
		<div class="description-text column is-half-desktop">
			<h5 class="has-text-centered-mobile"> ${item.description}
			<h5 class="has-text-centered-mobile link"> Find more information<a href=${item.href} target="_blank">here</a></h5>
		</div>
      	<div class="column"><span> ${defineHTML} </span></div>
			</div>
			`;
		} else {
			html = `<div class="description-text column">
			<h5 class="has-text-centered-mobile"> ${item.description}
			<h5 class="link has-text-centered-mobile"> Find more information<a href=${item.href} target="_blank">here</a></h5>
			</div>
		</div>`
		}
		element.innerHTML += html;
		parent.classList.add('show-card');
		MathJax.typeset();
	}
}

function getdefinitionHTML(defined){
  var begin_TeX = "$$ \\begin{align*}";
  var tex = "";
  var end_TeX = "\\end{align*} $$";
  var defvars = Object.keys(defined);
  if (defvars.length>0){
	defvars.forEach(function(entry){
		tex += entry+": & \\quad \\text{"+ defined[entry]+"} \\\\";
	});
	return begin_TeX+tex+end_TeX;
	}
	else {
		return "";
	};

}
function onKeyup() {
	console.log(searchEle.value);
	if(!searchEle.value) {
		doSearch(dataset, fuse);
	}
}

function downloadPNG(id) {
	var item = dataset.find(x => x.id === id);
	var formulaEL = document.getElementById('formula-'+id);
	var svg = formulaEL.querySelector('svg');
	svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

	var svgClone = svg.cloneNode(true);
	svgClone.setAttribute("width", svg.width.baseVal.value + 100 + 'px');
	svgClone.setAttribute("height", svg.height.baseVal.value + 50 + 'px');

	var image = new Image();
	image.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgClone.outerHTML)));
	image.onload = function () {
		var canvas = document.createElement('canvas');
		canvas.width = svgClone.width.baseVal.value;
		canvas.height = svgClone.height.baseVal.value;
		var context = canvas.getContext('2d');
		context.drawImage(image, 0, 0);
		var img = canvas.toDataURL('image/png');
		var link = document.createElement('a');
		link.download = item.name.trim().toLowerCase() + '.png';
		link.style.opacity = "0";
		document.body.append(link);
		link.href = img;
		link.click();
		link.remove();
	};
}

function copyToClipboardMsg(id) {
    var item = dataset.find(x => x.id === id);
    var el = document.createElement('textarea');
    var raw = item.latex;
    raw = raw.replace('$$',"$");
    var processed = raw.replace('$$',"$");
    el.value = processed;
    el.style = {
        display: 'none'
    };
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 99999);
    /* Copy the text inside the text field */
    document.execCommand("copy");
    document.body.removeChild(el);
    var msg = "TeX code copied to the clipboard.";
    var msgElem = document.getElementById('msg-' + id);
	msgElem.innerHTML = msg;
	msgElem.style.marginRight = '10px';
    setTimeout(function () {
        msgElem.innerHTML = "";
    }, 2000);
}

function openNavMenu() {
	const navMenu = document.getElementById('navMenu');
	//navMenu.classList.toggle('is-active');
	navMenu.classList.toggle('is-active');
}


var options = {
	shouldSort: true,
	matchAllTokens: true,
	findAllMatches: true,
	threshold: 0.6,
	location: 0,
	distance: 100,
	maxPatternLength: 32,
	minMatchCharLength: 1,
	includeScore: true,
	keys: ["name", "keywords"]
};

var showMore = 5
var showMoreindices=[0, showMore-1]
var resultJSON = {}
var delayedSearch;
let dataset;
let fuse;

searchEle.addEventListener("input", event => {
	if (delayedSearch) {
		clearTimeout(delayedSearch);
	}
	delayedSearch = setTimeout(doSearch(dataset,fuse), 300);
});


/* MODIFY HERE: LINK TO THE HOSTED JSON*/
fetch('data.json')
	.then(response => response.json())
	.then(function(json){
		dataset = json;
		dataset = dataset.reverse();
		for (i=0; i<dataset.length; i++){
			dataset[i].id = i;
		}
		fuse = new Fuse(dataset, options);
		doSearch(dataset,fuse);
	});



