//creating agents token and saving it in cookies
const sendAgentToken = (user, statusCode, res) => {
  const token = user.getJwtToken();

  //cookies option
  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "none",
    secure: true,
  };

  res.status(statusCode).cookie("agent_token", token, options).json({
    success: true,
    user,
    token,
  });
};

module.exports = sendAgentToken;
