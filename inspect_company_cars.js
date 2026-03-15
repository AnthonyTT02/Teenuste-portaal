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
})();