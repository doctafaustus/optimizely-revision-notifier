// This script runs in the visited page that's open in Chrome
var onOptimizely = /app.optimizely.com\/edit/.test(window.location.href);
var onOptimizelyX = /https:\/\/app.optimizely.com\/v2\/projects\//.test(window.location.href);

if (onOptimizely || onOptimizelyX) {
	$(document).ready(function() {
		console.log('[Opt Rev Notif] Ready');

		// Get snippet ID so we can make the proper request
		//window.snippetID = window.location.pathname.match(/projects\/(\d+)\//)[1];

		if (onOptimizely) {
			window.snippetID = $('#dashboard-link a:first').attr('href').match(/projects\/(\d+)/)[1];
		} else {
			window.snippetID = window.location.pathname.match(/projects\/(\d+)/)[1];
		}


		
		// On publish click, check for revisions
		$('body').on('mousedown', '#dialog-manager button[type="submit"], #js-save-button-text', function() {
			console.log('[Opt Rev Notif] Checking for updates...');
			getInitialRevision();
		});


	});
}

// Get the initial revision number first so we know what number to checkout against
function getInitialRevision() {

	// Clear badge first
	chrome.runtime.sendMessage({ clearBadge: 'true' }, function(response) {
	  console.log(response);
	});

	$.ajax({
		type: 'HEAD',
		url: 'https://cdn.optimizely.com/js/' + window.snippetID + '.js',
		cache: false,
		success: function(data, textStatus, request) {
			window.revision = request.getResponseHeader('x-amz-meta-revision');
			checkForUpdates();
		}
	});
}

// Keep checking the revision number in the snippet response header until it's different than the revision we currently have
function checkForUpdates() {
	console.log('[Opt Rev Notif] Checking against', window.revision);

	$.ajax({
		type: 'HEAD',
		url: 'https://cdn.optimizely.com/js/' + window.snippetID + '.js',
		cache: false,
		success: function(data, textStatus, request) {
			var fetchedRevision = request.getResponseHeader('x-amz-meta-revision');

			if (window.revision === fetchedRevision) {
				setTimeout(checkForUpdates, 2500);
			} else {
				window.revision = fetchedRevision;
				console.log('[Opt Rev Notif] New revision found:', window.revision);
				chrome.runtime.sendMessage({ revision: window.revision }, function(response) {
				  console.log(response);
				});
			}
		}
	});
}


