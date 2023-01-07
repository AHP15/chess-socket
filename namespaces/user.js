const userNamespace = (socket) => {
  const challenges = socket.of('/challenges');

  challenges.on('connection', (socket) => {
    console.log("user connetced", socket.id);
  });
};

export default challengeNamespace;