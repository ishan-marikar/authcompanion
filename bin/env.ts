interface TemplateVars {
  port: number;
  log_level: string;
  log_handler: string;
  origin: string;
  secure: boolean;
  recovery_redirect_url: string;
  db_uri: string;
  key_path: string;
  client_mode: boolean;
  client_origin: string;
  smtp: {
    hostname: string;
    port: number;
    username: string;
    password: string;
    from_address: string;
  };
}

export const envTemplate = (vars: TemplateVars) => {
  return `
######################## NOTE #########################
#*   vars file describes the default AUTHC settings  *#
#*   !!   Uncommented variables are required   !!    *#
#######################################################

################## General Settings ###################
## Port that AUTHC will listen on
PORT=${vars.port}

## Logging Level Settings
LOG_LEVEL=${vars.log_level}
LOG_HANDLER=${vars.log_handler}

## Cross-Origin Resource Sharing (CORS) Settings
ORIGIN=${vars.origin}

## A cookie with the Secure attribute is only sent to the server with an encrypted request over the HTTPS protocol.
## IMPORTANT: change to true before going into production
SECURE=${vars.secure}

## URL used in recovery email to redirect user back to UI for updating their password
## Must be the full URL path
RECOVERY_REDIRECT_URL=${vars.recovery_redirect_url}

#------------------- DB Settings ---------------------#
## DB URI or path to SQLite file
DB_URI=${vars.db_uri}

#------------------- JWT Secrets ---------------------#
## Path to the key used to sign and verify JWTs used for access
KEY_PATH=${vars.key_path}

#------------------- Client Mode ---------------------#
## Use AuthC in Client Mode which makes available UIs for Login, Registration,
## Account Recovery, and Profile
## If false, only the AuthC server APIs are available
CLIENT_MODE=${vars.client_mode}
## After a successful login, register profile update, redirect the user to your main
## application using the supplied URL below. Can be relative URL.
CLIENT_ORIGIN=${vars.client_origin}

#------------------- SMTP Options --------------------#
## SMTP settings for all outbound emails
SMTP_HOSTNAME=${vars.smtp.hostname}
SMTP_PORT=${vars.smtp.port}
SMTP_USERNAME=${vars.smtp.username}
SMTP_PASSWORD=${vars.smtp.password}
FROM_ADDRESS=${vars.smtp.from_address}`;
};
