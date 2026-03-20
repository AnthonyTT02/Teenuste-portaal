<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
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
>>>>>>> f6dfbbf69b75ceb173df6b2e55d64e1943954ee2
>>>>>>> 6f3e1231dbbf21d9e9191af2350e9486e8609650
})();