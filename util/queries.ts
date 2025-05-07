import prisma from "../config/client";

const getUserByNameForSession = async function getUserFromDatabaseByUsername(
    username: string, pass = false
  ) {
    const possibleUser = await prisma.user.findFirst({
      where: {
        username,
      },
      select: {
        id: true,
        username: true,
        ...(pass ? {password: true} : {})
      }
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

  const createUser = async function createUserInDatabase(username: string, password: string, date: Date) {
    const possibleUser = await prisma.user.create({
      data: {
        username,
        password,
        joinedAt: date,
        icon: {
          connect: {
            id: 1
          }
        }
      }
    });

    return possibleUser;
  };

  export {
    getUserByNameForSession,
    getUserForSession
  }