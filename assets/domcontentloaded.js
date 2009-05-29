/*
	Compiled by Piotr 'Riddle' Petrus.
	Last modified: 22nd May 2007
	----------------------------------
	Props & kudos: 
		Dean Edwards 			http://dean.edwards.name/weblog/2006/06/again/
		John Resig 				http://code.jquery.com/jquery-latest.js
		Matthias Miller		http://www.outofhanwell.com/blog/index.php?title=the_window_onload_problem_revisited
*/

var browser = {
  explorer: /*@cc_on!@*/false,
  webkit: /Apple|KDE/i.test(navigator.vendor)
};

if (browser.explorer) {
	document.write('<script id="_defer" defer="true" src="//:"><\/script>');
}

function DOMContentLoaded(callback) {
	//Firefox, Opera
	if (document.addEventListener) {
		document.addEventListener("DOMContentLoaded", callback, false);
	}
	//Internet Explorer
	if (browser.explorer) {
		var deferScript = document.getElementById('_defer');
		if (deferScript) {
			deferScript.onreadystatechange = function() {
				if (this.readyState == 'complete') {
					callback();
				}
			};
			deferScript.onreadystatechange();
			deferScript = null;
		}
	}
	//Safari, Konqueror
	if (browser.webkit) {
		var _timer = setInterval(function() {
			if (/loaded|complete/.test(document.readyState)) {
				clearInterval(_timer);
				callback();
			}
		}, 10);
	}
	window.onload = callback;	
}