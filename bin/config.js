const dotenv = require('dotenv');
debugger;
const result = dotenv.config( {path: '/opt/tivibulogserver/.env'} );
if (result.error) {
    throw result.error;
}  
module.exports = {  
  port: process.env.PORT,
};