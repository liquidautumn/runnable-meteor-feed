Commits = new Meteor.Collection('commits');

if (Meteor.isClient) {
    Template.commitlist.commits = function () {
        return Commits.find({}, { sort: { createdAt: 1 }});
    };

    Handlebars.registerHelper("prettyDate", function(timestamp) {
        return (new Date(timestamp)).toString('yyyy-MM-dd hh:mm:ss');
    });
}

if (Meteor.isServer) {

    function getCommits() {
        Meteor.http.get("https://api.github.com/repos/meteor/meteor/commits", function (error, result) {
            if (result.statusCode === 200) {
                for (var i = 0; i < result.data.length; i++) {
                    var c = result.data[i];
                    if (Commits.find({sha: c.sha}).fetch().length == 0){
                        Commits.insert({
                            sha: c.sha,
                            author: c.commit.author.name,
                            message: c.commit.message,
                            createdAt: Date.now()
                        });
                    }
                }
            } else {
                console.log(result);
            }
        });
    }

    getCommits();

    Meteor.startup(function () {
        Meteor.setInterval(function () {
            getCommits();
        }, 1000 * 60 * 5);
    });
}
