const authUser = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.json({ success: false, message: "Not Authorized. Please login again." });
    }

    const userId = authorization.split(' ')[1];

    // FIX: Attach to req instead of req.body
    req.userId = userId; 

    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authUser;