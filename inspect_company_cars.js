<<<<<<< HEAD
const pool = require('./db');
(async ()=>{
  try{
    const [cols] = await pool.query("SHOW COLUMNS FROM company_cars");
    console.log('COLUMNS:', cols);
    const [rows] = await pool.query('SELECT * FROM company_cars LIMIT 10');
    console.log('ROWS:', rows);
    process.exit(0);
  }catch(err){
    console.error('ERROR:', err.message);
    process.exit(2);
  }
=======
const pool = require('./db');
(async ()=>{
  try{
    const [cols] = await pool.query("SHOW COLUMNS FROM company_cars");
    console.log('COLUMNS:', cols);
    const [rows] = await pool.query('SELECT * FROM company_cars LIMIT 10');
    console.log('ROWS:', rows);
    process.exit(0);
  }catch(err){
    console.error('ERROR:', err.message);
    process.exit(2);
  }
>>>>>>> 749d43b93c75b07192de6f04c21877c6ff7a531e
})();