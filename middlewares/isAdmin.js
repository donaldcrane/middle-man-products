const isAdmin = (req, res, next) => {
    if (req.decoded.role !== 'Admin'){
      return res.status(401).json({
        status: 401,
        message: 'you are not an Admin'
      })
    }
   return next()
  }
  
  module.exports = isAdmin;