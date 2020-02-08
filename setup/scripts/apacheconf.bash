#!/bin/bash

IP=$(hostname -I | tr -d " ")
PROJECT_NAME=$(hostname | cut -f1 -d"-")
PROJECT_DIR=/var/www/$PROJECT_NAME

echo "Protocols h2 http/1.1
ServerSignature Off
ServerTokens Prod

<VirtualHost $IP:80>
        Redirect 302 / https://$(hostname).fso.arizona.edu
        ServerName $(hostname).fso.arizona.edu
</VirtualHost>

<VirtualHost $IP:443>
        ServerAdmin fso-system-alerts@fso.arizona.edu
        ServerName $(hostname).fso.arizona.edu

        SSLEngine               on
        SSLCertificateFile      /etc/ssl/certs/$(hostname).fso.arizona.edu.cer
        SSLCertificateKeyFile   /etc/ssl/certs/$(hostname).fso.arizona.edu.key
        SSLCertificateChainFile /etc/ssl/certs/$(hostname).fso.arizona.edu.interm.cer
        SSLProtocol             all -SSLv3 -TLSv1 -TLSv1.1
        SSLHonorCipherOrder     on
        SSLCipherSuite          ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256
        SSLCompression          off
        SSLSessionTickets       off

        SSLUseStapling          on
        SSLStaplingResponderTimeout 5
        SSLStaplingReturnResponderErrors off

        # mod_head must be enabled
        Header always set Strict-Transport-Security \"max-age=15768000; includeSubDomains\"
        
        WSGIDaemonProcess $(hostname).fso.arizona.edu display-name=%{GROUP} python-home=$PROJECT_DIR/.virtualenvs/$PROJECT_NAME/
        WSGIScriptAlias / $PROJECT_DIR/$PROJECT_NAME/config/apachewsgi.py process-group=$(hostname).fso.arizona.edu application-group=%{GLOBAL}

        Alias /favicon.ico $PROJECT_DIR/$PROJECT_NAME/$PROJECT_NAME/static/images/favicon.ico
        Alias /static/ $PROJECT_DIR/$PROJECT_NAME/staticfiles/
        Alias /media/ $PROJECT_DIR/$PROJECT_NAME/media/

        <Directory $PROJECT_DIR/$PROJECT_NAME/staticfiles>
                Require all granted
        </Directory>

        <Directory $PROJECT_DIR/$PROJECT_NAME/$PROJECT_NAME/media>
                Require all granted
        </Directory>

        <Directory $PROJECT_DIR/$PROJECT_NAME/config>
                <Files apachewsgi.py>
                        Require all granted
                </Files>
        </Directory>

        # Shibboleth configuration for lazy sessions
        <Location /Shibboleth.sso>
            SetHandler shib
        </Location>

        <Location />
            AuthType shibboleth
            ShibRequestSetting requireSession 1
            Require valid-user
        </Location>

        LogLevel warn
        ErrorLog \${APACHE_LOG_DIR}/ssl_error.log
        CustomLog \${APACHE_LOG_DIR}/ssl_access.log combined
</VirtualHost>

SSLStaplingCache shmcb:/var/run/ocsp(128000)
UseCanonicalName on" > /etc/apache2/sites-enabled/000-default.conf

exit 0
