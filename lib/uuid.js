exports.generate = function (length, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], rnd = Math.random;
    length = length || 8;
    radix = radix || chars.length;
    for (var i = 0; i < length; i++) {
        uuid[i] = chars[0 | rnd()*radix];
    }
    return uuid.join('');
};