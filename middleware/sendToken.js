exports.sendToken = async (user, statusCode, res) => {
    const token = await user.getJwtToken();
    const options = {
        expiresIn: '1d',
        httpOnly: true,
    }
    res.status(statusCode).cookie('token', token, options).json({
        success:true,
        user,
        token
    });
}
