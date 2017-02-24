/*
 * RSA Encryption / Decryption with PKCS1 v2 Padding.
 * 
 * Copyright (c) 2003-2005  Tom Wu
 * All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
 * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
 * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
 *
 * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
 * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
 * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * In addition, the following condition applies:
 *
 * All redistributions must retain an intact copy of this copyright notice
 * and disclaimer.
 */

var BigInteger = require("./jsbn.js");
var SecureRandom = require("./rng.js");
var B64 = require("./b64.js");

// convert a (hex) string to a bignum object
function parseBigInt(str, r) {
	return new BigInteger(str, r);
}

// display a string with max n characters per line
// this is use to format the input for openssl
function linebrk(s, n) {
	var ret = "";
	var i = 0;
	while (i + n < s.length) {
		ret += s.substring(i, i + n) + "\n";
		i += n;
	}
	return ret + s.substring(i, s.length);
}

function byte2Hex(b) {
	if (b < 0x10)
		return "0" + b.toString(16);
	else
		return b.toString(16);
}

// PKCS#1 (type 2, random) pad input string s to n bytes, and return a bigint
function pkcs1pad2(s, n) {
	if (n < s.length + 11) { // TODO: fix for utf-8
		throw new Error("Message too long for RSA (n=" + n + ", l=" + s.length
				+ ")");
		return null;
	}
	var ba = new Array();
	var i = s.length - 1;
	while (i >= 0 && n > 0) {
		var c = s.charCodeAt(i--);
		if (c < 128) { // encode using utf-8
			ba[--n] = c;
		} else if ((c > 127) && (c < 2048)) {
			ba[--n] = (c & 63) | 128;
			ba[--n] = (c >> 6) | 192;
		} else {
			ba[--n] = (c & 63) | 128;
			ba[--n] = ((c >> 6) & 63) | 128;
			ba[--n] = (c >> 12) | 224;
		}
	}
	ba[--n] = 0;
	var rng = new SecureRandom();
	var x = new Array();
	while (n > 2) { // random non-zero pad
		x[0] = 0;
		while (x[0] == 0)
			rng.nextBytes(x);
		ba[--n] = x[0];
	}
	ba[--n] = 2;
	ba[--n] = 0;
	return new BigInteger(ba);
}

// "empty" RSA key constructor
function RSAKey() {
	this.n = null;
	this.e = 0;
	this.d = null;
	this.p = null;
	this.q = null;
	this.dmp1 = null;
	this.dmq1 = null;
	this.coeff = null;
}

// Set the public key fields N and e from hex strings
function RSASetPublic(N, E) {
	if (N != null && E != null && N.length > 0 && E.length > 0) {
		this.n = parseBigInt(N, 16);
		this.e = parseInt(E, 16);
	} else
		alert("Invalid RSA public key");
}

// Perform raw public operation on "x": return x^e (mod n)
function RSADoPublic(x) {
	return x.modPowInt(this.e, this.n);
}

// Return the PKCS#1 RSA encryption of "text" as an even-length hex string
function RSAEncrypt(text) {
	var m = pkcs1pad2(text, (this.n.bitLength() + 7) >> 3);
	if (m == null)
		return null;
	var c = this.doPublic(m);
	if (c == null)
		return null;
	var h = c.toString(16);
	if ((h.length & 1) == 0)
		return h;
	else
		return "0" + h;
}

// Return the PKCS#1 RSA encryption of "text" as a Base64-encoded string
// function RSAEncryptB64(text) {
// var h = this.encrypt(text);
// if(h) return hex2b64(h); else return null;
// }

// Undo PKCS#1 (type 2, random) padding and, if valid, return the plaintext
function pkcs1unpad2(d, n) {
	var b = d.toByteArray();
	var i = 0;
	while (i < b.length && b[i] == 0)
		++i;
	if (b.length - i != n - 1 || b[i] != 2)
		return null;
	++i;
	while (b[i] != 0)
		if (++i >= b.length)
			return null;
	var ret = "";
	while (++i < b.length) {
		var c = b[i] & 255;
		if (c < 128) { // utf-8 decode
			ret += String.fromCharCode(c);
		} else if ((c > 191) && (c < 224)) {
			ret += String.fromCharCode(((c & 31) << 6) | (b[i + 1] & 63));
			++i;
		} else {
			ret += String.fromCharCode(((c & 15) << 12)
					| ((b[i + 1] & 63) << 6) | (b[i + 2] & 63));
			i += 2;
		}
	}
	return ret;
}

// Set the private key fields N, e, and d from hex strings
function RSASetPrivate(N, E, D) {
	if (N != null && E != null && N.length > 0 && E.length > 0) {
		this.n = parseBigInt(N, 16);
		this.e = parseInt(E, 16);
		this.d = parseBigInt(D, 16);
	} else
		alert("Invalid RSA private key");
}

// Set the private key fields N, e, d and CRT params from hex strings
function RSASetPrivateEx(N, E, D, P, Q, DP, DQ, C) {
	if (N != null && E != null && N.length > 0 && E.length > 0) {
		this.n = parseBigInt(N, 16);
		this.e = parseInt(E, 16);
		this.d = parseBigInt(D, 16);
		this.p = parseBigInt(P, 16);
		this.q = parseBigInt(Q, 16);
		this.dmp1 = parseBigInt(DP, 16);
		this.dmq1 = parseBigInt(DQ, 16);
		this.coeff = parseBigInt(C, 16);
	} else
		alert("Invalid RSA private key");
}

// Generate a new random private key B bits long, using public expt E
function RSAGenerate(B, E) {
	var rng = new SecureRandom();
	var qs = B >> 1;
	this.e = parseInt(E, 16);
	var ee = new BigInteger(E, 16);
	for (;;) {
		for (;;) {
			this.p = new BigInteger(B - qs, 1, rng);
			if (this.p.subtract(BigInteger.ONE).gcd(ee).compareTo(
					BigInteger.ONE) == 0
					&& this.p.isProbablePrime(10))
				break;
		}
		for (;;) {
			this.q = new BigInteger(qs, 1, rng);
			if (this.q.subtract(BigInteger.ONE).gcd(ee).compareTo(
					BigInteger.ONE) == 0
					&& this.q.isProbablePrime(10))
				break;
		}
		if (this.p.compareTo(this.q) <= 0) {
			var t = this.p;
			this.p = this.q;
			this.q = t;
		}
		var p1 = this.p.subtract(BigInteger.ONE);
		var q1 = this.q.subtract(BigInteger.ONE);
		var phi = p1.multiply(q1);
		if (phi.gcd(ee).compareTo(BigInteger.ONE) == 0) {
			this.n = this.p.multiply(this.q);
			this.d = ee.modInverse(phi);
			this.dmp1 = this.d.mod(p1);
			this.dmq1 = this.d.mod(q1);
			this.coeff = this.q.modInverse(this.p);
			break;
		}
	}
}

// Perform raw private operation on "x": return x^d (mod n)
function RSADoPrivate(x) {
	if (this.p == null || this.q == null)
		return x.modPow(this.d, this.n);

	// TODO: re-calculate any missing CRT params
	var xp = x.mod(this.p).modPow(this.dmp1, this.p);
	var xq = x.mod(this.q).modPow(this.dmq1, this.q);

	while (xp.compareTo(xq) < 0)
		xp = xp.add(this.p);
	return xp.subtract(xq).multiply(this.coeff).mod(this.p).multiply(this.q)
			.add(xq);
}

// Return the PKCS#1 RSA decryption of "ctext".
// "ctext" is an even-length hex string and the output is a plain string.
function RSADecrypt(ctext) {
	var c = parseBigInt(ctext, 16);
	var m = this.doPrivate(c);
	if (m == null)
		return null;
	return pkcs1unpad2(m, (this.n.bitLength() + 7) >> 3);
}

// Return the PKCS#1 RSA decryption of "ctext".
// "ctext" is a Base64-encoded string and the output is a plain string.
// function RSAB64Decrypt(ctext) {
// var h = b64tohex(ctext);
// if(h) return this.decrypt(h); else return null;
// }

// Added by @eschnou
function baToString(b) {
	var ret = "";
	for (var i=0; i < b.length; i++) {
		var c = b[i] & 255;
		if (c < 128) { // utf-8 decode
			ret += String.fromCharCode(c);
		} else if ((c > 191) && (c < 224)) {
			ret += String.fromCharCode(((c & 31) << 6) | (b[i + 1] & 63));
			++i;
		} else {
			ret += String.fromCharCode(((c & 15) << 12)
					| ((b[i + 1] & 63) << 6) | (b[i + 2] & 63));
			i += 2;
		}
	}
	return ret;
}

// protected
RSAKey.prototype.doPrivate = RSADoPrivate;
RSAKey.prototype.doPublic = RSADoPublic;

// public
RSAKey.prototype.setPrivate = RSASetPrivate;
RSAKey.prototype.setPrivateEx = RSASetPrivateEx;
RSAKey.prototype.generate = RSAGenerate;
RSAKey.prototype.decrypt = RSADecrypt;
RSAKey.prototype.setPublic = RSASetPublic;
RSAKey.prototype.encrypt = RSAEncrypt;
// RSAKey.prototype.b64_decrypt = RSAB64Decrypt;
// RSAKey.prototype.encrypt_b64 = RSAEncryptB64;

// exports
exports.Key = RSAKey;
exports.BigInteger = BigInteger;
exports.linebrk = linebrk;
exports.byte2Hex = byte2Hex;
exports.hex2b64 = B64.hex2b64;
exports.b64tohex = B64.b64tohex;
exports.b64toBA = B64.b64toBA;
exports.batoString = baToString;