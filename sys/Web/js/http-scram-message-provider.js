(function(global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        // CommonJS
        var forge = require('node-forge');
        module.exports = factory(forge);
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(['node-forge'], factory);
    }
} (this, function(forge) {
    "use strict";
    const DEBUG=0
    
    const b64_str = '(?:[A-Za-z0-9+/]{2,}={0,3})';
    const nonce_str= '(?:[-!"#$%&\'()*+./0-9:;<=>?@A-Z\[\\\]^_`a-z{|}~]+)';
    const scheme_regexp = /^([-_a-zA-Z0-9]+) +/;
    const fields_regexp = /^(?:, *)?(?:([^,=]+)=)?([^,]+)/;

    function conslog(name, value) {
        function toHex(str) {
            var hex, i;
            var ret = "";
            for (i=0; i<str.length; i++) {
                hex = str.charCodeAt(i).toString(16);
                ret += ("000"+hex).slice(-2);
            }
        
            return ret
        };
            
        if (DEBUG === 0) {
            return;
        }
        console.log('\t' + name + ': (' + value.length + ' bytes)');
        console.log('\t\t str: ' + value);
        console.log('\t\t b64: ' + forge.util.encode64(value));
        console.log('\t\txStr: ' + toHex(value));    
    }

    var ret = (function () {
        function HTTPSCRAMMessageProvider(digestAlgo, clientKey, serverKey) {
            if (!digestAlgo || !digestAlgo.length)
                throw new Error("Invalid digest algorithm name specified.");
            this.data = {};
            this.message = {};            
            this.digestAlgo = digestAlgo;
            switch (this.digestAlgo) {
                case "sha1":
                    this.digestType = forge.md.sha1;
                    this.digestSize = 20;
                    this.message.scheme = "SCRAM-SHA-1";
                    break;
                case "sha256":
                    this.digestType = forge.md.sha256;
                    this.digestSize = 32;
                    this.message.scheme = "SCRAM-SHA-256";
                    break;
                case "sha512":
                    this.digestType = forge.md.sha512;
                    this.digestSize = 64;
                    this.message.scheme = "SCRAM-SHA-512";
                    break;
                default:
                    throw new Error("Digest algorith '" + digestAlgo + "' unknown.");
            }
            this.data.clientSecret = clientKey;
            this.data.serverSecret = serverKey;
        }
        HTTPSCRAMMessageProvider.normalize = function (password) {
            return password;
        };
        HTTPSCRAMMessageProvider.generateNonce = function (digestSize) {
            var nonce = "";
            var alphabet = '!"#$%&\'()*+-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ\[\\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
            for (var i = 0; i < digestSize; i++)
                nonce += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            return nonce;
        };
        HTTPSCRAMMessageProvider.generateSalt = function (len) {
            var salt = forge.random.getBytesSync(len);
            return nonce;
        };
        HTTPSCRAMMessageProvider.xor = function (left, right) {
            var result = "";
            var i = left.length;
            var j = right.length;
            while (i-- > 0 && j-- > 0)
                result = (parseInt(left.charAt(i), 16) ^ parseInt(right.charAt(j), 16)).toString(16) + result;
            return result;
        };
        HTTPSCRAMMessageProvider.parseMessage = function (input) {
            if (!input || !input.length)
                return null;
            var attributes = {};
            var parts = input.split(',');
            parts.filter(function (part) { return part.length > 2; }).forEach(function (part) {
                var match = /^([a-z])=(.*)$/.exec(part);
                attributes[match[1]] = match[2];
            });
            return attributes;
        };
        HTTPSCRAMMessageProvider.parseHeader = function (header) {
            if (!header || !header.length)
                return null;
            header = header.trim();
            // format: [scheme] [...,][sid=<base64_sid]>,][...,]data=<data_b64>[,...]

            // scheme
            var match = scheme_regexp.exec(header);
            if (!match)
                throw new Error("Syntax error in specified header.");
            var ret={
                "mechanism": match[1]
            };
            while (match) {
                header = header.substr(match[0].length);
                var match = fields_regexp.exec(header);
                if (match) {
                    ret[match[1]] = match[2];
                }
            }
            return ret;
        };

        HTTPSCRAMMessageProvider.prototype.show = function () {
            console.log("============================== data");
            for (var key in this.data) {
                conslog(key, this.data[key]);
            }
            console.log("============================== message");
            for (var msg in this.message) {
                conslog(msg, this.message[msg]);
            }
        }
        HTTPSCRAMMessageProvider.prototype.getClientFirstMessage = function (identity, nonce) {
            if (nonce === void 0) { nonce = null; }
            if (!identity || !identity.length)
                throw new Error("Invalid identity specified.");
            // Retain the first message
            this.data.c_nonce = nonce ? nonce : HTTPSCRAMMessageProvider.generateNonce(this.digestSize);
            this.data.clientFirstMessageBare = "n=" + identity + ",r=" + this.data.c_nonce;
            this.message.clientFirstMessage = "n,," + this.data.clientFirstMessageBare;
            return this.message.clientFirstMessage;
        };
        HTTPSCRAMMessageProvider.prototype.getClientFirstAuthorizationHeader = function (identity, nonce) {
            if (nonce === void 0) { nonce = null; }
            // Get client message
            this.getClientFirstMessage(identity, nonce);
            var msg_b64 = this.message.clientFirstMessage;
            var msg_b64 = forge.util.encode64(msg_b64);
            this.message.clientFirstAuthorizationHeader = this.message.scheme + " data=" + msg_b64;
            return this.message.clientFirstAuthorizationHeader;
        };
        HTTPSCRAMMessageProvider.prototype.getClientFinalMessage = function (serverFirstMessage, password) {
            var parsedMessage = HTTPSCRAMMessageProvider.parseMessage(serverFirstMessage);
            if (!parsedMessage.r)
                throw new Error("No nonce (r) specified by server.");
            if (0 != parsedMessage.r.indexOf(this.data.c_nonce)) {
                throw new Error("Wrong nonce: '" + this.data.c_nonce + "'");
            }
            if (!parsedMessage.s)
                throw new Error("No salt (s) specified by server.");
            if (!parsedMessage.i)
                throw new Error("No iteration count (i) specified by server.");
            // store data from server
            this.message.serverFirstMessage = serverFirstMessage;
            conslog('message nonce', parsedMessage.r);
            this.data.s_nonce = parsedMessage.r.substr(this.data.c_nonce.length);
            this.data.salt = forge.util.decode64(parsedMessage.s);
            this.data.iteration = parsedMessage.i;

            // message without proof
            this.data.clientFinalMessageWithoutProof = "c=biws,r=" + parsedMessage.r;

            // client key
            conslog('password', password);
            this.getSaltedPassword(password, this.data.salt, this.data.iteration);
            this.getClientKey(this.data.saltedPassword, this.data.clientSecret);
            this.getStoredKey(this.data.clientKey);

            // client signature
            this.data.authMessage = [this.data.clientFirstMessageBare, this.message.serverFirstMessage, this.data.clientFinalMessageWithoutProof].join(",");
            this.getClientSignature(this.data.storedKey, this.data.authMessage);

            // proof
            this.data.clientProof = forge.util.hexToBytes(HTTPSCRAMMessageProvider.xor(forge.util.bytesToHex(this.data.clientKey), forge.util.bytesToHex(this.data.clientSignature)));

            // client final message
            this.message.clientFinalMessage = this.data.clientFinalMessageWithoutProof + ",p=" + forge.util.encode64(this.data.clientProof);    
        };
        HTTPSCRAMMessageProvider.prototype.getClientFinalAuthorizationHeader = function (responseHeader, secret) {
            // get data from the header
            var parsedHeader = HTTPSCRAMMessageProvider.parseHeader(responseHeader);

            if (parsedHeader.mechanism !== this.message.scheme) {
                throw new Error('SCHEME ERROR: authentication not using ' + this.message.scheme);
            }
            if (!("data" in parsedHeader)) {
                throw new Error("FORMAT ERROR: no 'data=' in 'WWW-authentication' header\n\t" + responseHeader);
            }
            parsedHeader.data=forge.util.decode64(parsedHeader.data);
            this.getClientFinalMessage(parsedHeader.data, secret);
			this.message.clientFinalAuthorizationHeader = forge.util.encode64(this.message.clientFinalMessage);
			return this.message.scheme + " data=" + this.message.clientFinalAuthorizationHeader;

        };
        HTTPSCRAMMessageProvider.prototype.validateFinalAuthorization = function (serverFinalMessage) {
            var parsedMessage = HTTPSCRAMMessageProvider.parseMessage(serverFinalMessage);
            if (!parsedMessage.v)
                throw new Error("No verifier (v) specified by server.");

            // store data from server
            this.message.serverFinalMessage = serverFinalMessage;

            // decode server signature
            var serverSignature = forge.util.decode64(parsedMessage.v);
            conslog('recovered server signature', serverSignature);

            // compute server signature
            this.getServerKey(this.data.saltedPassword, this.data.serverSecret);
            this.getServerSignature(this.data.serverKey, this.data.authMessage);

            this.data.serverIsValid = this.data.serverSignature === serverSignature;
        }
        HTTPSCRAMMessageProvider.prototype.validateFinalAuthorizationHeader = function (responseHeader) {
            // get data from the header
            var parsedHeader = HTTPSCRAMMessageProvider.parseHeader(responseHeader);
            if (parsedHeader.mechanism !== this.message.scheme) {
                throw new Error('SCHEME ERROR: authentication not using ' + this.message.scheme);
            }
            if (!("data" in parsedHeader)) {
                throw new Error("FORMAT ERROR: no 'data=' in 'WWW-authentication' header\n\t" + responseHeader);
            }
            parsedHeader.data=forge.util.decode64(parsedHeader.data);
            this.validateFinalAuthorization(parsedHeader.data);
            return this.data.serverIsValid;
        }
        HTTPSCRAMMessageProvider.prototype.getSaltedPassword = function (password, salt, iterationCount) {
            if ("saltedPassword" in this.data) {
                return;
            }
            this.data.saltedPassword = forge.pkcs5.pbkdf2(HTTPSCRAMMessageProvider.normalize(password), salt, iterationCount, this.digestSize, this.digestType.create());
        };
        HTTPSCRAMMessageProvider.prototype.getClientKey = function (saltedPassword, clientSecret) {
            if ("clientKey" in this.data) {
                return;
            }
            var hmac = forge.hmac.create();
            hmac.start(this.digestAlgo, saltedPassword);
            hmac.update(clientSecret);
            this.data.clientKey = hmac.digest().getBytes();
        };
        HTTPSCRAMMessageProvider.prototype.getServerKey = function (saltedPassword, serverSecret) {
            if ("serverKey" in this.data) {
                return;
            }
            var hmac = forge.hmac.create();
            hmac.start(this.digestAlgo, saltedPassword);
            hmac.update(serverSecret);
            this.data.serverKey = hmac.digest().getBytes();
        };
        HTTPSCRAMMessageProvider.prototype.getStoredKey = function (clientKey) {
            if ("storedKey" in this.data) {
                return;
            }
            var md = this.digestType.create();
            md.update(clientKey);
            this.data.storedKey = md.digest().getBytes();
        };
        HTTPSCRAMMessageProvider.prototype.getClientSignature = function (storedKey, authenticationMessage) {
            if ("clientSignature" in this.data) {
                return;
            }
            var hmac = forge.hmac.create();
            hmac.start(this.digestAlgo, storedKey);
            hmac.update(authenticationMessage);
            this.data.clientSignature = hmac.digest().getBytes();
        };
        HTTPSCRAMMessageProvider.prototype.getServerSignature = function (serverKey, authenticationMessage) {
            if ("serverSignature" in this.data) {
                return;
            }
            var hmac = forge.hmac.create();
            hmac.start(this.digestAlgo, serverKey);
            hmac.update(authenticationMessage);
            this.data.serverSignature = hmac.digest().getBytes();
        };
        return HTTPSCRAMMessageProvider;
    }());

    return ret;
}));