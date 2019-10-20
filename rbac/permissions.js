const PERMISSIONS = {
  voter: ["vote"],
  hasVoted: [],
  admin: ["createDelegate", "audit"],
  delegate: ["audit", "editBallot"]
};

module.exports = PERMISSIONS;
