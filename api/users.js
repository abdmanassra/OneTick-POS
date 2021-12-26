const app = require( "express")();
const bodyParser = require( "body-parser" );
const btoa = require('btoa');
app.use( bodyParser.json() );

module.exports = app;
//using firebase
var firebase = require('./firebaseConfig');
const usersDb = firebase.db.collection('accounts').doc('afc').collection('users'); 
let customerStatus = "disabled";
firebase.db.collection('accounts').doc('afc').get()
    .then(result => 
        customerStatus = result.data().status
        );
//end using firebase


app.get( "/", function ( req, res ) {
    console.log({customerStatus});
    res.send( "Users API" );
} );


  
app.get( "/user/:userId", function ( req, res ) {
    if ( !req.params.userId ) {
        res.status( 500 ).send( "ID field is required." );
    }
    else{
        usersDb.doc(req.params.userId).get()
        .then((querySnapshot) => {
            var userDetails = {_id: req.params.userId.toString(), ...querySnapshot.data()};
              console.log({userDetails});
            res.send(userDetails);
        });
    }
} );

app.get( "/logout/:userId", function ( req, res ) {
    if ( !req.params.userId ) {
        res.status( 500 ).send( "ID field is required." );
    }
    else
    { 
        usersDb.doc(req.params.userId).update({status: 'Logged Out_'+ new Date()});
        res.sendStatus( 200 );
    }
});



app.post( "/login", async function ( req, res ) {
    firebase.db.collection('accounts').doc('afc').get()
    .then(result => 
        customerStatus = result.data().status
        );

    if (customerStatus != 'active') {
        res.send("disabled");
    }
    let query = usersDb.where("username", "==", req.body.username).where("password", "==", btoa(req.body.password));
    const result = query.get().then(querySnapshot => {
        if (querySnapshot.size > 0) {

          const data = querySnapshot.docs.map(documentSnapshot => {
            return { _id: documentSnapshot.id.toString(), ...documentSnapshot.data() }
          });
          //update user status 
          usersDb.doc(data[0]._id).update({status: 'Logged In_'+ new Date()});
          console.log(data[0]);
          res.send(data[0]);
        } else {
            res.send(null);
        }
    }).catch(err => {
        console.log(err);
    });
} );

app.get( "/all", function ( req, res ) {
    usersDb.get()
        .then((querySnapshot) => {
            const tempDoc = querySnapshot.docs.map((doc) => {
                return { _id: doc.id.toString(), ...doc.data() }
              })
            res.send(tempDoc);
        });
} );

app.get("/checkStatus", function(req, res) {
    //get status
    firebase.db.collection('accounts').doc('afc').get()
    .then(result => 
        customerStatus = result.data().status
        );

    console.log({customerStatus});
    if (customerStatus != 'active') {
        res.send(500);
    }
    else
    {
        res.send(200);
    }
});

app.delete( "/user/:userId", function ( req, res ) {
    usersDb.doc(req.params.userId).delete().then(() => {
        console.log("Document successfully deleted!");
        res.sendStatus( 200 );
    }).catch((error) => {
        console.error("Error removing document: ", error);
        res.status( 500 ).send( error );
    });
} );

 
app.post( "/post" , async function ( req, res ) {  
    let User = { 
            "username": req.body.username,
            "password": btoa(req.body.password),
            "fullname": req.body.fullname,
            "perm_products": req.body.perm_products == "on" ? 1 : 0,
            "perm_categories": req.body.perm_categories == "on" ? 1 : 0,
            "perm_transactions": req.body.perm_transactions == "on" ? 1 : 0,
            "perm_users": req.body.perm_users == "on" ? 1 : 0,
            "perm_settings": req.body.perm_settings == "on" ? 1 : 0,
            "status": ""
          }

    if(req.body.id == "") { 
       const createdUser = await usersDb.add(User);
       if (createdUser.id != null || createdUser.id != undefined) {
        res.send(User);
       }
       console.log("it's id:", createdUser.id);
    }
    else { 
        usersDb.doc(req.body.id).update(User)
        .then(res.sendStatus(200))
        .catch(err => {
            res.status( 500 ).send(err)
        });
    }

});


app.get( "/check", async function ( req, res ) {
    var document = await usersDb.doc('1').get();
    console.log("this is document id ", document.exists);

    if (!document.exists) {
        let User = { 
            "username": "admin",
            "password": btoa("admin"),
            "fullname": "Administrator",
            "perm_products": 1,
            "perm_categories": 1,
            "perm_transactions": 1,
            "perm_users": 1,
            "perm_settings": 1,
            "status": "1"
          }
          usersDb.doc('1').set(User);
    }
} );
 