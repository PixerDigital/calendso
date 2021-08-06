import prisma from "../../lib/prisma";
import { getSession } from "next-auth/client";
import { getSessionFromToken } from "./../../middleware/auth";

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Check that user is authenticated
    let session = await getSessionFromToken({ req: req });
    if (!session || !session.user || !session.user.id) session = await getSession({ req: req });

    if (!session) {
      res.status(401).json({ message: "You must be logged in to do this" });
      return;
    }

    const credentials = await prisma.credential.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        type: true,
        key: true,
      },
    });

    res.status(200).json(credentials);
  }

  if (req.method == "DELETE") {
    let session = await getSessionFromToken({ req: req });
    if (!session || !session.user || !session.user.id) session = await getSession({ req: req });

    if (!session) {
      res.status(401).json({ message: "You must be logged in to do this" });
      return;
    }

    const id = req.body.id;

    const deleteIntegration = await prisma.credential.delete({
      where: {
        id: id,
      },
    });

    res.status(200).json({ message: "Integration deleted successfully" });
  }
}
