import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { getSession } from "next-auth/client";
import { getSessionFromToken } from "./../../../middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let session = await getSessionFromToken({ req: req });
  if (!session || !session.user || !session.user.id) session = await getSession({ req: req });

  if (!session) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  if (req.method == "PATCH") {
    const startMins = req.body.start;
    const endMins = req.body.end;
    const bufferMins = req.body.buffer;

    const updateDay = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        startTime: startMins,
        endTime: endMins,
        bufferTime: bufferMins,
      },
    });

    res.status(200).json({ updateDay, message: "Start and end times updated successfully" });
  }
}
