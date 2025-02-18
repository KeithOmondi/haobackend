module.exports = (theFunc) => (req, res, next) =>{
    Promise.resolve(theFunc(req, req, next)).catch(next)
}