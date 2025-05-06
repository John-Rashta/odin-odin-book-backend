import prisma from "../config/client";

const getUserByNameForSession = async function getUserFromDatabaseByUsername(
    username: string,
  ) {
    const possibleUser = await prisma.user.findFirst({
      where: {
        username,
      },
    });
  
    return possibleUser;
  };
  
  const getUserForSession = async function getUserFromDatabase(id: string) {
    const possibleUser = await prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        username: true,
      },
    });
    return possibleUser;
  };

  export {
    getUserByNameForSession,
    getUserForSession
  }