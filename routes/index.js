var express = require('express');
var router = express.Router();
var conn = require('./conn');

let db = conn.db;
let dbUser = conn.dbUser;
let loggedIn;

var resInsert = false;
/* setInterval(function () {
    db.query('SELECT 1');
    console.log('refreshing database');
}, 5000);
*/
/* GET home page. */
router.get('/', function(req, res, next) {
  loggedIn = req.session.loggedIn;
  if(!loggedIn)
  {
    res.redirect('/login');
  }else{
    res.redirect('/dashboard');
  }  
});


router.get('/login',(req,res,next)=>{
  if(loggedIn){
    res.redirect('/');
    return false;
  }
  else{
    res.render('login',{message: req.session.msg});
    req.session.msg = '';
  } 
    
})

router.get('/logout',(req,res,next)=>{
  req.session.destroy((err)=>{
    if(err) throw err;
    res.redirect('/');
  })
})

router.post('/auth',(req,res,next)=>{
  let query = "SELECT * FROM ptw_user WHERE NIP = ? and user_password = ? ";
  let execute = dbUser.query(query,[req.body.nip, req.body.password],(err,results)=>{
    if(err)
      throw err;
    else{
      if(results.length < 1){
        req.session.msg = " Login Failed ";
        res.redirect('/login');
      }
      else{
        req.session.loggedIn = true;
        loggedIn = req.session.loggedIn;
        if(results[0].Divisi === "Teknologi Informasi")
          req.session.isAdmin = true;
          
        req.session.userDetail = results;
        res.redirect('/dashboard');
      }
    }
  });
})


router.get('/dashboard',(req,res,next)=>{
  if(!loggedIn) {
    res.redirect('/login');
  }
  else{
    res.render('dashboard', {
      title:"Dashboard",
      user:req.session.userDetail
    });
  }
  
})

router.get('/inventory', (req,res,next)=> {
  res.redirect('/inventory/list')
})
router.get('/inventory/list', (req,res,next)=> {
  if(!loggedIn)
  {
    res.redirect('/login');
  }
  else{
    if(req.session.isAdmin)
      var query = "SELECT *, DATE(masaBerlaku) as msbrlk FROM tbl_inventory  WHERE jenisBarang = 'Software'";
    else
      var query = "SELECT *, DATE(masaBerlaku) as msbrlk FROM tbl_inventory WHERE divisi = ? AND jenisBarang = 'Software'";
    db.query(query,[req.session.userDetail[0].Divisi],(err,results)=>{
      if(err)
        throw err;
      res.render('inventory/list',{
        title:"List Inventory",
        data:results, 
        user:req.session.userDetail,
        isAdmin: req.session.isAdmin
      });
    })
  }
  
})
router.get('/inventory/list_hardware', (req,res,next)=> {
  if(!loggedIn)
  {
    res.redirect('/login');
  }
  else{
    if(req.session.isAdmin)
      var query = "SELECT *, DATE(masaBerlaku) as msbrlk FROM tbl_inventory WHERE jenisBarang = 'Hardware'";
    else{
      var query = "SELECT *, DATE(masaBerlaku) as msbrlk FROM tbl_inventory WHERE divisi = ? and jenisBarang = 'Hardware'";
    }
    if(req.session.userDetail[0].Divisi=='Struktur'){
      var Divisi = 'Structure'
    }else var Divisi = req.session.userDetail[0].Divisi
    db.query(query,Divisi,(err,results)=>{
      if(err)
        throw err;
      res.render('inventory/listhardware',{
        title:"List Inventory Hardware",
        data:results, 
        user:req.session.userDetail,
        isAdmin: req.session.isAdmin,
        divisi: req.session.userDetail[0].Divisi
      });
    })
  }
  
})

router.get('/inventory/add',(req,res,next)=>{
  if(!loggedIn)
  {
    res.redirect('/login');
  }
  else{
    let listDivisi;
    let queryDivisi = "SELECT DISTINCT(Divisi) FROM ptw_user"; // list semua divisi
    dbUser.query(queryDivisi,null,(err,results)=>{
      if(err) throw err;
      else{
        res.render('inventory/add',{
          title:"Add Inventory", 
          user: req.session.userDetail,
          divisi: results,
          isAdmin : req.session.isAdmin,
          resInsert : resInsert,
          resAlert : req.session.alert,
          resMsg : req.session.msg,
        });
        resInsert = false;
      }
      
    })
  }
  
  ;
})

router.post('/inventory/add',(req,res,next)=>{
  resInsert = true;
  let ifexists = db.query("SELECT * FROM tbl_inventory WHERE kodeBarang = ?",[req.body.kodeBarang],(err,results)=>{
    if(err) throw err;
    if(results.length > 0){ // if exists
      req.session.alert = 'danger';
      req.session.msg='Error! Kode Barang '+req.body.kodeBarang+' sudah digunakan untuk item '+results[0].namaBarang;
      res.redirect('/inventory/add');
    }
    else{
     
      let queryAdd = "insert into tbl_inventory(namaBarang,kodeBarang,jenisBarang,divisi,keterangan,serial,masaBerlaku,createdBy) Values (?,?,?,?,?,?,?,?)";
      db.query(queryAdd,[
          req.body.namaBarang,
          req.body.kodeBarang,
          req.body.jenisBarang,
          req.body.divisi,
          req.body.keterangan,
          req.body.serial,
          req.body.masaBerlaku,
          req.session.userDetail[0].Name
        ],(err,results)=>{
          if(err) throw err;
          if(results.affectedRows> 0){ // if success
             
           
            //if file exist
            if(Object.keys(req.files).length > 0){
              console.log('File detected, start uploading..');
              var filenya = req.files.pathFile;
              filenya.mv('public/images/uploadedInvoice/'+req.body.kodeBarang+".pdf",(err)=>{
                if(err) res.status(500).send(err);
                else{
                  console.log('File uploaded..');
                  // update the record
                  var id = results.insertId;
                  let queryUpdate = "UPDATE tbl_inventory SET pathFile = ? WHERE id = ?";
                  db.query(queryUpdate,['/images/uploadedInvoice/'+req.body.kodeBarang+".pdf", id],(err,hasil)=>{
                    if(err) throw err;
                  })
                }
              });
            }


            req.session.alert = 'success';
            req.session.msg='Data berhasil ditambahkan';
            };
            res.redirect('/inventory/add');
        })
    }
  })
});

router.get('/inventory/edit/', (req,res,next)=>{
  res.redirect('/inventory')
});
router.get('/inventory/edit/:id', (req,res,next)=>{
  if(!loggedIn)
  {
    res.redirect('/login');
  }
  else{
    let queryDivisi = "SELECT DISTINCT(Divisi) FROM ptw_user WHERE Divisi <> 'Struktur'    UNION SELECT  'Structure' "; // list semua divisi
    var queryDetail = "SELECT * FROM tbl_inventory WHERE id = ?";
    var listDivisi;

    db.query(queryDetail,[req.params.id],(err,resultx)=>{
      if(err) throw err;
      
      dbUser.query(queryDivisi,null,(err,results)=>{
        if(err) throw err;
        listDivisi = results;
        res.render('inventory/edit',{
          title:'Edit Item',
          user: req.session.userDetail,
          isAdmin: req.session.isAdmin,
          divisi: listDivisi,
          itemDetail : resultx[0],
          resInsert : resInsert,
          id:req.params.id,
          isAdmin : req.session.isAdmin,
          resAlert : req.session.alert,
          resMsg : req.session.msg,
        });
        console.log(resultx)
        resInsert = false;
      })
    
    })
  }
})

router.post('/inventory/edit/:id',(req,res,next)=>{
  if(!loggedIn)
  {
    res.redirect('/login');
  }
  else{
    resInsert = true;
    let ifexists = db.query("SELECT * FROM tbl_inventory WHERE kodeBarang = ? and id <> ?",[req.body.kodeBarang, req.params.id],(err,results)=>{
    if(err) throw err;
    if(results.length > 0){ // if exists
      req.session.alert = 'danger';
      req.session.msg='Error! Kode Barang '+req.body.kodeBarang+' sudah digunakan untuk item '+results[0].namaBarang;
      res.redirect('/inventory/edit/'+req.params.id);
    }
    else{
      let queryEdit = "update tbl_inventory set namaBarang=?, kodeBarang=?,jenisBarang=?,divisi=?,keterangan=?,serial=?,masaBerlaku=? where id=?"
    
      db.query(queryEdit,[
          req.body.namaBarang,
          req.body.kodeBarang,
          req.body.jenisBarang,
          req.body.divisi,
          req.body.keterangan,
          req.body.serial,
          req.body.masaBerlaku,
          req.params.id
        ],(err,results)=>{
          if(err) throw err;
          if(results.affectedRows> 0){ // if success
             
           
            //if file exist
            if(Object.keys(req.files).length > 0){
              console.log('File detected, start uploading..');
              var filenya = req.files.pathFile;
              filenya.mv('public/images/uploadedInvoice/'+req.body.kodeBarang+".pdf",(err)=>{
                if(err) res.status(500).send(err);
                else{
                  console.log('File uploaded..');
                  // update the record
                  var id = req.params.id;
                  let queryUpdate = "UPDATE tbl_inventory SET pathFile = ? WHERE id = ?";
                  db.query(queryUpdate,['/images/uploadedInvoice/'+req.body.kodeBarang+".pdf", id],(err,hasil)=>{
                    if(err) throw err;
                  })
                }
              });
            }


            req.session.alert = 'success';
            req.session.msg='Data berhasil ditambahkan';
            };
            res.redirect('/inventory/edit/'+req.params.id);
        })
    }
  })
  }
})

var isDeleted = false;

router.get('/inventory/delete/:id',(req,res,next)=>{
  if(!loggedIn)
  {
    res.redirect('/login');
  }
  else{
    //check if exist this item
 

    res.render('inventory/delete',{
      title:'Delete Item',
      user: req.session.userDetail,
      isAdmin: req.session.isAdmin,
      id:req.params.id,
      isDeleted:isDeleted,
      resAlert:req.session.resAlert,
      resMsg:req.session.resMsg
    })
  }
  
  isDeleted = false;
})

router.get('/inventory/delete/:id/confirm',(req,res)=>{
  if(!loggedIn){
    res.redirect('/login')
  }
  else{
    let queryDelete = "DELETE from tbl_inventory WHERE id = ?";
    db.query(queryDelete,[req.params.id],(err,results)=>{
      if(err) throw err;
      if(results.affectedRows > 0){
        //success
        req.session.resAlert = "success";
        req.session.resMsg = "Item Berhasil Dihapus"
        isDeleted = true;
        res.redirect('/inventory/delete/'+req.params.id)
      }
      else{
        req.session.resAlert = "danger";
        req.session.resMsg = "Error "
        isDeleted = true;
        res.redirect('/inventory/delete/'+req.params.id)
      }
    })
  }
})

function isLoggedIn(req,res,next){
  if(req.session.loggedIn)
    return true;
  else {
    res.redirect('/login');
    next();
    return false;
  } 
}

router.get('/ajax/cekKetersediaan/:kode',(req,res,next)=>{
  let kodeBarang = req.params.kode;
  var data = {};
  db.query("SELECT * FROM tbl_inventory WHERE kodeBarang = ?",[kodeBarang],(err,results)=>{
    if(err) throw err;
    if(results.length > 0){
      res.json({res:'Error. Kode ini sudah digunakan'});
    }
    else res.json({res:'Kode ini dapat digunakan'});
  })
})


module.exports = router;
