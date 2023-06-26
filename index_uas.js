const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('./config/databases');
const app = express();
const PORT = process.env.PORT || 5000;

const multer = require('multer')
const path = require('path')
var cors = require('cors');

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
    origin: '*'
}));

// script upload

app.use(express.static("./public"))
 //! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});
 

 

// create data / insert data
app.post('/api/stok_baju',upload.single('image'),(req, res) => {
    const data = { ...req.body };
    const id_baju = req.body.id_baju;
    const nama_baju = req.body.nama_baju;
    const harga_baju = req.body.harga_baju;

    if (!req.file) {
        console.log("No file upload");
        const querySql = 'INSERT INTO stok_baju (id_baju,nama_baju,harga_baju) values (?,?,?);';
         
        // jalankan query
        koneksi.query(querySql,[ id_baju,nama_baju,harga_baju], (err, rows, field) => {
            // error handling
            if (err) {
                return res.status(500).json({ message: 'Gagal insert data!', error: err });
            }
       
            // jika request berhasil
            res.status(201).json({ success: true, message: 'Berhasil insert data!' });
        });
    } else {
        console.log(req.file.filename)
        var imgsrc = 'http://localhost:5000/images/' + req.file.filename;
        const foto_baju =   imgsrc;
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySql = 'INSERT INTO stok_baju (id_baju,nama_baju,foto_baju,harga_baju) values (?,?,?,?);';
 
// jalankan query
koneksi.query(querySql,[ id_baju,nama_baju,foto_baju,harga_baju], (err, rows, field) => {
    // error handling
    if (err) {
        return res.status(500).json({ message: 'Gagal insert data!', error: err });
    }

    // jika request berhasil
    res.status(201).json({ success: true, message: 'Berhasil insert data!' });
});
}
});




// read data / get data
app.get('/api/stok_baju', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM stok_baju';

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});


// update data
app.put('/api/stok_baju/:id_baju', (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM stok_baju WHERE id_baju = ?';
    const id_baju = req.body.id_baju;
    const nama_baju = req.body.nama_baju;
    const harga_baju = req.body.harga_baju;

    const queryUpdate = 'UPDATE stok_baju SET nama_baju=?,harga_baju=? WHERE id_baju = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.id_baju, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query update
            koneksi.query(queryUpdate, [nama_baju,harga_baju, req.params.id_baju], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// delete data
app.delete('/api/stok_baju/:id_baju', (req, res) => {
    // buat query sql untuk mencari data dan hapus
    const querySearch = 'SELECT * FROM stok_baju WHERE id_baju = ?';
    const queryDelete = 'DELETE FROM stok_baju WHERE id_baju = ?';

    // jalankan query untuk melakukan pencarian data
    koneksi.query(querySearch, req.params.id_baju, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            koneksi.query(queryDelete, req.params.id_baju, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika delete berhasil
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));