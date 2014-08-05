/**
 * Created by Nazar on 04-08-14.
 */
var mysql = require("mysql");
var restify = require("restify");

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'gb_schema',
    multipleStatements: true
    //	password : 'GrHBS2672&',
    //	database: 'GBIT'
});

function rciEntity(request, response) {

    console.log("Request received.");
    connection.query("select id from rcientity", function (err, result, fields) {
        console.log("Requested URL :" + request.url);
        response.writeHead(200, {"Content-Type": "text/html;charset=utf-8"});
        response.write("All Id's are : " + JSON.stringify(result));
        response.end();
    });

}

function rciUserAccount(request, response) {

    console.log("Request received.");
    connection.query("select username,id,authtoken from useraccount", function (err, result, fields) {
        console.log("Requested URL :" + request.url);
        //	response.setHeader("Set-Cookie", []);
        //response.removeHeader("Set-Cookie");
        response.writeHead(200, {"Content-Type": "text/plain;charset=utf-8"});
        response.write("All User ID's are : " + JSON.stringify(result) + "\n\n" + JSON.stringify(request.headers));

        response.end();
    });

}

function rciMessage(request, response) {

    console.log("Request Received");
    console.log("ID :" + request.params.id);
    connection.query("select * from rcimessage where rci_id='" + request.params.id + "'", function (err, result, fields) {
        console.log("Requested URL :" + request.url);
        response.writeHead(200, {"Content-Type": "text/html;charset=utf-8"});
        response.write("Message: " + JSON.stringify(result));
        response.end();
    })
}

function userProjects(request, response) {

    connection.query("select rcientity.id , rcientity.name "
            + " from rcientity right join rciuserrole "
            + "on rcientity.id=rciuserrole.rcientity_id  where useraccount_id=" + connection.escape(request.params.userId) + " and project=true ",
        function (err, rows, fields) {

            console.log("Requested URL :" + request.url);
//        response.writeHead(200, {"Content-Type": "text/html;charset=utf-8"});
            response.writeHead(200, {"Content-Type": "application/json"});
            var totalQueries = 0;
            for (var i in rows) {

                var obj = rows[i];
                totalQueries++;
                connection.query("select rcientity.id , rcientity.name "
                    + " from rcientity right join rciuserrole "
                    + "on rcientity.id=rciuserrole.rcientity_id  where useraccount_id=" + connection.escape(request.params.userId) +
                    " and (parent_id=" + obj.id + " or rcientity.id=" + obj.id + ")", function (err, apartmentRows, fields) {

                    if (err) throw err;
                    console.log(apartmentRows);
                    response.write("Project and Apartments are :"+JSON.stringify(apartmentRows));
                    totalQueries--; //decreases the query count
                    if (totalQueries == 0) { //when all queries are performed end the response
                        response.end(); }

                    console.log("loop");

                });
            }


        });

}

function userProject(request, response) {

    console.log("Requested URL :" + request.url);
    var id = request.params.userId;
    showAllProjects(id, function (err, output) {

        console.log("Inside showAllProjects");
        // console.log(output);
        response.writeHead(200, {"Content-Type": "text/html;charset=utf-8"});
        response.write("apt are : " + JSON.stringify(output));
        response.end();

    });
}

function showAllProjects(id, callback) {
    console.log("Passed id is :", id);
    connection.query("select rcientity.id , rcientity.name "
            + " from rcientity right join rciuserrole "
            + "on rcientity.id=rciuserrole.rcientity_id  where useraccount_id=" + connection.escape(id) + " and project=true ",
        function (err, rows, fields) {

            if (err) {
                callback(err);
                return;
            }

            for (var i in rows) {

                var aptContainer = [];
                var obj = rows[i];
                connection.query("select rcientity.id , rcientity.name "
                    + " from rcientity right join rciuserrole "
                    + "on rcientity.id=rciuserrole.rcientity_id  where useraccount_id=" + connection.escape(id) +
                    " and (parent_id=" + obj.id + " or rcientity.id=" + obj.id + ")", function (err, apartmentRows) {

                    if (err) {
                        callback(err);
                        return;
                    }

//                    return apartmentRows;
//                    console.log("returning apartmentRows","/n",JSON.stringify(apartmentRows));
                    aptContainer.push(apartmentRows);
                    //  console.log("aptRows :",aptContainer);
                    //  return aptContainer;
                });

            }
            console.log("End of for loop");

        });
}

function projectApartments(request, response) {

    console.log("Request Received");
    console.log("ID :" + request.params.userId);
    connection.query("select rcientity.id , rcientity.name "
        + " from rcientity right join rciuserrole "
        + "on rcientity.id=rciuserrole.rcientity_id  where useraccount_id=' " + request.params.userId + " ' and (apartment=true)  and parent_id=' " + request.params.projectId + " ' ", function (err, rows, fields) {

        console.log("Requested URL :" + request.url);
        response.writeHead(200, {"Content-Type": "text/html;charset=utf-8"});
        response.write("Apartments are : " + JSON.stringify(rows));
        response.end();
    })
}

function apartmentRooms(request, response) {

    console.log("Request Received");
    console.log("ID :" + request.params.userId);
    //	connection.query ("select RCIENTITY_ID from RCIUSERROLE where USERACCOUNT_ID=' " +request.params.userId+" ' ",function(err,result,fields)
    connection.query("select rcientity.id , rcientity.name "
        + " from rcientity right join rciuserrole "
        + "on rcientity.id=rciuserrole.rcientity_id  where useraccount_id=' " + request.params.userId + " ' and (room=true)  and parent_id=' " + request.params.apartmentId + " ' ", function (err, rows, fields) {

        console.log("Requested URL :" + request.url);
        response.writeHead(200, {"Content-Type": "text/html;charset=utf-8"});
        response.write("Rooms are : " + JSON.stringify(rows));
        response.end();
    })
}

var server = restify.createServer({
    name: "Nazar_Server"
});

server.get("/v0/rcis", rciEntity);
server.get("/v0/userAccounts", rciUserAccount);
server.get('/v0/rciMessages/:id', rciMessage);
server.get('/v0/userProjects/:userId', userProjects);
server.get('/v0/projectApartments/:projectId/:userId', projectApartments);
server.get('/v0/apartmentRooms/:apartmentId/:userId', apartmentRooms);

server.listen(8888);
