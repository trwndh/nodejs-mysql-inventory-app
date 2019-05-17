var express = require('express');
var router = express.Router();

var xlsx = require('xlsx');


var conn = require('./conn');
var db = conn.db;
var dbUser = conn.dbUser;
var loggedIn = '';

var resUpload = false;

router.get('/',(req,res,next)=>{
  loggedIn = req.session.loggedIn;
  if(!loggedIn)
  {
    res.redirect('/login');
  }else{
    res.render('datauploader',{
        title:"Data Uploader",
        user:req.session.userDetail,
        isAdmin: req.session.isAdmin,
        resUpload: resUpload,
        resMsg: "Success!",
        resAlert: "success"
    });
  }  
  resUpload = false;
});

router.post('/post',(req,res,next)=>{
    resUpload = true;
    if(Object.keys(req.files).length>0){
        console.log('File found. start uploading');
        let data = req.files.exceldata;
        data.mv('public/dataUploader/dt.xlsx',(err)=>{
            if(err) res.status(500).send(err);
            let dt = xlsx.readFile('public/dataUploader/dt.xlsx');
            let sheetList = dt.SheetNames;
            let ex =xlsx.utils.sheet_to_json(dt.Sheets[sheetList[0]]);
            console.log(ex)
            for(i=0;i<ex.length;i++){
                db.query("insert into tbl_inventory (jenisBarang,namaBarang,kodeBarang,divisi,keterangan,masaBerlaku,createdBy) values (?,?,?,?,?,?,?)", [
                    ex[i].jenisBarang,
                    ex[i].namaBarang,
                    ex[i].kodeBarang,
                    ex[i].divisi,
                    ex[i].keterangan,
                    ex[i].masaBerlaku,
                    req.session.userDetail[0].Name
                ], (err,results)=>{
                    if(err){
                        req.session.xx = "danger"
                        req.session.msg = "Error";
                    } 
                    else{
                        req.session.xx="success"
                        req.session.msg = "Success!";
                    } 
                })
            }
            res.redirect('/uploader');
        });
    }

})

module.exports = router;