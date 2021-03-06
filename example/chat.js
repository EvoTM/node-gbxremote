var gbxremote = require('../lib/gbxremote.js');

// Connect to localhost:5000
var client = gbxremote.createClient(5000);

client.on('connect', function () {
	// Before enabling callbacks, make sure you set the latest API.
	client.query('SetApiVersion', ['2012-06-19']);
	client.query('EnableCallbacks', [true]);

	// Authenticate so that we can send chat messages - SuperAdmin is not needed to chat, just Admin...
	client.query('Authenticate', ['Admin', 'Admin']).then(function (res) {
		if (res === true) {
			// Listen to stdin
			process.stdin.resume();
			process.stdin.setEncoding('utf8');

			process.stdin.on('data', function (chunk) {
				client.query('ChatSend', [chunk.trim()]).catch(function (err) {
					console.error('Error occured when sending chat message:', err);
				});
			});

			console.log('*** Authenticated! You may now chat with the server.');
		} else {
			console.log('*** Could not authenticate to server. You can read but not write!');
		}
	})
	.catch(function (err) {
		console.error('*** Error when trying to authenticate:');
		console.error(err);
		client.terminate();
	});
});

// ManiaPlanet.PlayerChat(int PlayerUid, string Login, string Text, bool IsRegistredCmd);
client.on('ManiaPlanet.PlayerChat', function (params) {
	var PlayerUid = params[0];
	var Login = params[1];
	var Text = params[2];
	var IsRegistredCmd = params[3];

	// Normal chat message, or did the player call a registred chat command?
	if (IsRegistredCmd) {
		console.log('%s executed command: %s', Login, Text);
	} else {
		console.log('[%s:%s] %s', PlayerUid, Login, Text);
	}
});
