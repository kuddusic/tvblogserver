const dotenv = require('dotenv');
debugger;
const result = dotenv.config();
if (result.error) {
    throw result.error;
}  
module.exports = {  
  port: process.env.PORT,
};