// See env.example for documenation of the configs.
// All environment variables go here
import "https://deno.land/x/dotenv@v2.0.0/load.ts"; // Autoload config file

//Server related environment variables
//Authcompanion port
const AUTHPORT = Deno.env.get("PORT");
//CORS Allowed Origin
const ORIGIN = Deno.env.get("ORIGIN");
//Secure Cookie
const SECURE = Deno.env.get("SECURE");

//JWT related environment variables
const KEYPATH = Deno.env.get("KEY_PATH");

//Logging related environment variables
//Log level
const LOGLEVEL = Deno.env.get("LOG_LEVEL");
//Log output handler
const LOGHANDLER = Deno.env.get("LOG_HANDLER");

//Email related environment variables
//SMTP server hostname
const SMTPHOSTNAME = Deno.env.get("SMTP_HOSTNAME");
//SMTP server port
const SMTPPORT = Deno.env.get("SMTP_PORT");
//SMTP user
const SMTPUSER = Deno.env.get("SMTP_USERNAME");
//SMTP user password
const SMTPPASSWORD = Deno.env.get("SMTP_PASSWORD");
//From address for password recovery emails
const FROMADDRESS = Deno.env.get("FROM_ADDRESS");
//URL to use for recovery emails
const RECOVERYURL = Deno.env.get("RECOVERY_REDIRECT_URL");

//Use AuthC in 'Client Mode' which makes available the UIs for Login, Registration,ect.
const CLIENTMODE = Deno.env.get("CLIENT_MODE");
const CLIENTORIGIN = Deno.env.get("CLIENT_ORIGIN");

export default {
  AUTHPORT,
  ORIGIN,
  SECURE,
  KEYPATH,
  LOGLEVEL,
  LOGHANDLER,
  SMTPHOSTNAME,
  SMTPPORT,
  SMTPUSER,
  SMTPPASSWORD,
  FROMADDRESS,
  RECOVERYURL,
  CLIENTMODE,
  CLIENTORIGIN,
};
