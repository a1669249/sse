const eventTemplate = function(user, action) {
  return {
    timestamp: new Date(),
    user: user.role === "voter" ? `Voter` : `${user.role} (${user.username})`,
    action
  };
};

module.exports = eventTemplate;
