import { NextApiRequest, NextApiResponse } from "next";
import { getRamens } from "../../lib/microCMS";
import { notAllowed, ok } from "../../lib/request";

const api = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    await getMethod(req, res);
  }
  notAllowed(res);
  return;
};

const getMethod = async (_req: NextApiRequest, res: NextApiResponse) => {
  const ramens = await getRamens();
  ok(res, ramens);
};

export default api;
