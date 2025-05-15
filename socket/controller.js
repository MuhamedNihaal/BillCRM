import models from "../models/index.js";

export const profileAndPrivilege = (socket, io, accountSocketMap) => {
  try {
    const accountId = socket?.accountId; // user unique id

    const profileChangeStream = models.User.watch();

    profileChangeStream.on("change", async (_change) => {
			let doc = _change?.fullDocument;
      console.log(doc)
      let sameUser = accountSocketMap[accountId];
      if (sameUser) {
        sameUser.forEach((socketId) => {
          io.to(socketId).emit("profile-update", { name: "habeeb" });
        });
      }
    });

    socket.on("disconnect", () => {
      profileChangeStream.close();
    });
  } catch (error) {
    console.log("error occur from profile and privilage from socket");
    console.log(error);
  }
};

export const billingDiscount = (socket, io, accountSocketMap) => {
  try {
    const accountId = socket?.accountId; // user unique id

    

    socket.on("disconnect", () => {
      profileChangeStream.close();
    });
  } catch (error) {
    console.log("error occur from profile and privilage from socket");
    console.log(error);
  }
};
