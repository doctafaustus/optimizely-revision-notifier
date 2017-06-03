// This script runs in the visited page that's open in Chrome
console.log('content.js');

//if (/https:\/\/app.optimizely.com\/v2\/projects\//.test(window.location.href)) {
$(document).ready(function() {
	console.log('DOM ready, yo!');

	// Get snippet ID so we can make the proper request
	window.snippetID = window.location.pathname.match(/projects\/(\d+)\//)[1];
	
	// On publish click, check for revisions
	$('body').on('mousedown', '#dialog-manager button[type="submit"]', function() {
		console.log('CHECKING FOR UPDATES!!!!');
		getInitialRevision();
	});


});
//}

// Get the initial revision number first so we know what number to checkout against
function getInitialRevision() {
	$.ajax({
		type: 'HEAD',
		url: 'https://cdn.optimizely.com/js/' + window.snippetID + '.js',
		success: function(data, textStatus, request) {
			window.revision = request.getResponseHeader('x-amz-meta-revision');
			checkForUpdates();
		}
	});

}

// Keep checking the revision number in the snippet response header until it's different than the revision we currently have
function checkForUpdates() {
	console.log('Checking against', window.revision);

	$.ajax({
		type: 'HEAD',
		url: 'https://cdn.optimizely.com/js/' + window.snippetID + '.js',
		success: function(data, textStatus, request) {
			var fetchedRevision = request.getResponseHeader('x-amz-meta-revision');

			if (window.revision === fetchedRevision) {
				setTimeout(checkForUpdates, 2500);
			} else {
				window.revision = fetchedRevision;
				console.log('NEW REVISION FOUND', window.revision);
				chrome.runtime.sendMessage({ revision: window.revision }, function(response) {
				  console.log(response);
				});
			}
		}
	});
}


