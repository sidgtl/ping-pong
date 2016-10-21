var rsa = require("bignumber");
var key = new rsa.Key();

var message = "All your bases are belong to us.";
console.log("Message:\n"+message+"\n");

// Generate a key
key.generate(1024, "10001");
console.log("Key:\n");
console.log("n:" + key.n.toString(16));
console.log("e:" + key.e.toString(16));
console.log("d:" + key.d.toString(16));
console.log("\n");

// Encrypt
var encrypted = key.encrypt(message);
console.log("Encrypted:\n" + rsa.linebrk(encrypted, 64) + "\n" );

// Decrypt
var decrypted = key.decrypt(encrypted);
console.log("Decrypted:" + rsa.linebrk(decrypted, 64) + "\n");
