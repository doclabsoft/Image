goog.provide('DD.utils.GUID');

/**
 * Gets globally unique identifier.
 * @return {string}
 */
DD.utils.GUID.get = function () {
  var d = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16); // А зачем это тут?
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};

/**
 * Генерация имени переменной.
 * Используется для формирования названий полей источника,
 * для формирования идентификаторов элементов структуры.
 * @param {number=} [length=8]
 * @param {string=} [prefix='']
 * @return {string} String which can be evaluated! to a variable name.
 */
DD.utils.GUID.getVarName = function(length, prefix) {

  var s = prefix || '';
  var lettersNumber = length || 8; // || (2 + Math.floor(Math.random() * 4));
  lettersNumber = lettersNumber - s.length;
  var digitsNumber = 5;
  digitsNumber = Math.floor(lettersNumber/2);
  lettersNumber = lettersNumber - digitsNumber;

  var getChar = function(s) {
    return s.charAt(Math.floor(Math.random() * s.length));
  };

  for (var i = 0; i < lettersNumber; i++)
    s += getChar('abcdefghijklmnopqrstuvwxyz');
  for (i = 0; i < digitsNumber; i++)
    s += getChar('0123456789');
  return s;
};