import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { IntegrationCalendar, listCalendars } from "../../../lib/calendarClient";
import { getSession } from "next-auth/client";
import { getSessionFromToken } from "./../../../middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let session = await getSessionFromToken({ req: req });
  if (!session || !session.user || !session.user.id) session = await getSession({ req: req });

  if (!session) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const currentUser = await prisma.user.findFirst({
    where: {
      id: session.user.id,
    },
    select: {
      credentials: true,
      timeZone: true,
      id: true,
    },
  });

  if (req.method == "POST") {
    await prisma.selectedCalendar.create({
      data: {
        user: {
          connect: {
            id: currentUser.id,
          },
        },
        integration: req.body.integration,
        externalId: req.body.externalId,
      },
    });
    res.status(200).json({ message: "Calendar Selection Saved" });
  }

  if (req.method == "DELETE") {
    await prisma.selectedCalendar.delete({
      where: {
        userId_integration_externalId: {
          userId: currentUser.id,
          externalId: req.body.externalId,
          integration: req.body.integration,
        },
      },
    });

    res.status(200).json({ message: "Calendar Selection Saved" });
  }

  if (req.method == "GET") {
    const selectedCalendarIds = await prisma.selectedCalendar.findMany({
      where: {
        userId: currentUser.id,
      },
      select: {
        externalId: true,
      },
    });

    const calendars: IntegrationCalendar[] = await listCalendars(currentUser.credentials);
    const selectableCalendars = calendars.map((cal) => {
      return { selected: selectedCalendarIds.findIndex((s) => s.externalId === cal.externalId) > -1, ...cal };
    });
    res.status(200).json(selectableCalendars);
  }
}
