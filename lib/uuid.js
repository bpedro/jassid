var uuid_chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
exports.generate = function (length, radix) {
    var uuid = '', rnd = Math.random;
    length = length || 8;
    radix = radix || uuid_chars.length;
    for (var i = 0; i < length; i++) {
        uuid += uuid_chars[0 | rnd()*radix];
    }
    return uuid;
};