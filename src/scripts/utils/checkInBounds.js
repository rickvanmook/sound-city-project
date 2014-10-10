module.exports = function(elTop, elBottom, boundsTop, boundsBottom) {
	return (elTop < boundsBottom && elBottom > boundsTop)
}
