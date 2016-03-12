var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var client = require('node-rest-client').Client;
var app = express();

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var options_auth = { user: process.env.GITHUB_USERNAME, password: process.env.GITHUB_PASSWORD };
var rest_client = new client(options_auth);

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/api/commit', function(req, res) {
  var owner = req.query.owner;
  var repo = req.query.repo;
  var commit = req.query.commit;
  var url = `https://api.github.com/repos/${owner}/${repo}/commits/${commit}`
  rest_client.get(url, {headers: { "User-Agent": "node-rest-client" }}, function(data, response) {
    res.json({files: data.files});
  }).on('error', function (err) {
  	console.log('something went wrong on the request', err.request.options);
  });
});

app.get('/api/commit_mock', function(req, res) {
  res.json({"files": [
    {
      "sha": "d2ff1162b95e688de1edd57d048c7f79e16d6191",
      "filename": "public/index.html",
      "status": "modified",
      "additions": 8,
      "deletions": 0,
      "changes": 8,
      "blob_url": "https://github.com/Nithanaroy/learning_react/blob/d15583f92190b28741b177b9a51ec32c034504a0/public/index.html",
      "raw_url": "https://github.com/Nithanaroy/learning_react/raw/d15583f92190b28741b177b9a51ec32c034504a0/public/index.html",
      "contents_url": "https://api.github.com/repos/Nithanaroy/learning_react/contents/public/index.html?ref=d15583f92190b28741b177b9a51ec32c034504a0",
      "patch": "@@ -38,6 +38,13 @@\n         });\n       },\n       handleCommentSubmit: function(comment) {\n+        var comments = this.state.data;\n+        // Optimistically set an id on the new comment. It will be replaced by an\n+        // id generated by the server. In a production application you would likely\n+        // not use Date.now() for this and would have a more robust system in place.\n+        comment.id = Date.now();\n+        var newComments = comments.concat([comment]);\n+        this.setState({data: newComments});\n         $.ajax({\n             url: this.props.url,\n             dataType: 'json',\n@@ -47,6 +54,7 @@\n               this.setState({data: data});\n             }.bind(this),\n             error: function(xhr, status, err) {\n+              this.setState({data: comments});\n               console.error(this.props.url, status, err.toString());\n             }.bind(this)\n           });"
    }
  ]})
});

app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
