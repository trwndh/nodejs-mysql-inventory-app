var express = require('express');
var mysql = require('mysql');


// MySQL stuff here
let db = mysql.createConnection({
    host:'192.168.16.16',
    user:'root',
    password:'',
    dateStrings:'date',
    database:'ptw_it'
  });
  
let dbUser = mysql.createConnection({
    host:'192.168.16.16',
    user:'root',
    password:'',
    database:'ptw_administrasi'
})

db.connect((err)=>{
    if(err)
        throw err;
    else console.log('db connection OK');
})

dbUser.connect((err)=>{
    if(err)
        throw err;
    else console.log('dbUser connection OK');
})

module.exports = {
    db:db, dbUser:dbUser
}