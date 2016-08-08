// Addon method to Array prototype
// Checks if string is in array
Array.prototype.inArray = function (str) {
    for (var i = 0; i < this.length; i++) {
        if (this.indexOf(str) > - 1) return true;
    }
    return false;
};

// Addon method to Array prototype
// Removes string from array
Array.prototype.removeItem = function (str) {
    var i = this.indexOf(str);
    if (i !== -1) this.splice(i, 1);
    return this;
};