import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import type { Letters } from "./types";

export const getLetters = async () => {
  const token = 'eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlOTVlN2ExYi1jYjNkLTRiMjQtYmU2OC1lOWJkMDU1N2YyNTQiLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3Mjk3ODM2MzksImV4cCI6MTczMDM4ODQzOX0.4CFCvhQJypzgxfDoKOBdolpCB9Hj-cjLZQbnjzR9Yr16s-Q4nbUIjk1AXD1c72i9';
  
  const res = await ky.get("http://localhost:5000/api/letter",{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).json<Letters[]>();
  return res;
};

export const useLetters = () =>
  useQuery<Letters[]>({
    queryKey: ["Letters"],
    queryFn: () => getLetters(),
  });
